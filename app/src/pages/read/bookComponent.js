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
            .book-container > #book-content {
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
            #boook-title {
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
            <li id="page">
                <span id="current-page"></span>/<span id="total-pages"></span>
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
    createMarker() {
        const marker = document.createElement("span");
        marker.id = "endMarker";
        this.content.appendChild(marker);
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
            this.loadSection(this.book, sectionNum, 0);
            // this.loadSection(this.book, sectionNum, 0, marker);
        } else {
            e.preventDefault();
            console.log("Normal link");
            //  todo: handle website links
        }
    }

    loadContent(book, sectionNum) {
        this.content.innerHTML = "";
        // Making a copy of an array
        const section = book.sections[sectionNum].slice();
        // Removes head tag from section
        section.shift();
        this.recCreateElements(this.content, section);
        this.createMarker();
    }

    updateBookUI() {
        const sectionNameElem = this.shadowRoot.getElementById("section-name");
        sectionNameElem.innerHTML = this.posInBook.currentSectionTitle;

        const currentPageElem = this.shadowRoot.getElementById("current-page");
        currentPageElem.innerHTML = this.posInBook.currentBookPage;

        const totalPageElem = this.shadowRoot.getElementById("total-pages");
        totalPageElem.innerHTML = this.posInBook.totalBookPages;

        const bookTitleElem = this.shadowRoot.getElementById("book-title");
        console.log("this", this.posInBook.bookTitle);
        bookTitleElem.innerHTML = this.posInBook.bookTitle;
    }

    updateBookState(book, currentSection) {
        this.posInBook.currentSection = currentSection;
        this.posInBook.totalSections = book.sections.length;
        this.posInBook.bookTitle = book.info.title;

        const currentTocEntry = book.structure.find(
            (tocEntry) =>
                tocEntry.sectionId === book.sectionNames[currentSection]
        );
        if (currentTocEntry) {
            this.posInBook.currentSectionTitle = currentTocEntry.name;
        }

        this.updateBookUI();

        console.log("Current section:", this.posInBook.currentSectionTitle);
    }

    /*
     * sectionNum - index of an html file - section
     * nPageShift - how many pages to flip through
     * offsetMarkerId - id of an element within section to scroll to
     */
    loadSection(book, currentSection, nPageShift, offsetMarkerId = "") {
        book.then((book) => {
            // Removes anchor event listeners when leaving the section
            let anchors = this.shadowRoot.querySelectorAll("a");
            anchors.forEach((a) => {
                a.removeEventListener("click", this.handleLink);
            });

            console.log("book", currentSection, nPageShift, offsetMarkerId);
            this.updateBookState(book, currentSection);
            this.loadStyles(book, currentSection);
            this.loadContent(book, currentSection);

            // In case user traveled from the following section
            if (offsetMarkerId) {
                const markerOffset = this.getElementOffset("endMarker");
                this.setCurrentOffset(markerOffset);
            } else if (nPageShift !== 0) {
                // if user traveled from previous section and still had
                // pages pending left to shift
                const newOffset = this.calcNextOffset(nPageShift);
                this.setCurrentOffset(newOffset);
            } else {
                this.setCurrentOffset(0);
            }

            anchors = this.shadowRoot.querySelectorAll("a");
            anchors.forEach((a) => {
                a.addEventListener("click", (e) => this.handleLink(e, book));
            });
        });
    }

    getCurrentOffset() {
        return (
            // Strips all non-numeric characters from a string
            parseInt(this.content.style.transform.replace(/[^\d.-]/g, "")) || 0
        );
    }
    setCurrentOffset(nextOffset) {
        this.content.style.transform = `translate(${nextOffset}px)`;
    }

    getElementOffset(elementId) {
        const element = this.shadowRoot.getElementById(elementId);
        return -element.offsetLeft;
    }
    getMaxOffset() {
        return this.getElementOffset("endMarker");
    }

    /*
     * Calculates how many pixels text needs to be
     * offsetted in order to shift n section pages
     */
    calcNextOffset(nPageShift) {
        const displayWidth = this.content.offsetWidth;
        const currentOffset = this.getCurrentOffset();
        const shiftOffset = -(nPageShift * displayWidth);

        const minPageNum = 0;
        const maxPageNum = Math.abs(this.getMaxOffset() / displayWidth);
        const currentPage = Math.abs(currentOffset / displayWidth);
        const nextPage = currentPage + nPageShift;

        // Checks if requested page is in range of this section
        if (nextPage >= minPageNum && nextPage <= maxPageNum) {
            return currentOffset + shiftOffset;
        }
        // Else go to the next section
        else if (nextPage > maxPageNum) {
            // Checks if there is a next section
            if (
                this.posInBook.currentSection + 1 <
                this.posInBook.totalSections
            ) {
                const pagesShifted = maxPageNum - currentPage;
                const pagesLeftToShift = nPageShift - pagesShifted - 1;

                this.loadSection(
                    this.book,
                    this.posInBook.currentSection + 1,
                    pagesLeftToShift
                );
            }
        }
        // Else go to the previous section
        else if (nextPage < minPageNum) {
            // Checks if there is a previous section
            if (this.posInBook.currentSection - 1 >= 0) {
                const pagesShifted = currentPage - minPageNum;
                const pagesLeftToShift = nPageShift + pagesShifted + 1;

                this.loadSection(
                    this.book,
                    this.posInBook.currentSection - 1,
                    pagesLeftToShift,
                    "endMarker"
                );
            }
        }
    }
    flipNPages(nPageShift) {
        const newOffset = this.calcNextOffset(nPageShift);
        this.setCurrentOffset(newOffset);
    }
    // jumpTo(page) {
    //     const nPageShift = 0;

    //     const newOffset = this.calcNextOffset(nPageShift);
    //     this.setCurrentOffset(newOffset);
    // }

    connectedCallback() {
        const bookPath = this.getAttribute("book-path");
        this.book = this.asyncLoadBook(bookPath);

        this.posInBook = {
            currentSection: parseInt(this.getAttribute("book-page")),
            totalSections: 0,

            currentSectionPage: 0,
            totalSectionPages: 0,

            currentBookPage: 0,
            totalBookPages: 0,

            bookTitle: "",
            currentSectionTitle: "",
        };

        this.loadSection(this.book, this.posInBook.currentSection, 0);

        const nextBtn = this.shadowRoot.querySelector("button#next");
        const backBtn = this.shadowRoot.querySelector("button#back");

        nextBtn.addEventListener("click", () => {
            this.flipNPages(1);
        });
        backBtn.addEventListener("click", () => {
            this.flipNPages(-1);
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
    //         this.loadSection(this.book, this.posInBook.currentSection);
    //     }
    //     this.setCurrentOffset(0);
    // }
}

window.customElements.define("book-component", BookComponent);
