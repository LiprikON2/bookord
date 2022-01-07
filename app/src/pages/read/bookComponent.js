import { writeConfigRequest } from "secure-electron-store";
import "./bookComponent.css"; // Then used from ReadChunk.css in template

const template = document.createElement("template");
template.innerHTML = `
    <section id="root" class="book-container">
        <link href="ReadChunk.css" rel="stylesheet" type="text/css">  

        <style id="book-style"></style>
        <div id="book-title"></div>
        <div id="book-content"></div>
        
        <ul class="book-ui">
            <li id="section-name"></li>
            <li id="section-page" title="Section page">
                <span id="current-section-page"></span>/<span id="total-section-pages"></span>
            </li>
            <li id="book-page" title="Book page">
                <span id="current-book-page"></span>/<span id="total-book-pages"></span>
            </li>
        </ul>

        <button role="button" id="back" hidden>Back</button>
        <button role="button" id="next" hidden>Next</button>
        
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

/** Book section state
 * @typedef {Object} State
 * @property {number} section - Section number of a book
 * @property {number} sectionPage - Page number of a book's section
 */

/** Interaction state of the book which contains information about file, metadata and reading progress
 * @typedef {Object} InteractionState
 * @property {BookFile} file - Book file
 * @property {Info} info - Book metadata information
 * @property {State} state - Book section state
 */

/** Contains interaction states of all of the books; path to the book's file is used to access individual InteractionState objects
 * @typedef {Object} InteractionStates
 * @property {BookFile} lastOpenedBook - Book file of last opened book
 * @property {InteractionState} * - Path to the book is used as a key
 */

/** HTML & XML parsed to the JavaScript object
 * @typedef {Object} HtmlObject
 * @property {string|undefined} [name]
 * @property {string|undefined} [sectionId]
 * @property {string|undefined} [href]
 * @property {string|undefined} [_data] - HTML content as a string
 * @property {string|undefined} [tag] - HTML tag
 * @property {number|undefined} [type] - Value of 3 corresponds to the text node
 * @property {HtmlObject|undefined} [children]
 */

/** Parsed book object which consists of sections
 * @typedef {Object} Book
 * @property {Info} info - Book metadata information
 * @property {Array<HtmlObject>} initSection - Initially parsed book section
 * @property {number} initSectionNum - Number that corresponds the book's initally parsed section
 * @property {Array<string>} sectionNames - List of section ids (names)
 * @property {number} sectionTotal - Book's total number of section
 * @property {Array<HtmlObject>} structure - Book's parsed Table Of Contents (TOC)
 * @property {Array<HtmlObject>} styles - Book's stylesheets
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

        this.contentElem = this.shadowRoot.getElementById("book-content");

        /**
         * @property {bool} isInit - Status of initialization of the book, true when all of the book's sections are parsed
         */
        this.isInit = false;
        /**
         * @property {Promise<Book>} initBook - Initial book with only one section parsed
         */
        this.initBook = new Promise((resolve, reject) => {
            window.api.receive("app:on-book-section-import", (initBook) => {
                resolve(initBook);
            });
        });
    }

    /**
     * Imports book using IPC, completes initialization as soon as promise is resolved
     * @param  {string} filePath
     * @param  {number} sectionNum
     * @param  {number} sectionPage
     * @returns {Promise<Book>}
     */
    importBook(filePath, sectionNum, sectionPage) {
        const book = window.api.invoke("app:on-book-import", [
            filePath,
            sectionNum,
            sectionPage,
        ]);
        book.then(() => {
            this.isInit = true;
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
        return headStyles[0]?.children?.[0]?.text || "";
    }

    /**
     * Recursively extracts section (chapter) title from book's TOC
     * @param {Book} book
     * @param {Array<HtmlObject>} toc
     * @param {number} sectionNum
     * @param {bool} root - A way to differentiate between recursive and non-recursive function call
     * @returns {string}
     */
    getSectionTitle(book, toc, sectionNum, root = true) {
        let descendantSectionTitle;
        for (let tocEntry of toc) {
            const tocEntryChildren = tocEntry?.children;
            if (tocEntryChildren) {
                descendantSectionTitle = this.getSectionTitle(
                    book,
                    tocEntryChildren,
                    sectionNum,
                    false
                );
                if (descendantSectionTitle) break;
            }
        }
        const tocEntry = toc.find(
            (tocEntry) => tocEntry.sectionId === book.sectionNames[sectionNum]
        );
        const sectionTitle = tocEntry?.name;

        if (descendantSectionTitle) {
            return descendantSectionTitle;
        } else if (sectionTitle) {
            return sectionTitle;
        } else if (
            root &&
            sectionNum >= 0 &&
            sectionNum < this.bookState.totalSections
        ) {
            const prevSectionTitle = this.getSectionTitle(
                book,
                toc,
                sectionNum - 1
            );
            return prevSectionTitle;
        } else {
            return "";
        }
    }

    /**
     * Returns book's section object
     * @param {Book} book
     * @param {number} sectionNum
     * @returns {HtmlObject}
     */
    getSection(book, sectionNum) {
        return book.sections[sectionNum];
    }

    /**
     * Collects book's styles and applies them to the web component
     * @param {Book} book
     * @param {HtmlObject} section
     * @returns {void}
     */
    loadStyles(book, section) {
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
     * Creates a marker that signifies the end of a section which is used in calculating max offset value
     * @param {string} markerId - ID of to-be-created HTML element
     * @returns {void}
     */
    createMarker(markerId) {
        const marker = document.createElement("span");
        marker.id = markerId;
        this.contentElem.appendChild(marker);
    }

    /**
     * Handles clicks on book navigation links and website links
     * @param {Event} e - Event
     * @param {Book} book
     * @listens Event
     * @returns {void}
     */
    handleLink(e, book) {
        e.preventDefault();
        const [sectionName, marker] = e.currentTarget.href
            .split("#")
            .pop()
            .split(",");

        const sectionNum = book.sectionNames.findIndex(
            (section) => section === sectionName
        );

        if (sectionNum !== -1) {
            this.loadSection(sectionNum, 0, marker);
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
     * @returns {void}
     */
    loadContent(section) {
        this.contentElem.innerHTML = "";
        // Remove head tag from section
        section = section.slice(1);
        this.recCreateElements(this.contentElem, section);

        const markerId = this.contentElem.id + "-end-marker";
        this.createMarker(markerId);
    }

    /**
     * Updates book's UI elements such as book title, section title and page counters
     * @returns {void}
     */
    updateBookUI() {
        const bookTitleElem = this.shadowRoot.getElementById("book-title");
        bookTitleElem.innerHTML = this.bookState.bookTitle;
        bookTitleElem.title = this.bookState.bookTitle;

        const sectionNameElem = this.shadowRoot.getElementById("section-name");
        sectionNameElem.innerHTML = this.bookState.currentSectionTitle;
        sectionNameElem.title = this.bookState.currentSectionTitle;

        const sectionPageElem = this.shadowRoot.getElementById("section-page");
        const currentSectionPageElem = this.shadowRoot.getElementById(
            "current-section-page"
        );
        const totalSectionPageElem = this.shadowRoot.getElementById(
            "total-section-pages"
        );
        const currentSectionPage =
            this.bookState.getCurrentSectionPage(this) + 1;
        const totalSectioPage = this.bookState.getTotalSectionPages(
            this.bookState.currentSection
        );

        if (currentSectionPage >= 0 && totalSectioPage > 0) {
            sectionPageElem.style.visibility = "visible";

            currentSectionPageElem.innerHTML = currentSectionPage;
            totalSectionPageElem.innerHTML = totalSectioPage;
        } else {
            sectionPageElem.style.visibility = "hidden";
        }

        const bookPageElem = this.shadowRoot.getElementById("book-page");
        const currentBookPageElem =
            this.shadowRoot.getElementById("current-book-page");
        const totalBookPagesElem =
            this.shadowRoot.getElementById("total-book-pages");

        const currentBookPage = this.bookState.getCurrentBookPage(this) + 1;
        const totalBookPages = this.bookState.getTotalBookPages();

        if (currentBookPage >= 0 && totalBookPages > 0) {
            bookPageElem.style.visibility = "visible";

            currentBookPageElem.innerHTML = currentBookPage;
            totalBookPagesElem.innerHTML = totalBookPages;
        } else {
            bookPageElem.style.visibility = "hidden";
        }
    }

    /**
     * Updates book's state
     * @param {Book} book
     * @param {number} currentSection
     * @returns {void}
     */
    updateBookSectionState(book, currentSection) {
        this.bookState.currentSection = currentSection;
        this.bookState.totalSections = book.sectionsTotal;
        this.bookState.bookTitle = book.info.title;
        this.bookState.currentSectionTitle = this.getSectionTitle(
            book,
            book.structure,
            this.bookState.currentSection
        );
    }

    /**
     * Attaches event handlers to anchor tags to handle book navigation
     * @param {Book} book
     * @returns {void}
     */
    attachLinkHandlers(book) {
        const anchors = this.shadowRoot.querySelectorAll("a");
        anchors.forEach((a) => {
            a.addEventListener("click", (e) => this.handleLink(e, book));
        });
    }

    /**
     * Emits "imgClickEvent" when img tag is clicked
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
     * Attaches event emitter to img tags to handle open modals on click
     * @returns {void}
     */
    attachImgEventEmitters() {
        const images = this.shadowRoot.querySelectorAll("img");
        images.forEach((img) => {
            img.addEventListener("click", this.emitImgClickEvent);
        });
    }

    /**
     * Removes anchor's event handlers before loading another section
     * @returns {void}
     */
    removeLinkHandlers() {
        const anchors = this.shadowRoot.querySelectorAll("a");
        anchors.forEach((a) => {
            a.removeEventListener("click", this.handleLink);
        });
    }

    /**
     * Removes images' event emitters before loading another section
     * @returns {void}
     */
    removeImgEventEmitters() {
        const images = this.shadowRoot.querySelectorAll("img");
        images.forEach((img) => {
            img.addEventListener("click", (e) => {
                this.dispatchEvent;
            });
        });
    }

    /**
     * Loads specified book section along with its styles, sets event listeners, updates UI and saves interaction progress
     * @param {number} currentSection
     * @param {number} nPageShift
     * @param {string} offsetMarkerId
     * @returns {void}
     */
    async loadSection(currentSection, nPageShift, offsetMarkerId = "") {
        if (!this.isInit) {
            var book = await this.initBook;

            var section = book.initSection;
            currentSection = book.initSectionNum;
        } else {
            var book = await this.book;
            var section = this.getSection(book, currentSection);
        }

        this.removeLinkHandlers();
        this.removeImgEventEmitters();

        // console.log("book", currentSection, nPageShift, offsetMarkerId);

        this.loadStyles(book, section);
        this.loadContent(section);

        // In case user traveled back from the subsequent section
        if (offsetMarkerId) {
            const markerElem = this.shadowRoot.getElementById(offsetMarkerId);
            const markerOffset = this.getElementOffset(markerElem);
            // Set offset to the last page (if it's the end-marker) of this section
            this.setCurrentOffset(markerOffset);
        } else {
            // Set offset to the first page of this section
            this.setCurrentOffset(0);
        }

        this.updateBookSectionState(book, currentSection);
        this.updateBookUI();

        // In case user traveled from previous section and
        // still had pages pending to shift through
        if (nPageShift !== 0) {
            this.flipNPages(nPageShift);
        }

        this.attachLinkHandlers(book);
        this.attachImgEventEmitters();

        this.saveInteractionProgress();
    }

    /**
     * Hides links' on another pages so they can't be navigated to with keyboard without flipping the page
     * @returns {void}
     */
    markVisibleLinks() {
        const anchors = this.shadowRoot.querySelectorAll("a");
        anchors.forEach((a) => {
            const currentOffset = this.bookState._getCurrentOffset();
            const anchorOffset = this.getAnchorOffset(a);

            if (currentOffset === anchorOffset) {
                a.style.visibility = "visible";
            } else {
                a.style.visibility = "hidden";
            }
        });
    }

    /**
     * Returns element's offset
     * @param {HTMLElement} elem
     * @returns {number}
     */
    getElementOffset(elem) {
        return -elem.offsetLeft;
    }

    /**
     * Inserts element right after target element
     * @param {HTMLElement} referenceNode
     * @param {HTMLElement} newNode
     * @returns {void}
     */
    _insertAfter(referenceNode, newNode) {
        referenceNode.parentNode.insertBefore(
            newNode,
            referenceNode.nextSibling
        );
    }

    /**
     * Returns top most element's parent, but which is still a child to the book content element
     * @param {HTMLElement} elem
     * @returns {HTMLElement}
     */
    findDirectContentChild(elem) {
        if (elem.parentNode === this.contentElem) {
            return elem;
        } else {
            return this.findDirectContentChild(elem.parentNode);
        }
    }

    /**
     * Returns offset of an anchor element
     * @param {HTMLElement} anchor
     * @returns {number}
     */
    getAnchorOffset(anchor) {
        const contentChild = this.findDirectContentChild(anchor);
        const marker = document.createElement("span");
        marker.id = "find-marker";

        this._insertAfter(contentChild, marker);
        const elemOffset = this.getElementOffset(marker);
        marker.remove();

        return elemOffset;
    }

    /**
     * Sets pixel offset as a way to advance pages within a section
     * @param {string|number} nextOffset
     * @returns {void}
     */
    setCurrentOffset(nextOffset) {
        this.contentElem.style.transform = `translate(${nextOffset}px)`;
        this.markVisibleLinks();
    }

    /**
     * Calculates how many pixels text needs to be offsetted in order to shift N section pages
     * @param {number} nPageShift
     * @returns {number}
     */
    calcNextOffset(nPageShift) {
        const displayWidth = this._getDisplayWidth();
        const currentOffset = this.bookState._getCurrentOffset();
        const shiftOffset = -(nPageShift * displayWidth);
        return currentOffset + shiftOffset;
    }

    /**
     * Returns end-marker's offset which is maximum possible offset
     * @returns {number}
     */
    _getMaxOffset() {
        const markerId = this.contentElem.id + "-end-marker";
        const markerElem = this.shadowRoot.getElementById(markerId);
        const markerOffset = this.getElementOffset(markerElem);

        return markerOffset;
    }

    /**
     * Returns book content's width
     * @returns {number}
     */
    _getDisplayWidth() {
        return this.contentElem.offsetWidth;
    }

    /**
     * Returns a magic number of pixels that counteracts counter component's error
     * @returns {number}
     */
    _getCounterErrorCorrection() {
        const displayWidth = this._getDisplayWidth();
        return displayWidth - 1.5 * displayWidth + 713;
    }
    /**
     * Returns the total of current section pages
     * @param {bool} [correctCounterError] - Wether or not correct for counter component's error
     * @returns {number}
     */
    calcTotalSectionPages(correctCounterError = false) {
        const displayWidth = this._getDisplayWidth();
        let maxOffset = this._getMaxOffset();
        if (correctCounterError) {
            const counterError = this._getCounterErrorCorrection();
            maxOffset += counterError;
        }
        const maxPageNum = Math.abs(maxOffset / displayWidth) + 1;
        return parseInt(maxPageNum);
    }

    /**
     * Flips N pages of a book, when it is discovered that N page shift would land in different section, calls jumpToPage function instead
     * @param {number} nPageShift
     * @returns {void}
     */
    flipNPages(nPageShift) {
        const currentSection = this.bookState.currentSection;
        const totalSections = this.bookState.totalSections;

        const minPageNum = 0;
        const maxPageNum = this.calcTotalSectionPages() - 1;
        const currentPage = this.bookState.getCurrentSectionPage(this);
        const nextSectionPage = currentPage + nPageShift;

        // Checks if requested page is in range of this section
        if (nextSectionPage >= minPageNum && nextSectionPage <= maxPageNum) {
            const newOffset = this.calcNextOffset(nPageShift);

            this.setCurrentOffset(newOffset);
            this.updateBookUI();
            this.saveInteractionProgress();
        }
        // Else if it's possible to jump to the next or previous sections
        else if (
            (currentSection + 1 < totalSections && nPageShift > 0) ||
            (currentSection - 1 >= 0 && nPageShift < 0)
        ) {
            const currentBookPage = this.bookState.getCurrentBookPage(this);
            const nextBookPage = currentBookPage + nPageShift + 1;

            this.jumpToPage(nextBookPage);
        }
        // Else the page is out of range
        else {
            const firstPage = 1;
            const lastPage = this.bookState.getTotalBookPages();
            const edgePage = nPageShift > 0 ? lastPage : firstPage;
            this.jumpToPage(edgePage);
        }
    }

    /**
     * Returns page that is guranteed to be withing the borders of a book
     * @param {number} page
     * @returns {number}
     */
    enforcePageRange(page) {
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
     * Jumps straight to the particular book page
     * @param {number} page
     * @returns {void}
     */
    jumpToPage(page) {
        const validPage = this.enforcePageRange(page);

        const currentPage = this.bookState.getCurrentBookPage(this);
        const nPageShift = validPage - currentPage - 1;

        const nextSection =
            this.bookState.getSectionBookPageBelongsTo(validPage);
        const currentSection = this.bookState.currentSection;

        if (nextSection === currentSection && nPageShift !== 0) {
            this.flipNPages(nPageShift);
        } else if (nextSection !== currentSection) {
            const sectionPagesArr = this.bookState.sectionPagesArr;

            // Prevents the change of a section before the book is fully loaded
            if (!this.bookState.isSectionCounted(nextSection)) {
                return;
            }
            const sumOfPages = this.bookState._sumFirstNArrayItems(
                sectionPagesArr,
                nextSection
            );
            const totalNextSectionPage = sectionPagesArr[nextSection];
            const currentNextSectionPage =
                currentPage + nPageShift - sumOfPages + totalNextSectionPage;

            this.loadSection(nextSection, currentNextSectionPage);
        }
    }

    /**
     * Creates another web component which is used to count pages of a book, and then destroys it
     * @return {void}
     */
    createCounterComponent() {
        const counterComponent = document.createElement("book-component");
        this.shadowRoot.appendChild(counterComponent);

        const rootElem = counterComponent.shadowRoot.getElementById("root");
        rootElem.style.visibility = "hidden";
        rootElem.style.maxHeight = "0";

        counterComponent._countBookPages(this);
    }

    /**
     * Asynchronous version of a forEach
     * @param {Array} array
     * @param {*} callback
     * @returns {void}
     */
    async _asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }

    /**
     * Asynchronously and non-blockingly counts pages of a book with a help of a parent web component
     * @param {HTMLElement} parentComponent - instance of a parent web component which created this counter web component
     * @returns {void}
     */
    async _countBookPages(parentComponent) {
        const _waitForNextTask = () => {
            const { port1, port2 } = (_waitForNextTask.channel ??=
                new MessageChannel());
            return new Promise((res) => {
                port1.addEventListener("message", () => res(), { once: true });
                port1.start();
                port2.postMessage("");
            });
        };

        const book = await parentComponent.book;

        parentComponent.bookState.sectionPagesArr = [];

        await this._asyncForEach(
            book.sectionNames,
            async (sectionName, sectionIndex) => {
                const section = this.getSection(book, sectionIndex);
                this.loadStyles(book, section);
                this.loadContent(section);

                const totalSectionPages = this.calcTotalSectionPages(true);
                parentComponent.bookState.sectionPagesArr.push(
                    totalSectionPages
                );
                // Update page count every 10 sections
                if (sectionIndex % 10 === 0) {
                    parentComponent.updateBookUI();
                }
                await _waitForNextTask();
            }
        );
        parentComponent.updateBookUI();

        this.remove();
    }

    /**
     * Loads book to the web component, as well as runs a page counter
     * @param {string} filePath - Path to the book file, also serves as the key to InteractionStates object
     * @param {InteractionStates} interactionStates - interaction states of all of the books
     * @return {void}
     */
    loadBook(filePath, interactionStates) {
        this.currInteractionState = interactionStates[filePath];
        this.interactionStates = interactionStates;

        this.book = this.importBook(
            this.currInteractionState.file.path,
            this.currInteractionState.state.section,
            this.currInteractionState.state.sectionPage
        );

        this.bookState = {
            currentSection: this.currInteractionState.state.section,
            totalSections: 0,

            getSectionBookPageBelongsTo: function (page) {
                const sliceOfPages = [];
                for (const [
                    index,
                    pageCount,
                ] of this.sectionPagesArr.entries()) {
                    sliceOfPages.push(pageCount);
                    const sumOfPages = sliceOfPages.reduce(
                        (prevValue, currValue) => prevValue + currValue
                    );
                    if (page <= sumOfPages) return index;
                }
            },

            getCurrentSectionPage: function (that) {
                const displayWidth = that._getDisplayWidth();
                const currentOffset = this._getCurrentOffset();
                const currentPage = Math.abs(currentOffset / displayWidth);
                return currentPage;
            },
            getTotalSectionPages: function (sectionNum) {
                return this.sectionPagesArr[sectionNum];
            },

            sectionPagesArr: [0],
            isSectionCounted: function (section) {
                return !!this.sectionPagesArr[section];
            },
            getCurrentBookPage: function (that) {
                const sumOfPages = this._sumFirstNArrayItems(
                    this.sectionPagesArr,
                    this.currentSection
                );
                return (
                    sumOfPages -
                    this.getTotalSectionPages(this.currentSection) +
                    this.getCurrentSectionPage(that)
                );
            },
            getTotalBookPages: function () {
                const totalBookPages = this.sectionPagesArr.reduce(
                    (prevValue, currValue) => prevValue + currValue
                );
                return totalBookPages;
            },

            bookTitle: "",
            currentSectionTitle: "",

            _sumFirstNArrayItems: function (array, n) {
                const arraySlice = array.slice(0, n + 1);
                const arraySum = arraySlice.reduce(
                    (prevValue, currValue) => prevValue + currValue
                );
                return arraySum;
            },
            _getCurrentOffset: function () {
                // Strips all non-numeric characters from a string
                return (
                    parseInt(
                        this.contentElem.style.transform.replace(/[^\d.-]/g, "")
                    ) || 0
                );
            }.bind(this),
        };

        this.createCounterComponent();
        this.loadSection(
            this.bookState.currentSection,
            this.currInteractionState.state.sectionPage
        );

        const nextBtn = this.shadowRoot.querySelector("button#next");
        const backBtn = this.shadowRoot.querySelector("button#back");
        nextBtn.addEventListener("click", () => {
            this.flipNPages(1);
        });
        backBtn.addEventListener("click", () => {
            this.flipNPages(-1);
        });
    }

    /**
     * Saves interaction state progress in electron store
     * @returns {void}
     */
    saveInteractionProgress() {
        const state = {
            section: this.bookState.currentSection,
            sectionPage: this.bookState.getCurrentSectionPage(this),
        };
        const filePath = this.currInteractionState.file.path;

        const prevInteractionStates = this.interactionStates;
        const updatedInteractionStates = {
            lastOpenedBook: this.currInteractionState.file,
            [filePath]: {
                file: this.currInteractionState.file,
                ...prevInteractionStates[filePath],
                state,
            },
        };
        const mergedInteractionStates = Object.assign(
            {},
            prevInteractionStates,
            updatedInteractionStates
        );

        window.api.store.send(
            writeConfigRequest,
            "interactionStates",
            mergedInteractionStates
        );
    }

    disconnectedCallback() {
        const nextBtn = this.shadowRoot.querySelector("button#next");
        const backBtn = this.shadowRoot.querySelector("button#back");
        nextBtn.removeEventListener("click", this.flipNPages);
        backBtn.removeEventListener("click", this.flipNPages);

        this.removeLinkHandlers();
    }

    /**
     * Runs everytime web component's listened attribute changes.
     * @param {string} name
     * @param {string|undefined} oldValue
     * @param {string|undefined} newValue
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "book-page" && oldValue) {
            const updatedPage = parseInt(newValue);
            this.jumpToPage(updatedPage);
        }
    }
}

window.customElements.define("book-component", BookComponent);
