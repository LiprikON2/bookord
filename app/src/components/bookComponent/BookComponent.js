//@ts-check
///<reference path="typedefs.js" />

import debounce from "lodash/debounce";

import PageCounter from "./PageCounter";
import BookLoader from "./BookLoader";
import BookmarkManager from "./BookmarkManager";
import StateManager from "./StateManager";
import { template } from "./Template";

/**
 * Book web component
 */
export default class BookComponent extends HTMLElement {
    // Listen for changes in the book-page attribute
    static get observedAttributes() {
        return ["book-page"];
    }

    constructor() {
        super();

        this.attachShadow({ mode: "open" });

        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.rootElem = this.shadowRoot.getElementById("root");
        this.contentElem = this.shadowRoot.getElementById("book-content");

        this.componentStyle = getComputedStyle(this.rootElem);

        this.pageCounter = new PageCounter(this);
        this.bookLoader = new BookLoader(this);
        this.bookmarkManager = new BookmarkManager(this);
        this.stateManager = new StateManager(this);

        /**
         * @type {('loading'|'sectionReady'|'ready')} Status of initialization of the book, true when all of the book's sections are parsed
         */
        this.status = "loading";
        this.isQuitting = false;
    }

    /**
     * Loads book to the component, as well as runs a page counter
     * @param {Book | ParsedBook | any} bookObj - Entry of AllBooks object; contains information about book file and book metadata
     * @param {BookmarkList} bookmarkList - Interaction states of all of the books
     * @param {boolean} [isAlreadyParsed=false] - specifies which type of book object is passed: Book or ParsedBook
     * @return {Promise<void>}
     */
    async loadBook(bookObj, bookmarkList, isAlreadyParsed = false) {
        this.bookmarkManager.setBookmarkList(bookmarkList);
        const [initSectionIndex, initElementIndex] =
            this.bookmarkManager.getAutoBookmark();

        if (!isAlreadyParsed) {
            /**
             * @type {Promise<InitBook>} initBook
             */
            this.initBook = new Promise((resolve, reject) => {
                this.unlisten = window.api.receive(
                    "app:receive-init-book",
                    (initBook) => {
                        resolve(initBook);
                    }
                );
            });
            const bookPath = bookObj.bookFile.path;

            /**
             * @type {Promise<ParsedBook>}
             */
            this.book = this.importBook(bookPath, initSectionIndex);

            if (!this.book) {
                throw new Error("Couldn't load book.");
            }
        } else {
            // TODO Make it so a promise matches the interface of an unparsed book
            this.book = Promise.resolve(bookObj);
            this.status = "ready";
        }

        this.stateManager.currentSection = initSectionIndex;

        const position = {
            elementIndex: initElementIndex,
        };
        await this.loadSection(this.stateManager.currentSection, position);
        // Recount book pages every time bookComponent's viewport changes
        new ResizeObserver(() => this.recount()).observe(this.rootElem);
    }

    /**
     * Loads specified book section along with its styles, sets event listeners, updates UI and saves interaction progress
     * @param {number} sectionIndex - section number
     * @param {Object} [position] - TODO
     * @returns {Promise<void>}
     */
    // * @param {number} sectionPage - page within section
    // * @param {string} [offsetSelector] - shift to marker instead of specific page
    // * @param {number} [elementIndex] - shift to element by index of content elements instead of specific page
    async loadSection(sectionIndex, position) {
        const defaults = {
            sectionPage: { value: 0, isFromBack: false },
            elementIndex: null,
            elementSelector: "",
        };
        const pos = { ...defaults, ...position };

        // TODO refactor
        let book, section;
        if (this.status === "loading") {
            book = await this.initBook;
            this.status = "sectionReady";

            section = book.initSection;
            sectionIndex = book.initSectionIndex;
        } else {
            book = await this.book;
            section = this.getSection(book, sectionIndex);
        }

        console.log("book", sectionIndex, pos, book.sectionNames[sectionIndex]);

        this.bookLoader.loadStyles(book, section);
        this.bookLoader.loadContent(section);

        this.#navigateToPosition(sectionIndex, pos);

        this.attachLinkHandlers(book);
        this.attachImgEventEmitters();
    }

    /**
     * TODO
     * @param {number} sectionIndex - section number
     * @param {Object} position
     */
    #navigateToPosition(sectionIndex, { sectionPage, elementIndex, elementSelector }) {
        if (elementSelector || elementIndex) {
            this.#shiftToElement({ elementIndex, elementSelector });
        } else if (!sectionPage.isFromBack) {
            const firstPage = this.stateManager.section.firstPage;
            this.#shiftToSectionPage(firstPage);

            const targetPage = sectionPage.value;
            this.flipNPages(targetPage);
        } else if (sectionPage.isFromBack) {
            const lastPage = this.stateManager.section.lastPage;
            this.#shiftToSectionPage(lastPage);

            const targetPage = sectionPage.value;
            this.flipNPages(targetPage);
        }
        this.stateManager.updateBookSectionState(sectionIndex);

        this.bookmarkManager.emitSaveBookmarks();
    }

    /**
     * TODO
     * @param {Object} elementPosition
     */
    #shiftToElement({ element, elementIndex, elementSelector }) {
        if (elementIndex) {
            element = this.getElementByIndex(elementIndex);
        } else if (elementSelector) {
            element = this.shadowRoot.querySelector(elementSelector);
        }

        if (element) {
            const targetOffset = this.getElementOffset(element);
            this.#setOffset(targetOffset);
        } else {
            throw new Error("Couldn't find specified element");
        }
    }

    /**
     * Returns book's section object
     * @param {ParsedBook|any} book
     * @param {number} sectionIndex
     * @returns {Array<HtmlObject>}
     */
    getSection(book, sectionIndex) {
        if (sectionIndex > book.sections.length) {
            throw new Error("Requested section is out of range.");
        }
        return book.sections[sectionIndex];
    }

    /**
     * Imports book using IPC, completes initialization as soon as promise is resolved
     * @param  {string} filePath
     * @param  {number} sectionIndex
     * @returns {Promise<ParsedBook>}
     */
    importBook(filePath, sectionIndex) {
        const book = window.api
            .invoke("app:get-parsed-book", [filePath, sectionIndex])
            .catch();

        book.then(() => {
            this.status = "ready";
            this.stateManager.setInitBookInfo(this.book);
            this.emitSaveParsedBook();
        });

        return book;
    }

    /**
     * Handles clicks on book navigation links and website links
     * @param {Event} e - Event
     * @param {InitBook | ParsedBook} book
     * @returns {void}
     */
    handleLink(e, book) {
        e.preventDefault();
        /**
         * @type {HTMLAnchorElement | any}
         */
        const target = e.currentTarget;
        let [sectionName, markerId] = target.href.split("#").pop().split(",");
        markerId = "#" + markerId;

        const sectionIndex = book.sectionNames.findIndex(
            (section) => section === sectionName
        );

        if (sectionIndex !== -1) {
            const position = {
                markerId,
            };

            this.loadSection(sectionIndex, position);
        } else {
            // Opens link in external browser
            if (target.href) {
                window.open(target.href, "_blank");
            }
        }
    }

    /**
     * Updates book's UI elements such as book title, section title and page counters
     * @returns {void}
     */
    updateBookUi() {
        const currentSectionPage = this.stateManager.getCurrentSectionPage();
        const totalSectionPages = this.countSectionPages();

        const currentBookPage = this.stateManager.getCurrentBookPage();
        const totalBookPages = this.stateManager.getTotalBookPages();

        const uiState = {
            bookTitle: this.stateManager.bookTitle,
            currentSectionTitle: this.stateManager.currentSectionTitle,
            currentSectionPage: currentSectionPage,
            totalSectionPages: totalSectionPages,
            currentBookPage: currentBookPage,
            totalBookPages: totalBookPages,
        };
        this.emitUiStateUpdate(uiState);
    }

    /**
     * Emits "uiStateUpdate"
     * @param {UIState} state
     * @listens Event
     * @return {void}
     */
    emitUiStateUpdate(state) {
        const uiStateUpdateEvent = new CustomEvent("uiStateUpdate", {
            bubbles: true,
            cancelable: false,
            composed: true,
            detail: { state },
        });

        this.dispatchEvent(uiStateUpdateEvent);
    }

    /**
     * Attaches event handlers to anchor tags to handle book navigation
     * @param {InitBook | ParsedBook} book
     * @returns {void}
     */
    attachLinkHandlers(book) {
        const anchors = this.shadowRoot.querySelectorAll("a");
        anchors.forEach((a) => {
            a.addEventListener("click", (e) => {
                this.handleLink(e, book);
            });
        });
    }

    /**
     * Checks visibility of the element
     * @param {HTMLElement | any} elem
     * @returns {boolean[]} [isFullyVisible, isAtLeastPartiallyVisible]
     */
    checkVisibility(elem) {
        const currentOffset = this._getCurrentOffset();
        const displayWidth = this._getDisplayWidth();
        const columnGap = this._getColumnGap();
        const elemOffset = this.getElementOffset(elem);
        const elemWidth = elem.getBoundingClientRect().width;

        const elemStart = elemOffset;
        const elemEnd = elemOffset + elemWidth + columnGap;
        const visibleStart = currentOffset;
        const visibleEnd = currentOffset + displayWidth;

        const isFullyVisible = elemStart >= visibleStart && elemEnd <= visibleEnd;

        const partialVisibleStart = visibleStart - elemWidth - columnGap;
        const partialVisibleEnd = visibleEnd + elemWidth + columnGap;

        const isAtLeastPartiallyVisible =
            elemStart > partialVisibleStart && elemEnd < partialVisibleEnd;
        return [isFullyVisible, isAtLeastPartiallyVisible];
    }

    /**
     * Hides links' on another pages so they can't be navigated to with keyboard without flipping the page
     *
     * TODO improve with https://stackoverflow.com/a/1600194
     * and https://stackoverflow.com/a/30753870
     *
     * TODO what if the half of the link is on one page and the other half on another?
     * Will it screw up the offset on tabbing? https://stackoverflow.com/a/36603605
     *
     * @returns {void}
     */
    #hideInvisibleLinks() {
        const anchors = this.shadowRoot.querySelectorAll("a");
        anchors.forEach((a) => {
            const [_, isAtLeastPartiallyVisible] = this.checkVisibility(a);
            if (isAtLeastPartiallyVisible) {
                a.style.visibility = "initial";
                // a.removeAttribute("tabindex");
            } else {
                a.style.visibility = "hidden";
                // a.setAttribute("tabindex", "-1");
            }
        });
    }

    /**
     * Returns element's offset
     *
     * TODO set page based on provided element
     *
     * @param {HTMLElement | any} elem
     * @param {boolean} [round] - rounds elements offset to the left page edge
     * @returns {number}
     */
    getElementOffset(elem, round = true) {
        if (!elem) throw new Error("Cannot get element offset: elem is not provided.");
        const elemOffset = elem.offsetLeft;
        if (!round) {
            return elemOffset;
        }

        const displayWidth = this._getDisplayWidth();
        const columnGap = this._getColumnGap();

        let width = 0;
        while (width - columnGap < elemOffset) {
            width += displayWidth;
        }
        const leftEdge = width - displayWidth;
        return leftEdge;
    }

    /**
     * Sets pixel offset as a way to advance pages within a section
     * @param {string | number} nextOffset
     * @returns {void}
     */
    #setOffset(nextOffset) {
        this.contentElem.style.transform = `translate(-${nextOffset}px)`;
        // this.#hideInvisibleLinks(); // todo fix
        this.updateBookUi();
    }

    /**
     * TODO
     * @returns {number}
     */
    _getCurrentOffset() {
        // TODO make positive
        // Strips all non-numeric characters from a string
        const currentOffset = parseInt(
            this.contentElem.style.transform.replace(/[^\d.-]/g, "")
        );
        return Math.abs(currentOffset) ?? 0;
    }

    // todo as getter
    /**
     * Returns book content's width
     * @returns {number} - a positive number
     */
    _getDisplayWidth() {
        const columnGap = this._getColumnGap();
        return this.contentElem.offsetWidth + columnGap;
    }

    /**
     * Returns offset to the right edge of content
     * @returns {number} - a positive number of pixels
     */
    _getTotalDisplayWidth() {
        const columnGap = this.componentStyle.getPropertyValue("--column-gap");
        const totalWidth = this.contentElem.scrollWidth + parseInt(columnGap);

        return totalWidth;
    }

    /**
     * Returns the invisible column gap between the pages in pixels
     * @returns {number}
     */
    _getColumnGap() {
        return parseInt(this.componentStyle.getPropertyValue("--column-gap"));
    }

    /**
     * Returns the total amount of pages in section
     * @returns {number}
     */
    countSectionPages() {
        const totalWidth = this._getTotalDisplayWidth();
        const width = this._getDisplayWidth();

        const sectionPages = totalWidth / width;
        const rounded = Math.round(sectionPages);
        if (Math.abs(rounded - sectionPages) > 0.01)
            console.log(
                "Warning. countSectionPages rounding error",
                rounded,
                sectionPages
            );
        return rounded;
    }

    /**
     * Flips one page forward
     * @returns {void}
     */
    pageForward() {
        this.flipNPages(1);
    }

    /**
     * Flips one page backward
     * @returns {void}
     */
    pageBackward() {
        this.flipNPages(-1);
    }

    /**
     * Flips specified amout of pages forward or backwards
     * @param {number} n - book page
     * @returns {Promise<void>}
     */
    async flipNPages(n) {
        // if (this.status === "loading" || n === 0) return; // todo uncomment

        const firstPage = this.stateManager.section.firstPage;
        const lastPage = this.stateManager.section.lastPage;
        const currentPage = this.stateManager.getCurrentSectionPage();
        const requestedSectionPage = currentPage + n;

        const currentSection = this.stateManager.currentSection;
        const nextSection = currentSection + 1;
        const prevSection = currentSection - 1;

        const firstSection = 0;
        const lastSection = (await this.book).sectionsTotal;
        const doesNextSectionExist = nextSection <= lastSection;
        const doesPrevSectionExist = prevSection >= firstSection;

        const isInSucceedingSection =
            requestedSectionPage > lastPage && doesNextSectionExist;
        const isInPrecedingSection =
            requestedSectionPage < firstPage && doesPrevSectionExist;
        // Checks if requested page is within range of this section
        const isWithinThisSection = !isInPrecedingSection && !isInSucceedingSection;
        // Checks if requested page is within range of the book
        const pageIsNotInRange = !doesNextSectionExist && !doesPrevSectionExist;

        if (isWithinThisSection) {
            console.log("IS WITHIN");
            this.#shiftToSectionPage(requestedSectionPage);
        } else if (isInSucceedingSection && doesNextSectionExist) {
            console.log("NEXT");
            const requestedPageMinusThisSection = n - 1 - (lastPage - currentPage);
            const position = {
                sectionPage: { value: requestedPageMinusThisSection, isFromBack: false },
            };

            this.loadSection(nextSection, position);
        } else if (isInPrecedingSection && doesPrevSectionExist) {
            console.log("BACK");

            const requestedPageMinusThisSection = n + 1 - (firstPage - currentPage);
            const position = {
                sectionPage: { value: requestedPageMinusThisSection, isFromBack: true },
            };
            this.loadSection(prevSection, position);
        } else if (isInSucceedingSection && pageIsNotInRange) {
            this.#shiftToSectionPage(lastPage);
        } else if (isInPrecedingSection && pageIsNotInRange) {
            this.#shiftToSectionPage(firstPage);
        } else {
            console.log("TODO remove this else");
        }
    }

    /**
     * Jumps straight to the particular book page
     * @param {number} page - book page
     * @returns {void}
     */
    jumpToPage(page) {
        // if (this.status === "loading") return;
        // console.log("JUMP", page);
        // const validPage = this.#enforcePageRange(page);
        // const currentPage = this.stateManager.getCurrentBookPage();
        // const nPageShift = validPage - currentPage - 1;
        // const nextSection = this.stateManager.getSectionBookPageBelongsTo(validPage);
        // const currentSection = this.stateManager.currentSection;
        // // Avoid loading the loaded section again by flipping pages instead
        // if (nextSection === currentSection && nPageShift !== 0) {
        //     this.#shiftToSectionPage(nPageShift);
        // } else if (
        //     nextSection !== currentSection &&
        //     (this.status === "ready" || this.pageCounter.isCounting)
        // ) {
        //     console.log("TRUE JUMP");
        //     const sectionPagesArr = this.stateManager.sectionPagesArr;
        //     // Prevents the change of a section before the section is counted
        //     if (!this.stateManager.isSectionCounted(nextSection)) {
        //         console.log("not counted");
        //         return;
        //     }
        //     const sumOfPages = this.stateManager._sumFirstNArrayItems(
        //         sectionPagesArr,
        //         nextSection
        //     );
        //     // TODO rename
        //     const totalNextSectionPage = sectionPagesArr[nextSection];
        //     const currentNextSectionPage =
        //         currentPage + nPageShift - sumOfPages + totalNextSectionPage;
        //     this.loadSection(nextSection, currentNextSectionPage);
        // }
    }

    /**
     * Flips N pages of a book if they are within the section TODO
     * @param {number} page
     * @returns {void}
     */
    #shiftToSectionPage(page) {
        const displayWidth = this._getDisplayWidth();
        const newOffset = (page - 1) * displayWidth;
        console.log("SHIFT TO", newOffset);

        this.#setOffset(newOffset);
        this.bookmarkManager.emitSaveBookmarks();
    }

    /**
     * Returns page that is guranteed to be withing the borders of a book
     * @param {number} page - book page
     * @returns {number}
     */
    #enforcePageRange(page) {
        const minPage = 1;
        const maxPage = this.stateManager.getTotalBookPages();
        if (page < minPage) {
            page = minPage;
        } else if (page > maxPage) {
            page = maxPage;
        }
        return page;
    }

    /**
     * Returns element by the index of descendant elements of contentElem
     * @param {number} index - index of element
     * @returns {Element}
     */
    getElementByIndex(index) {
        const allElems = this.contentElem.querySelectorAll("*");
        return allElems[index];
    }

    /**
     * Emits "saveBookmarksEvent" when the book is fully parsed
     * @listens Event
     * @return {Promise<void>}
     */
    async emitSaveParsedBook() {
        const saveParsedBookEvent = new CustomEvent("saveParsedBookEvent", {
            bubbles: true,
            cancelable: false,
            composed: true,
            detail: { parsedBook: await this.book },
        });

        // this.dispatchEvent(saveParsedBookEvent); // todo uncomment
    }

    /**
     * Attaches event emitter to img tags to handle open modals on click
     * @returns {void}
     */
    attachImgEventEmitters() {
        const images = this.shadowRoot.querySelectorAll("img");

        images.forEach((img) => {
            img.addEventListener("click", (e) =>
                img.addEventListener("click", this.emitImgClickEvent)
            );
        });
    }

    /**
     * Emits "imgClickEvent" for when the img tag is clicked
     * @param {Event} e - Event
     * @listens Event
     * @return {void}
     */
    emitImgClickEvent(e) {
        /**
         * @type {HTMLImageElement | any}
         */
        const target = e.target;
        const imgClickEvent = new CustomEvent("imgClickEvent", {
            bubbles: true,
            cancelable: false,
            composed: true,
            detail: { src: target.src },
        });

        this.dispatchEvent(imgClickEvent);
    }

    /**
     * Recalculates page count
     * @returns {void}
     */
    recount = debounce(
        () => {
            if (this.isQuitting) return;

            if (!this.pageCounter.isCounting) {
                // Get a reference to a visible element
                const element = this.bookmarkManager.getVisibleElement();
                if (!element) {
                    // TODO sometimes errors out
                    console.log("null in recount");
                    return;
                }

                const newOffset = this.getElementOffset(element);
                this.#setOffset(newOffset);

                // TODO this.createCounterComponent();
                this.pageCounter.start();
            } else {
                this.recount();
            }
        },
        1000,
        { trailing: true }
    );

    disconnectedCallback() {
        if (this.unlisten) this.unlisten();
        this.isQuitting = true;

        // TODO terminate recounting properly
        // TODO call quit on all classes
        // Cancel debounces
        this.recount.cancel();
        this.bookmarkManager.emitSaveBookmarks.cancel();

        // TODO check if this does something
        delete this.initBook;
        delete this.book;
    }

    /**
     * Runs everytime web component's listened attribute changes.
     * @param {string} name
     * @param {string | undefined} oldValue
     * @param {string | undefined} newValue
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "book-page" && oldValue) {
            const updatedPage = parseInt(newValue);
            this.jumpToPage(updatedPage);
        }
    }
}

window.customElements.define("book-component", BookComponent);
