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
            .book-container.page-counter {
                visibility: hidden;
                max-height: 0;
            } 

            .book-container > #book-content,
            .book-container > #book-page-counter {
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

        </style>

        <style id="book-style"></style>
        <div id="book-title"></div>
        <div id="book-content"></div>
        
        <ul class="book-ui">
            <li id="section-name"></li>
            <li id="section-page">
                <span id="current-section-page"></span>/<span id="total-section-pages"></span>
            </li>
            <li id="book-page">
                <span id="current-book-page"></span>/<span id="total-book-pages"></span>
            </li>
        </ul>

        <button role="button" id="back">Back</button>
        <button role="button" id="next">Next</button>
        
        <div class="page-counter book-container">
            <div id="book-page-counter"></div>
        </div>
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

        this.content = this.shadowRoot.getElementById("book-content");
    }
    async asyncLoadBook(bookPath) {
        return await window.api.invoke("app:on-book-import", bookPath);
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
    getSectionTitle(book, sectionNum) {
        const section = book.sections[sectionNum];

        const titleTag = section[0].children.filter((elem) => {
            return elem.tag === "title";
        })?.[0];

        return titleTag.children?.[0]?.text || "";
    }

    loadStyles(book, sectionNum) {
        const section = book.sections[sectionNum];
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
    createMarker(target, markerId) {
        const marker = document.createElement("span");
        marker.id = markerId;
        target.appendChild(marker);
    }

    handleLink(e, book) {
        const [sectionName, marker] = e.currentTarget.href
            .split("#")
            .pop()
            .split(",");

        const sectionNum = book.sectionNames.findIndex(
            (section) => section === sectionName
        );

        if (sectionNum !== -1) {
            e.preventDefault();
            this.loadSection(this.content, sectionNum, 0);
            // this.loadSection(this.content, sectionNum, 0, marker);
        } else {
            e.preventDefault();
            console.log("Normal link");
            //  todo: handle website links
        }
    }

    loadContent(target, book, sectionNum) {
        target.innerHTML = "";
        // Making a copy of an array
        const section = book.sections[sectionNum].slice();
        // Removes head tag from section
        section.shift();
        this.recCreateElements(target, section);

        const markerId = target.id + "-end-marker";
        this.createMarker(target, markerId);
    }

    updateBookUI() {
        const bookTitleElem = this.shadowRoot.getElementById("book-title");
        bookTitleElem.innerHTML = this.bookState.bookTitle;
        bookTitleElem.title = this.bookState.bookTitle;

        const sectionNameElem = this.shadowRoot.getElementById("section-name");
        sectionNameElem.innerHTML = this.bookState.currentSectionTitle;
        sectionNameElem.title = this.bookState.currentSectionTitle;

        const currentSectionPageElem = this.shadowRoot.getElementById(
            "current-section-page"
        );
        currentSectionPageElem.innerHTML =
            this.bookState.getCurrentSectionPage(this.content) + 1;
        const totalSectionPageElem = this.shadowRoot.getElementById(
            "total-section-pages"
        );
        totalSectionPageElem.innerHTML = this.bookState.getTotalSectionPages();

        const currentBookPageElem =
            this.shadowRoot.getElementById("current-book-page");
        currentBookPageElem.innerHTML =
            this.bookState.getCurrentBookPage(this.content) + 1;
        const totalBookPageElem =
            this.shadowRoot.getElementById("total-book-pages");
        totalBookPageElem.innerHTML = this.bookState.getTotalBookPages();
    }

    getSectionTitle(book, currentSection) {
        const currentTocEntry = book.structure.find(
            (tocEntry) =>
                tocEntry.sectionId === book.sectionNames[currentSection]
        );
        return currentTocEntry?.name || "";
    }

    calcTotalSectionPages(target) {
        const displayWidth = target.offsetWidth;
        const maxPageNum = Math.abs(this.getMaxOffset(target) / displayWidth);
        // console.log("hm", maxPageNum);
        return parseInt(maxPageNum);
    }

    updateBookSectionState(book, currentSection) {
        this.bookState.currentSection = currentSection;
        this.bookState.totalSections = book.sections.length;
        this.bookState.bookTitle = book.info.title;
        this.bookState.currentSectionTitle = this.getSectionTitle(
            book,
            currentSection
        );
    }

    /*
     * sectionNum - index of an html file - section
     * nPageShift - how many pages to flip through
     * offsetMarkerId - id of an element within section to scroll to
     */
    loadSection(target, currentSection, nPageShift, offsetMarkerId = "") {
        this.book.then((book) => {
            // Removes anchor's event handlers before loading another section
            let anchors = this.shadowRoot.querySelectorAll("a");
            anchors.forEach((a) => {
                a.removeEventListener("click", this.handleLink);
            });

            console.log("book", currentSection, nPageShift, offsetMarkerId);
            this.loadStyles(book, currentSection);
            this.loadContent(target, book, currentSection);

            // In case user traveled back from the subsequent section
            if (offsetMarkerId) {
                const markerId = target.id + "-end-marker";
                const markerOffset = this.getElementOffset(markerId);
                // Set offset to the last page of this section
                this.setCurrentOffset(target, markerOffset);
            } else {
                // Set offset to the first page of this section
                this.setCurrentOffset(target, 0);
            }

            this.updateBookSectionState(book, currentSection);
            this.updateBookUI();

            // In case user traveled from previous section and
            // still had pages pending to shift through
            if (nPageShift !== 0) {
                const newOffset = this.calcNextOffset(target, nPageShift);
                this.setCurrentOffset(target, newOffset);
                this.updateBookUI();
            }

            // Attaches event handlers to anchor tags to handle book navigation
            anchors = this.shadowRoot.querySelectorAll("a");
            anchors.forEach((a) => {
                a.addEventListener("click", (e) => this.handleLink(e, book));
            });
        });
    }

    setCurrentOffset(target, nextOffset) {
        target.style.transform = `translate(${nextOffset}px)`;
    }

    getElementOffset(elementId) {
        const element = this.shadowRoot.getElementById(elementId);
        return -element.offsetLeft;
    }
    getMaxOffset(target) {
        const markerId = target.id + "-end-marker";
        return this.getElementOffset(markerId);
    }

    /*
     * Calculates how many pixels text needs to be
     * offsetted in order to shift n section pages
     */
    calcNextOffset(target, nPageShift) {
        const displayWidth = target.offsetWidth;
        const currentOffset = this.bookState.getCurrentOffset(target);
        const shiftOffset = -(nPageShift * displayWidth);

        const minPageNum = 0;
        const maxPageNum = this.calcTotalSectionPages(target);
        const currentPage = this.bookState.getCurrentSectionPage(target);
        const nextPage = currentPage + nPageShift;

        // Checks if requested page is in range of this section
        if (nextPage >= minPageNum && nextPage <= maxPageNum) {
            return currentOffset + shiftOffset;
        }
        // Else go to the next section
        else if (nextPage > maxPageNum) {
            // Checks if there is a next section
            if (
                this.bookState.currentSection + 1 <
                this.bookState.totalSections
            ) {
                const pagesShifted = maxPageNum - currentPage;
                const pagesLeftToShift = nPageShift - pagesShifted - 1;

                this.loadSection(
                    target,
                    this.bookState.currentSection + 1,
                    pagesLeftToShift
                );
                return 0;
            }
            return this.getMaxOffset(target);
        }
        // Else go to the previous section
        else if (nextPage < minPageNum) {
            // Checks if there is a previous section
            if (this.bookState.currentSection - 1 >= 0) {
                const pagesShifted = currentPage - minPageNum;
                const pagesLeftToShift = nPageShift + pagesShifted + 1;

                const markerId = target.id + "-end-marker";
                this.loadSection(
                    target,
                    this.bookState.currentSection - 1,
                    pagesLeftToShift,
                    markerId
                );
                return this.getMaxOffset(target);
            }
            return 0;
        }
    }
    flipNPages(target, nPageShift) {
        const newOffset = this.calcNextOffset(target, nPageShift);
        this.setCurrentOffset(target, newOffset);

        this.updateBookUI();
    }
    jumpTo(target, page) {
        const currentPage = this.bookState.getCurrentBookPage(target);
        const nPageShift = page - currentPage - 1;

        this.flipNPages(target, nPageShift);
    }

    // TODO make it async
    countBookPages() {
        this.book.then((book) => {
            const bookPageCounterElem =
                this.shadowRoot.getElementById("book-page-counter");

            this.bookState.sectionPagesCount = [];
            book.sectionNames.forEach((sectionName, sectionIndex) => {
                this.loadStyles(book, sectionIndex);
                this.loadContent(bookPageCounterElem, book, sectionIndex);

                const totalSectionPages =
                    this.calcTotalSectionPages(bookPageCounterElem);
                this.bookState.sectionPagesCount.push(totalSectionPages);
                this.updateBookUI(); // TODO make it async
            });
        });
    }

    connectedCallback() {
        const bookPath = this.getAttribute("book-path");
        this.book = this.asyncLoadBook(bookPath);

        this.bookState = {
            currentSection: parseInt(this.getAttribute("book-page")),
            totalSections: 0,
            getCurrentOffset: function (target) {
                // Strips all non-numeric characters from a string
                return (
                    parseInt(target.style.transform.replace(/[^\d.-]/g, "")) ||
                    0
                );
            },

            getCurrentSectionPage: function (target) {
                const displayWidth = target.offsetWidth;
                const currentOffset = this.getCurrentOffset(target);
                const currentPage = Math.abs(currentOffset / displayWidth);
                return currentPage;
            },
            getTotalSectionPages: function () {
                return this.sectionPagesCount[this.currentSection];
            },

            sectionPagesCount: [0],
            getCurrentBookPage: function (target) {
                const sectionPagesCountSlice = this.sectionPagesCount.slice(
                    0,
                    this.currentSection + 1
                );
                const sectionPagesCountSliceSum = sectionPagesCountSlice.reduce(
                    (prevValue, currValue) => prevValue + currValue
                );
                return (
                    sectionPagesCountSliceSum -
                    this.getTotalSectionPages() +
                    this.getCurrentSectionPage(target)
                );
            },
            getTotalBookPages: function () {
                const totalBookPages = this.sectionPagesCount.reduce(
                    (prevValue, currValue) => prevValue + currValue
                );
                return totalBookPages;
            },

            bookTitle: "",
            currentSectionTitle: "",
        };

        this.countBookPages();
        this.loadSection(this.content, this.bookState.currentSection, 0);

        const nextBtn = this.shadowRoot.querySelector("button#next");
        const backBtn = this.shadowRoot.querySelector("button#back");

        nextBtn.addEventListener("click", () => {
            // this.flipNPages(this.content, 1);
            this.jumpTo(this.content, 581);
        });
        backBtn.addEventListener("click", () => {
            // this.flipNPages(this.content, -1);
            this.jumpTo(this.content, 1);
        });
    }
    disconnectedCallback() {
        const nextBtn = this.shadowRoot.querySelector("button#next");
        const backBtn = this.shadowRoot.querySelector("button#back");
        nextBtn.removeEventListener("click", this.flipNPages);
        backBtn.removeEventListener("click", this.flipNPages);

        const anchors = this.shadowRoot.querySelectorAll("a");
        anchors.forEach((a) => {
            a.removeEventListener("click", this.handleLink);
        });
    }

    // isAValidPage(updatedPage) {
    //     // Checks if it's a first render
    //     if (this.posInBook.currentSection !== undefined) {
    //         return updatedPage >= 0 && updatedPage <= this.posInBook.totalSections - 1;
    //     }
    // }

    // attributeChangedCallback() {
    //     // Triggered when next page or
    //     // previous page button is clicked
    //     const updatedPageNum = this.getAttribute("book-page");

    //     if (this.isAValidPage(updatedPageNum)) {
    //         this.posInBook.currentSection = updatedPageNum;
    //         this.loadSection(this.posInBook.currentSection);
    //     }
    //     this.setCurrentOffset(this.content, 0);
    // }
}

window.customElements.define("book-component", BookComponent);
