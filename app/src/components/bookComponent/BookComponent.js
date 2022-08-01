//@ts-check
///<reference path="../../pages/types/index.d.ts" />
///<reference path="typedefs.js" />

import debounce from "lodash/debounce";
import PageCounter from "./PageCounter";
import StyleLoader from "./StyleLoader";
import BookmarkManager from "./BookmarkManager";
import { template } from "./template";

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
        this.styleLoader = new StyleLoader(this);
        this.bookmarkManager = new BookmarkManager(this);

        /**
         * @type {('loading'|'sectionReady'|'ready')} Status of initialization of the book, true when all of the book's sections are parsed
         */
        this.status = "loading";
        this.isQuitting = false;
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
            this.emitSaveParsedBook();
        });

        return book;
    }

    /**
     * Recursively extracts section (chapter) title from book's TOC
     * @param {InitBook | ParsedBook} book
     * @param {HtmlObject} toc - Table of Contents
     * @param {number} sectionIndex - Section index
     * @param {boolean} [root] - A way to differentiate between recursive and non-recursive function call
     * @returns {string}
     */
    recGetSectionTitle(book, toc, sectionIndex, root = true) {
        let descendantSectionTitle;
        for (let tocEntry of toc) {
            const tocEntryChildren = tocEntry?.children;
            if (tocEntryChildren) {
                descendantSectionTitle = this.recGetSectionTitle(
                    book,
                    tocEntryChildren,
                    sectionIndex,
                    false
                );
                if (descendantSectionTitle) break;
            }
        }
        const tocEntry = toc.find(
            (tocEntry) => tocEntry.sectionId === book.sectionNames[sectionIndex]
        );
        const sectionTitle = tocEntry?.name;

        if (descendantSectionTitle) {
            return descendantSectionTitle;
        } else if (sectionTitle) {
            return sectionTitle;
        } else if (
            root &&
            sectionIndex >= 0 &&
            sectionIndex < this.bookState.totalSections
        ) {
            const prevSectionTitle = this.recGetSectionTitle(book, toc, sectionIndex - 1);
            return prevSectionTitle;
        } else {
            return "";
        }
    }

    /**
     * Returns book's section object
     * @param {ParsedBook|any} book
     * @param {number} sectionIndex
     * @returns {Array<HtmlObject>}
     */
    getSection(book, sectionIndex) {
        return book.sections[sectionIndex];
    }

    /**
     * Recursively creates and appends child elements to the respective child's parent
     * @param {HTMLElement} parent
     * @param {HtmlObject} children
     * @returns {void}
     */
    recCreateElements(parent, children) {
        children.map((element) => {
            if (element?.tag !== undefined) {
                const tag = document.createElement(element.tag);
                if (element?.attrs !== undefined) {
                    Object.keys(element.attrs).forEach((attr) => {
                        const attrVal = element.attrs[attr];

                        if (attrVal !== undefined) {
                            tag.setAttribute(attr, attrVal);
                        }
                    });
                }
                if (element?.children !== undefined) {
                    this.recCreateElements(tag, element.children);
                }
                parent.appendChild(tag);
            } else {
                const textNode = document.createTextNode(element.text);
                parent.appendChild(textNode);
            }
        });
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
            this.loadSection(sectionIndex, 0, markerId);
        } else {
            // Opens link in external browser
            if (target.href) {
                window.open(target.href, "_blank");
            }
        }
    }

    /**
     * Loads book's content and appends a end-marker to it
     * @param {HtmlObject} section
     * @returns {Promise<void>}
     */
    async loadContent(section) {
        this.contentElem.innerHTML = "";
        // Remove head tag from section
        section = section.slice(1);
        this.recCreateElements(this.contentElem, section);
    }

    /**
     * Updates book's UI elements such as book title, section title and page counters
     * @returns {void}
     */
    updateBookUi() {
        const currentSectionPage = this.bookState.getCurrentSectionPage() + 1;
        const totalSectionPages = this.countSectionPages();

        const currentBookPage = this.bookState.getCurrentBookPage() + 1;
        const totalBookPages = this.bookState.getTotalBookPages();

        const uiState = {
            bookTitle: this.bookState.bookTitle,
            currentSectionTitle: this.bookState.currentSectionTitle,
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
     * Updates book's state
     * @param {InitBook | ParsedBook} book
     * @param {number} currentSection
     * @returns {void}
     */
    updateBookSectionState(book, currentSection) {
        this.bookState.currentSection = currentSection;
        this.bookState.totalSections = book.sectionsTotal;
        this.bookState.bookTitle = book.info.title;
        this.bookState.currentSectionTitle = this.recGetSectionTitle(
            book,
            book.structure,
            this.bookState.currentSection
        );
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
     * Loads specified book section along with its styles, sets event listeners, updates UI and saves interaction progress
     * @param {number} sectionIndex - sections number
     * @param {number} sectionPage - page within section
     * @param {string} [offsetSelector] - shift to marker instead of specific page
     * @param {number} [elementIndex] - shift to element by index of content elements instead of specific page
     * @returns {Promise<void>}
     */
    async loadSection(sectionIndex, sectionPage, offsetSelector = "", elementIndex = 0) {
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

        console.log(
            "book",
            sectionIndex,
            sectionPage,
            offsetSelector,
            book.sectionNames[sectionIndex]
        );

        this.styleLoader.loadStyles(book, section);
        this.loadContent(section);

        // In case element selector provided instead of section page is used
        // or user traveled back from the subsequent section back
        if (offsetSelector) {
            const targetElem = this.shadowRoot.querySelector(offsetSelector);
            // TODO sometimes errors out
            if (!targetElem) {
                console.log("null in loadSection");
            }
            if (targetElem) {
                const targetOffset = this.getElementOffset(targetElem);
                // Set offset to the last page (if it's the end-marker) of this section
                this.setOffset(targetOffset);
            }
        } else if (elementIndex) {
            const targetElem = this.getElementByIndex(elementIndex);
            const targetOffset = this.getElementOffset(targetElem);

            this.setOffset(targetOffset);
        } else {
            // Set offset to the first page of this section
            this.setOffset(0);
        }

        this.updateBookSectionState(book, sectionIndex);
        this.updateBookUi();

        // In case user traveled from previous section and
        // still had pages pending to shift through
        if (sectionPage !== 0) {
            this.#shiftNPages(sectionPage);
        }

        this.attachLinkHandlers(book);
        this.attachImgEventEmitters();

        this.bookmarkManager.emitSaveBookmarks();
    }

    /**
     * Checks visibility of the element
     * @param {HTMLElement | any} elem
     * @returns {boolean[]} [isFullyVisible, isAtLeastPartiallyVisible]
     */
    checkVisibility(elem) {
        const currentOffset = Math.abs(this.bookState._getCurrentOffset());
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
     * @returns {void}
     */
    markVisibleLinks() {
        const anchors = this.shadowRoot.querySelectorAll("a");
        anchors.forEach((a) => {
            const [_, isAtLeastPartiallyVisible] = this.checkVisibility(a);
            if (isAtLeastPartiallyVisible) {
                a.style.visibility = "initial";
            } else {
                a.style.visibility = "hidden";
            }
        });
    }

    /**
     * Returns element's offset
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
    setOffset(nextOffset) {
        this.contentElem.style.transform = `translate(-${nextOffset}px)`;
        this.markVisibleLinks();
    }

    // TODO refactor
    /**
     * Calculates how many pixels text needs to be offsetted in order to shift N section pages
     * @param {number} nPageShift
     * @returns {number}
     */
    calcShiftedOffset(nPageShift) {
        const displayWidth = this._getDisplayWidth();
        const currentOffset = -this.bookState._getCurrentOffset();
        const shiftOffset = nPageShift * displayWidth;
        return currentOffset + shiftOffset;
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
     * Returns book content's width
     * @returns {number} - a positive number
     */
    _getDisplayWidth() {
        const columnGap = this._getColumnGap();
        return this.contentElem.offsetWidth + columnGap;
    }

    /**
     * Returns the total amount of pages in section
     * @returns {number}
     */
    countSectionPages() {
        const totalWidth = this._getTotalDisplayWidth();
        const width = this._getDisplayWidth();

        return Math.round(totalWidth / width);
    }

    /**
     * Flips N pages of a book
     * @param {number} n
     * @returns {void}
     */
    #shiftNPages(n) {
        if (this.status === "loading") return;

        const minPageNum = 0;
        const maxPageNum = this.countSectionPages();
        const currentPage = this.bookState.getCurrentSectionPage();
        const nextSectionPage = currentPage + n;

        // Checks if requested page is in range of this section
        if (nextSectionPage >= minPageNum && nextSectionPage <= maxPageNum) {
            const newOffset = this.calcShiftedOffset(n);

            this.setOffset(newOffset);
            this.updateBookUi();
            this.bookmarkManager.emitSaveBookmarks();
        }
    }

    /**
     * Returns page that is guranteed to be withing the borders of a book
     * @param {number} page - book page
     * @returns {number}
     */
    #enforcePageRange(page) {
        const minPage = 1;
        const maxPage = this.bookState.getTotalBookPages();
        if (page < minPage) {
            page = minPage;
        } else if (page > maxPage) {
            page = maxPage;
        }
        return page;
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
     * Flips specified amout of pages forward or backward
     * @param {number} n - book page
     * @returns {void}
     */
    flipNPages(n) {
        const currentPage = this.bookState.getCurrentBookPage() + 1;
        this.jumpToPage(currentPage + n);
    }

    /**
     * Jumps straight to the particular book page
     * @param {number} page - book page
     * @returns {void}
     */
    jumpToPage(page) {
        if (this.status === "loading") return;
        const validPage = this.#enforcePageRange(page);

        const currentPage = this.bookState.getCurrentBookPage();
        const nPageShift = validPage - currentPage - 1;

        const nextSection = this.bookState.getSectionBookPageBelongsTo(validPage);
        const currentSection = this.bookState.currentSection;

        // Avoid loading the loaded section again by flipping pages instead
        if (nextSection === currentSection && nPageShift !== 0) {
            this.#shiftNPages(nPageShift);
        } else if (
            nextSection !== currentSection &&
            (this.status === "ready" || this.pageCounter.isCounting)
        ) {
            const sectionPagesArr = this.bookState.sectionPagesArr;

            // Prevents the change of a section before the section is counted
            if (!this.bookState.isSectionCounted(nextSection)) {
                return;
            }
            const sumOfPages = this.bookState._sumFirstNArrayItems(
                sectionPagesArr,
                nextSection
            );
            // TODO rename
            const totalNextSectionPage = sectionPagesArr[nextSection];
            const currentNextSectionPage =
                currentPage + nPageShift - sumOfPages + totalNextSectionPage;

            this.loadSection(nextSection, currentNextSectionPage);
        }
    }

    /**
     * Loads book to the web component, as well as runs a page counter
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
                return;
            }
        } else {
            // TODO Make it so a promise matches the interface of an unparsed book
            this.book = Promise.resolve(bookObj);
            this.status = "ready";
        }

        this.bookState = this.#createBookState(this, initSectionIndex);

        await this.loadSection(this.bookState.currentSection, 0, "", initElementIndex);
        // Recount book pages every time bookComponent's viewport changes
        new ResizeObserver(() => this.recount()).observe(this.rootElem);
    }

    #createBookState(bookComponent, currentSection) {
        return {
            bookComponent,
            currentSection,
            totalSections: 0,

            getSectionBookPageBelongsTo(page) {
                const sliceOfPages = [];
                for (const [index, pageCount] of this.sectionPagesArr.entries()) {
                    sliceOfPages.push(pageCount);
                    const sumOfPages = sliceOfPages.reduce(
                        (prevValue, currValue) => prevValue + currValue
                    );
                    if (page <= sumOfPages) return index;
                }
                throw new Error("Couldn't get section book page belonged to.");
            },

            // Zero-based
            getCurrentSectionPage() {
                const displayWidth = this.bookComponent._getDisplayWidth();
                const currentOffset = this._getCurrentOffset();
                const currentPage = Math.abs(currentOffset / displayWidth);
                return currentPage;
            },
            getTotalSectionPages(sectionIndex) {
                return this.sectionPagesArr[sectionIndex];
            },

            sectionPagesArr: [0],
            isSectionCounted(section) {
                return !!this.sectionPagesArr[section];
            },
            getCurrentBookPage() {
                const sumOfPages = this._sumFirstNArrayItems(
                    this.sectionPagesArr,
                    this.currentSection
                );
                const totalSectionPages = this.getTotalSectionPages(this.currentSection);
                const totalSectionPages2 = this.bookComponent.countSectionPages();
                const currentSectionPage = this.getCurrentSectionPage();

                // TODO
                // console.log(
                //     sumOfPages,
                //     totalSectionPages,
                //     "vs",
                //     totalSectionPages2,
                //     currentSectionPage
                // );
                return sumOfPages - totalSectionPages2 + currentSectionPage;
            },
            getTotalBookPages() {
                const totalBookPages = this.sectionPagesArr.reduce(
                    (prevValue, currValue) => prevValue + currValue
                );
                return totalBookPages;
            },

            bookTitle: "",
            currentSectionTitle: "",

            _sumFirstNArrayItems(array, n) {
                const arraySlice = array.slice(0, n + 1);
                const arraySum = arraySlice.reduce(
                    (prevValue, currValue) => prevValue + currValue
                );
                return arraySum;
            },
            _getCurrentOffset() {
                // TODO make positive
                // Strips all non-numeric characters from a string
                return (
                    // @ts-ignore
                    parseInt(
                        bookComponent.contentElem.style.transform.replace(/[^\d.-]/g, "")
                    ) ?? 0
                );
            },
        };
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

        this.dispatchEvent(saveParsedBookEvent);
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
                this.setOffset(newOffset);

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
