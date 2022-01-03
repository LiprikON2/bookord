import {
    readConfigRequest,
    readConfigResponse,
    writeConfigRequest,
} from "secure-electron-store";

const template = document.createElement("template");
template.innerHTML = `
    <section id="root" class="book-container">
        <style>
            * {box-sizing: border-box}
            .book-container {
                width: 400px;
                margin: auto;
                overflow: hidden;
            }

            .book-container > #book-content,
            .book-container > #page-counter {
                columns: 1;
                column-gap: 0;
                height: 400px;
            }

            img {
                display: block;
                width: 100% !important;
                height: 400px !important;
                object-fit: contain;
            }
            ul.book-ui {
                display: flex;
                gap: 1em;
                justify-content: space-between;
                list-style: none;
                padding: 0;
                margin: 0;
            }
            ul.book-ui > *,
            #book-title {
                color: #999;
                height: 1.5em;
            }
            ul.book-ui > #section-name,
            #book-title {
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
            }
            ul.book-ui > #section-page,
            ul.book-ui > #book-page {
                visibility: hidden;
            }

        </style>

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

        <button role="button" id="back">Back</button>
        <button role="button" id="next">Next</button>
        
    </section>
`;

class BookComponent extends HTMLElement {
    // Listen for changes in the attribute
    static get observedAttributes() {
        return ["book-page"];
    }

    constructor() {
        super();

        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.contentElem = this.shadowRoot.getElementById("book-content");

        this.isInit = false;
        // Initial book with only one section parsed
        this.initBook = new Promise((resolve, reject) => {
            window.api.receive("app:on-book-section-import", (initBook) => {
                resolve(initBook);
            });
        });
    }

    importBook(bookPath, sectionNum, sectionPage) {
        const book = window.api.invoke("app:on-book-import", [
            bookPath,
            sectionNum,
            sectionPage,
        ]);
        book.then(() => {
            this.isInit = true;
        });
        return book;
    }
    /*
     * Returns all references to stylesheet names in a section
     */
    getSectionStyleReferences(section) {
        // First tag of a section is the head tag
        const headLinks = section[0].children.filter((elem) => {
            return elem.tag === "link";
        });

        const sectionStyles = headLinks.map((link) => link?.attrs?.href);
        return sectionStyles;
    }
    getSectionInlineStyles(section) {
        const headStyles = section[0].children.filter((elem) => {
            return elem.tag === "style";
        });
        return headStyles[0]?.children?.[0]?.text || "";
    }

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
    getSection(book, sectionNum) {
        return book.sections[sectionNum];
    }

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

    /*
     * Recursively creates and appends child
     * elements to the respective child's parent
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

    /*
     * Creates a marker that signifies the end of a section
     * which is used in calculating max offset value
     */
    createMarker(markerId) {
        const marker = document.createElement("span");
        marker.id = markerId;
        this.contentElem.appendChild(marker);
    }

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
            window.open(e.target.href, "_blank");
        }
    }

    loadContent(section) {
        this.contentElem.innerHTML = "";
        // Remove head tag from section
        section = section.slice(1);
        this.recCreateElements(this.contentElem, section);

        const markerId = this.contentElem.id + "-end-marker";
        this.createMarker(markerId);
    }

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

    // Attaches event handlers to anchor tags to handle book navigation
    attachLinkHandlers(book) {
        const anchors = this.shadowRoot.querySelectorAll("a");
        anchors.forEach((a) => {
            a.addEventListener("click", (e) => this.handleLink(e, book));
        });
    }
    // Removes anchor's event handlers before loading another section
    removeLinkHandlers() {
        const anchors = this.shadowRoot.querySelectorAll("a");
        anchors.forEach((a) => {
            a.removeEventListener("click", this.handleLink);
        });
    }
    /*
     * sectionNum - index of an html file - section
     * nPageShift - how many pages to flip through
     * offsetMarkerId - id of an element within section to scroll to
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

        console.log("book", currentSection, nPageShift, offsetMarkerId);

        this.loadStyles(book, section);
        this.loadContent(section);

        // In case user traveled back from the subsequent section
        if (offsetMarkerId) {
            const markerElem = this.shadowRoot.getElementById(offsetMarkerId);
            const markerOffset = -markerElem.offsetLeft;
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
        this.saveLastOpenedBook();
    }

    setCurrentOffset(nextOffset) {
        this.contentElem.style.transform = `translate(${nextOffset}px)`;
    }

    /*
     * Calculates how many pixels text needs to be
     * offsetted in order to shift n section pages
     */
    calcNextOffset(nPageShift) {
        const displayWidth = this.contentElem.offsetWidth;
        const currentOffset = this.bookState._getCurrentOffset();
        const shiftOffset = -(nPageShift * displayWidth);

        return currentOffset + shiftOffset;
    }

    _getMaxOffset() {
        const markerId = this.contentElem.id + "-end-marker";
        const markerElem = this.shadowRoot.getElementById(markerId);
        const markerOffset = -markerElem.offsetLeft;
        return markerOffset;
    }
    calcTotalSectionPages() {
        const displayWidth = this.contentElem.offsetWidth;
        const maxPageNum = Math.abs(this._getMaxOffset() / displayWidth);
        // TODO for some reason this has values of 78.28, 111.28, 76.28...
        return parseInt(maxPageNum);
    }

    flipNPages(nPageShift) {
        const currentSection = this.bookState.currentSection;
        const totalSections = this.bookState.totalSections;

        const minPageNum = 0;
        const maxPageNum = this.calcTotalSectionPages();
        const currentPage = this.bookState.getCurrentSectionPage(this);
        const nextSectionPage = currentPage + nPageShift;

        // Checks if requested page is in range of this section
        if (nextSectionPage >= minPageNum && nextSectionPage <= maxPageNum) {
            const newOffset = this.calcNextOffset(nPageShift);

            this.setCurrentOffset(newOffset);
            this.updateBookUI();
            this.saveLastOpenedBook();
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
    /*
     * Returns page that is guranteed to be withing the borders of a book
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

    createCounterComponent() {
        const counterComponent = document.createElement("book-component");
        this.shadowRoot.appendChild(counterComponent);

        const rootElem = counterComponent.shadowRoot.getElementById("root");
        rootElem.style.visibility = "hidden";
        rootElem.style.maxHeight = "0";

        counterComponent._countBookPages(this);
    }
    async _asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }
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

                const totalSectionPages = this.calcTotalSectionPages();
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

    loadBook(lastOpenedBook, interactionStates) {
        this.lastOpenedBook = lastOpenedBook;
        this.interactionStates = interactionStates;

        this.book = this.importBook(
            lastOpenedBook.path,
            lastOpenedBook.section,
            lastOpenedBook.sectionPage
        );

        this.bookState = {
            currentSection: lastOpenedBook.section,
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
                const displayWidth = that.contentElem.offsetWidth;
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
            lastOpenedBook.sectionPage
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

    saveLastOpenedBook() {
        const bookFile = {
            name: this.lastOpenedBook.name,
            path: this.lastOpenedBook.path,
            size: this.lastOpenedBook.size,
        };
        const book = {
            ...bookFile,
            section: this.bookState.currentSection,
            sectionPage: this.bookState.getCurrentSectionPage(this),
        };
        const bookPath = book.path;

        const prevInteractionStates = this.interactionStates;
        const updatedInteractionStates = {
            lastOpenedBook: bookFile,
            [bookPath]: book,
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

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "book-page" && oldValue) {
            const updatedPage = parseInt(newValue);
            this.jumpToPage(updatedPage);
        }
    }
}

window.customElements.define("book-component", BookComponent);
