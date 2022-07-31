//@ts-check
///<reference path="../types/index.d.ts" />
import debounce from "lodash/debounce";

const style = /*css*/ `
    :host {
        --book-component-width: 400px;
        --book-component-height: 600px;
        --column-gap: 100px;

        --clr-link: #4dabf7; /* todo move it to somewhere else */
    }

    :any-link {
        color: var(--clr-link) !important;
    }

    .book-container {
        max-width: 30rem;
        height: 85vh;
        height: 80vh;
        height: 100%;

        margin: auto;
        overflow: hidden;
    }
    .book-container > #book-content {
        width: 100%;
        height: 100%;

        columns: 1;
        column-gap: var(--column-gap);
    }

    .book-container img {
        display: block !important;
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
        object-fit: contain;
        cursor: zoom-in;
    }
`;

const template = document.createElement("template");
template.innerHTML = /*html*/ `
    <section id="root" class="book-container">
        <style id="book-style"></style>
        <style id="component-style">
            ${style}
        </style>
      
        <div id="book-content"></div>
        
    </section>
`;

/** Book file
 * @typedef {Object} BookFile
 * @property {string} name - Book's filename
 * @property {string} path - Path to the book file
 * @property {string} size - Size of the book file in kilobytes
 */

/** Book metadata information
 * @typedef {Object} Info
 * @property {string} title - Book's title
 * @property {Array<string>} idetifiers - List of book's identifiers (such as a UUID, DOI or ISBN)
 * @property {Array<string>} languages - List of language codes that correspond to languages used in the book
 * @property {Array<string>} relations - List of book's relations
 * @property {Array<string>} subjects - List of book's genres
 * @property {Array<string>} publishers - List of book's publishers
 * @property {Array<string>} contributors - List of book's contributors
 * @property {Array<string>} coverages - List of book's coverage information
 * @property {Array<string>} rights - List of book's copyright information
 * @property {Array<string>} sources - List of book's sources
 * @property {string} description - Book's description
 * @property {string} date - Book's publication date (ISO8601)
 * @property {string} cover - Base64-encoded cover image
 * @property {string} author - Author (creator) of the book
 */

/** Dictionary of books which contains information about book file and book metadata.
 * Book filename is used as a key
 * @typedef {Object} AllBooks
 * @property {Book} BookFile.name - Name of the book file, used as a key to the book entry
 */

/** An entry of AllBooks object; contains information about book file and book metadata
 * @typedef {Object} Book
 * @property {BookFile} bookFile - Book file
 * @property {Info} info - Book metadata
 */

/** List of recently visited (and parsed) books, 0th is last opened book
 * @typedef {ParsedBook[]} RecentBooks
 */

/** Book object which contains parsed sections
 * @typedef {Object} ParsedBook
 * @property {Info} info - Book metadata information
 * @property {Array<HtmlObject>} styles - Book's stylesheets
 * @property {HtmlObject} structure - Book's parsed Table Of Contents (TOC)
 * @property {number} sectionsTotal - Book's total number of section
 * @property {Array<string>} sectionNames - List of section ids (names)
 * @property {number} initSectionIndex - Number that corresponds the book's initally parsed section
 * @property {Array<HtmlObject>} initSection - Initially parsed book section
 * @property {Array<HtmlObject>} sections - Sections
 * @property {string} name - Book's filename
 */

/** Book with only one section parsed, used while the rest of the book is being parsed
 * @typedef {Object} InitBook
 * @property {Info} info - Book metadata information
 * @property {Array<HtmlObject>} styles - Book's stylesheets
 * @property {HtmlObject} structure - Book's parsed Table Of Contents (TOC)
 * @property {number} sectionsTotal - Book's total number of section
 * @property {Array<string>} sectionNames - List of section ids (names)
 * @property {number} initSectionIndex - Number that corresponds the book's initally parsed section
 * @property {Array<HtmlObject>} initSection - Initially parsed book section
 * @property {string} name - Book's filename
 */

/** Dictionary of books' bookmarks. Book filename is used as a key to a specific book's bookmark list
 * @typedef {Object} Bookmarks
 * @property {BookmarkList} BookFile.name
 */

/** List of all of the bookmarks a particular book has
 * @typedef {Bookmark[]} BookmarkList
 */

/** A bookmark, used to indicate a specific part of the specific section of the book
 * @typedef {Object} Bookmark
 * @property {number} sectionIndex - Index of the book's section
 * @property {number} elementIndex - Index of descendant elements of contentElem, which is used to mark a specific part of a section
 */

/**
 * @typedef {Object} Event
 * @param {HTMLInputElement} currentTarget
 */

/** HTML & XML parsed to the JavaScript object
 * @typedef {Array<Object>} HtmlObject
 * @property {string|undefined} [name]
 * @property {string|undefined} [text]
 * @property {Attrs|undefined} [attrs]
 * @property {string|undefined} [sectionId]
 * @property {string|undefined} [href]
 * @property {string|undefined} [_data] - HTML content as a string
 * @property {string|undefined} [tag] - HTML tag
 * @property {number|undefined} [type] - Value of 3 corresponds to the text node
 * @property {HtmlObject|undefined} [children]
 */

/** HtmlObject's Attributes
 * @typedef {Object} Attrs
 * @property {string|undefined} [id]
 * @property {string|undefined} [href]
 * @property {string|undefined} [src]
 *
 */

/** Book state for the purposes of displaying
 * @typedef {Object} UIState
 * @property {string} bookTitle
 * @property {string} currentSectionTitle
 * @property {number} currentSectionPage
 * @property {number} totalSectionPages
 * @property {number} currentBookPage
 * @property {number} totalBookPages
 *
 */

/**
 * Book web component
 */
class BookComponent extends HTMLElement {
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

        /**
         * @type {('loading'|'sectionReady'|'ready'|'resizing')} Status of initialization of the book, true when all of the book's sections are parsed
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
     * Returns all references to stylesheet names in a section
     * @param {HtmlObject} section
     * @returns {Array<string>}
     */
    getSectionStyleReferences(section) {
        // First tag of a section is the head tag
        const headLinks = section[0].children.filter((elem) => {
            return elem.tag === "link";
        });

        const sectionStyles = headLinks.map((link) => link?.attrs?.href);
        return sectionStyles;
    }

    /**
     * Returns inline styles of a particular book section
     * @param {HtmlObject} section
     * @returns {string}
     */
    getSectionInlineStyles(section) {
        const headStyles = section[0].children.filter((elem) => {
            return elem.tag === "style";
        });
        return headStyles[0]?.children?.[0]?.text ?? "";
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
     * Collects book's styles and applies them to the web component
     * @param {InitBook|ParsedBook} book
     * @param {Array<HtmlObject>} section
     * @returns {Promise<void>}
     */
    async loadStyles(book, section) {
        const styleElem = this.shadowRoot.getElementById("book-style");

        const sectionStyles = this.getSectionStyleReferences(section);
        const inlineStyles = this.getSectionInlineStyles(section);

        styleElem.innerHTML = inlineStyles;

        // Appends all of the referenced
        // styles to the style element
        Object.keys(book.styles).forEach((index) => {
            const bookStyle = book.styles[index];
            if (sectionStyles.includes(bookStyle.href)) {
                styleElem.innerHTML += bookStyle._data;
            }
        });
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
     * @listens Event
     * @returns {void}
     */
    handleLink(e, book) {
        e.preventDefault();
        let [sectionName, markerId] = e.currentTarget.href.split("#").pop().split(",");
        markerId = "#" + markerId;

        const sectionIndex = book.sectionNames.findIndex(
            (section) => section === sectionName
        );

        if (sectionIndex !== -1) {
            this.loadSection(sectionIndex, 0, markerId);
        } else {
            // Opens link in external browser
            if (e.currentTarget.href) {
                window.open(e.currentTarget.href, "_blank");
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
        const currentSectionPage = this.bookState.getCurrentSectionPage(this) + 1;
        const totalSectionPages = this.countSectionPages();

        const currentBookPage = this.bookState.getCurrentBookPage(this) + 1;
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
     * Updates current position inside the book and, optionally, adds additional bookmark
     * @param {Bookmark} [newBookmark]
     * @returns {void}
     */
    updateBookmarkList(newBookmark) {
        const element = this.getVisibleElement();
        if (!element) return;

        const elementIndex = this.getElementIndex(element);
        const currentSection = this.bookState.currentSection;

        // TODO add abstraction to 0th bookmark
        this.bookmarkList[0].sectionIndex = currentSection;
        this.bookmarkList[0].elementIndex = elementIndex;
        if (newBookmark) {
            this.bookmarkList.push(newBookmark);
        }
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

        this.loadStyles(book, section);
        this.loadContent(section);

        // In case element selector provided instead of section page is used
        // or user traveled back from the subsequent section back
        if (offsetSelector) {
            const targetElem = this.shadowRoot.querySelector(offsetSelector);
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

        this.emitSaveBookmarks();
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
        const currentPage = this.bookState.getCurrentSectionPage(this);
        const nextSectionPage = currentPage + n;

        // Checks if requested page is in range of this section
        if (nextSectionPage >= minPageNum && nextSectionPage <= maxPageNum) {
            const newOffset = this.calcShiftedOffset(n);

            this.setOffset(newOffset);
            this.updateBookUi();
            this.emitSaveBookmarks();
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
        const currentPage = this.bookState.getCurrentBookPage(this) + 1;
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

        const currentPage = this.bookState.getCurrentBookPage(this);
        const nPageShift = validPage - currentPage - 1;

        const nextSection = this.bookState.getSectionBookPageBelongsTo(validPage);
        const currentSection = this.bookState.currentSection;

        // Avoid loading the loaded section again by flipping pages instead
        if (nextSection === currentSection && nPageShift !== 0) {
            this.#shiftNPages(nPageShift);
        } else if (
            nextSection !== currentSection &&
            (this.status === "ready" || this.status === "resizing")
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
     * Creates another web component which is used to count pages of a book, and then destroys it
     * @return {Promise<any>}
     */
    // async createCounterComponent() {
    //     this.status = "resizing";
    //     /** Create a counter`component inside the current component
    //      * @type {BookComponent}
    //      */
    //     // @ts-ignore
    //     const counterComponent = document.createElement("book-component");
    //     this.shadowRoot.appendChild(counterComponent);

    //     // Make it hidden
    //     const rootElem = counterComponent.shadowRoot.getElementById("root");
    //     rootElem.style.visibility = "hidden";
    //     rootElem.style.position = "absolute";

    //     await counterComponent.#countBookPages(this);
    //     this.status = "ready";
    //     counterComponent.remove();
    // }

    // TODO move to utility
    /**
     * Asynchronous version of a forEach
     * @param {Array} array
     * @param {*} callback
     * @returns {Promise<void>}
     */
    // async _asyncForEach(array, callback) {
    //     for (let index = 0; index < array.length; index++) {
    //         await callback(array[index], index, array);
    //     }
    // }

    /**
     * Asynchronously and non-blockingly counts pages of a book with a help of a parent web component
     * @param {BookComponent} parentComponent - instance of a parent web component which created this counter web component
     * @returns {Promise<void>}
     */
    // async #countBookPages(parentComponent) {
    //     // TODO move to utility
    //     /**
    //      * Splits code in chunks
    //      * https://stackoverflow.com/a/67135932/10744339
    //      * @returns {Promise<void>}
    //      */
    //     const _waitForNextTask = () => {
    //         // @ts-ignore
    //         const { port1, port2 } = (_waitForNextTask.channel ??= new MessageChannel());

    //         return new Promise((resolve) => {
    //             port1.addEventListener("message", () => resolve(), { once: true });
    //             port1.start();
    //             port2.postMessage("");
    //         });
    //     };

    //     const book = await parentComponent.book;

    //     parentComponent.bookState.sectionPagesArr = [];

    //     // TODO start counting pages near where user left off (0th bookmark)
    //     await this._asyncForEach(book.sectionNames, async (sectionName, sectionIndex) => {
    //         const section = this.getSection(book, sectionIndex);
    //         await this.loadStyles(book, section);
    //         await this.loadContent(section);

    //         const totalSectionPages = this.countSectionPages();

    //         parentComponent.bookState.sectionPagesArr.push(totalSectionPages);
    //         // Update page count every 10 sections
    //         if (sectionIndex % 10 === 0) {
    //             parentComponent.updateBookUi();
    //         }
    //         await _waitForNextTask();
    //     });

    //     parentComponent.updateBookUi();
    // }

    /**
     * Loads book to the web component, as well as runs a page counter
     * @param {Book | ParsedBook | any} bookObj - Entry of AllBooks object; contains information about book file and book metadata
     * @param {BookmarkList} bookmarkList - Interaction states of all of the books
     * @param {boolean} [isAlreadyParsed=false] - specifies which type of book object is passed: Book or ParsedBook
     * @return {Promise<void>}
     */
    async loadBook(bookObj, bookmarkList, isAlreadyParsed = false) {
        this.bookmarkList = bookmarkList.length
            ? bookmarkList
            : [{ sectionIndex: 0, elementIndex: 0 }];
        const initSectionIndex = this.bookmarkList[0].sectionIndex;
        const initElementIndex = this.bookmarkList[0].elementIndex;

        if (!isAlreadyParsed) {
            console.log("###> Parsing");

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
            console.log("###> Is already parsed");
            // TODO Make it so a promise matches the interface of an unparsed book
            this.book = Promise.resolve(bookObj);
            this.status = "ready";
        }

        this.bookState = this.createBookState(this, initSectionIndex);

        await this.loadSection(this.bookState.currentSection, 0, "", initElementIndex);
        // Recount book pages everytime bookComponent's viewport changes
        new ResizeObserver(() => this.recount()).observe(this.rootElem);
    }

    createBookState(bookComponent, currentSection) {
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
            getCurrentSectionPage(that) {
                const displayWidth = that._getDisplayWidth();
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
            getCurrentBookPage(that) {
                const sumOfPages = this._sumFirstNArrayItems(
                    this.sectionPagesArr,
                    this.currentSection
                );
                const totalSectionPages = this.getTotalSectionPages(this.currentSection);
                const totalSectionPages2 = that.countSectionPages();
                const currentSectionPage = this.getCurrentSectionPage(that);

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
     * Returns selector of an element based on nth-child with respect to content element
     * @param {HTMLElement} element
     * @returns {number}
     */
    getElementIndex(element) {
        const allElems = this.contentElem.querySelectorAll("*");
        let nthElement;
        [...allElems].some((elem, index) => {
            const isFound = elem === element;
            if (isFound) {
                nthElement = index;
            }
            return isFound;
        });
        return nthElement;
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
     * Emits "saveBookmarksEvent" when the page is turned
     * @param {Event} e - Event
     * @listens Event
     * @return {void}
     */
    emitSaveBookmarks = debounce((e) => {
        let book;
        if (this.status !== "sectionReady") {
            book = this.book;
        } else {
            book = this.initBook;
        }
        book.then(({ name: bookName }) => {
            this.updateBookmarkList();
            const saveBookmarksEvent = new CustomEvent("saveBookmarksEvent", {
                bubbles: true,
                cancelable: false,
                composed: true,
                detail: {
                    bookName,
                    bookmarkList: this.bookmarkList,
                },
            });

            this.dispatchEvent(saveBookmarksEvent);
        });
    }, 500);
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
        const imgClickEvent = new CustomEvent("imgClickEvent", {
            bubbles: true,
            cancelable: false,
            composed: true,
            detail: { src: e.target.src },
        });

        this.dispatchEvent(imgClickEvent);
    }

    /**
     * Returns currently fully visible or partially visible element
     * @returns {HTMLElement}
     */
    getVisibleElement() {
        return this.recGetVisibleElement() ?? this.recGetVisibleElement(null, false);
    }

    // TODO use binary search
    /**
     * Recus
     * @param {HTMLCollection} [elements]
     * @returns {HTMLElement | any}
     */
    recGetVisibleElement(elements, strict = true) {
        if (!elements) {
            elements = this.contentElem.children;
        }

        for (let element of elements) {
            const [isFullyVis, isAtLeastPartVis] = this.checkVisibility(element);
            const requiredVisibility = strict ? isFullyVis : isAtLeastPartVis;
            const hasChildren = element.children.length;

            if (requiredVisibility && !hasChildren) {
                return element;
            } else if (hasChildren) {
                const descendantElem = this.recGetVisibleElement(
                    element.children,
                    strict
                );
                if (descendantElem) {
                    return descendantElem;
                }
            }
        }
        return null;
    }

    /**
     * Recalculates page count
     * @returns {void}
     */
    recount = debounce(
        () => {
            if (this.isQuitting) return;
            if (this.status !== "resizing") {
                // Get a reference to a visible element
                // TODO sometimes errors out
                const element = this.getVisibleElement();
                if (!element) {
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

        // Cancel debounces
        this.recount.cancel();
        this.emitSaveBookmarks.cancel();

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

class PageCounter {
    constructor(bookComponent) {
        this.parentComponent = bookComponent;
        this.shadowRoot = bookComponent.shadowRoot;

        this.isCounting = false;
    }

    start() {
        if (true || "TODO") {
            this.#createCounterComponent();
        }
    }

    /**
     * Creates another web component which is used to count pages of a book, and then destroys it
     * @return {Promise<any>}
     */
    async #createCounterComponent() {
        // this.status = "resizing";
        this.isCounting = true;

        /** Create a counter`component inside the current component
         * @type {BookComponent}
         */
        // @ts-ignore
        const childComponent = document.createElement("book-component");
        this.shadowRoot.appendChild(childComponent);

        // Make it hidden
        const rootElem = childComponent.shadowRoot.getElementById("root");
        rootElem.style.visibility = "hidden";
        rootElem.style.position = "absolute";

        await this.#countBookPages(childComponent);
        // this.status = "ready";
        this.isCounting = false;
        childComponent.remove();
    }

    /**
     * Asynchronously and non-blockingly counts pages of a book with a help of a parent web component
     * @param {BookComponent} childComponent - TODO instance of a parent web component which created this counter web component
     * @returns {Promise<void>}
     */
    async #countBookPages(childComponent) {
        const book = await this.parentComponent.book;

        this.parentComponent.bookState.sectionPagesArr = [];

        // TODO start counting pages near where user left off (0th bookmark)
        await this.#asyncForEach(book.sectionNames, async (sectionName, sectionIndex) => {
            const section = childComponent.getSection(book, sectionIndex);
            await childComponent.loadStyles(book, section);
            await childComponent.loadContent(section);

            const totalSectionPages = childComponent.countSectionPages();

            this.parentComponent.bookState.sectionPagesArr.push(totalSectionPages);
            // Update page count every 10 sections
            if (sectionIndex % 10 === 0) {
                this.parentComponent.updateBookUi();
            }
            await this.#waitForNextTask();
        });

        this.parentComponent.updateBookUi();
    }

    /**
     * Asynchronous version of a forEach
     * @param {Array} array
     * @param {*} callback
     * @returns {Promise<void>}
     */
    async #asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }

    /**
     * Splits code in chunks
     * https://stackoverflow.com/a/67135932/10744339
     * @returns {Promise<void>}
     */
    #waitForNextTask() {
        // @ts-ignore
        const { port1, port2 } = (this.#waitForNextTask.channel ??= new MessageChannel());

        return new Promise((resolve) => {
            port1.addEventListener("message", () => resolve(), { once: true });
            port1.start();
            port2.postMessage("");
        });
    }
}
