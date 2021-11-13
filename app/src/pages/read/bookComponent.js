const template = document.createElement("template");
template.innerHTML = `
    <section class="book-container">
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
            border: 1px solid #000;
            display: block;
            max-width: 100%;
            height: 400px;
            margin-inline: auto

            /* 
            display: block;
            max-width: 100%;
            height: auto;

             */
            /*
            width:100%;
            height:100%;
            object-fit: scale-down;
            */
        }
        </style>

        <style id="book-style"></style>
        <div id="book-content"></div>
        
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

    loadStyles(book, section_num) {
        const section = book.sections[section_num];
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

    loadContent(book, section_num) {
        this.content.innerHTML = "";
        // Making a copy of an array
        const section = book.sections[section_num].slice();
        // Removes head tag from section
        section.shift();
        this.recCreateElements(this.content, section);
        this.createMarker();
    }
    loadSection(book, section_num, nPageShift, fromEnd = false) {
        book.then((book) => {
            console.log("book", section_num, nPageShift, fromEnd);
            this.loadStyles(book, section_num);
            this.loadContent(book, section_num);
            this.maxSectionNum = book.sections.length;

            if (fromEnd) {
                const maxOffset = this.getMaxOffset();
                this.setCurrentOffset(maxOffset);
            } else {
                this.setCurrentOffset(0);
            }
            const newOffset = this.calcNextOffset(nPageShift);
            this.setCurrentOffset(newOffset);
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

    getElementOffset(element) {
        return -element.offsetLeft;
    }
    getMaxOffset() {
        const marker = this.shadowRoot.getElementById("endMarker");
        return this.getElementOffset(marker);
    }

    /*
     * Calculates how much pixels text needs to be
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
            // Checks if requested page is in range of this book
            if (this.sectionNum + 1 <= this.maxSectionNum) {
                const pagesShifted = maxPageNum - currentPage;
                const pagesLeftToShift = nPageShift - pagesShifted - 1;

                this.sectionNum += 1;
                this.loadSection(this.book, this.sectionNum, pagesLeftToShift);
            }
        }
        // Else go to the previous section
        else if (nextPage < minPageNum) {
            // Checks if there is a previous section
            if (this.sectionNum - 1 >= 0) {
                const pagesShifted = currentPage - minPageNum;
                const pagesLeftToShift = nPageShift + pagesShifted + 1;

                this.sectionNum -= 1;
                this.loadSection(
                    this.book,
                    this.sectionNum,
                    pagesLeftToShift,
                    true
                );
            }
        }
    }
    /*
     * Increments offset to go to the
     * next part of the text (next=true)
     * or to the previous part (next=false)
     */
    goNextOrBack(next) {
        const nPageShift = next ? 1 : -1;

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
        this.sectionNum = parseInt(this.getAttribute("book-page"));

        this.loadSection(this.book, this.sectionNum, 0);

        const nextBtn = this.shadowRoot.querySelector("button#next");
        const backBtn = this.shadowRoot.querySelector("button#back");

        nextBtn.addEventListener("click", () => {
            this.goNextOrBack(true);
        });
        backBtn.addEventListener("click", () => {
            this.goNextOrBack(false);
        });
    }
    disconnectedCallback() {
        const nextBtn = this.shadowRoot.querySelector("button#next");
        const backBtn = this.shadowRoot.querySelector("button#back");
        nextBtn.removeEventListener("click", this.goNextOrBack);
        backBtn.removeEventListener("click", this.goNextOrBack);
    }

    isAValidPage(updatedPage) {
        // Checks if it's a first render
        if (this.sectionNum !== undefined) {
            return updatedPage >= 0 && updatedPage <= this.maxSectionNum - 1;
        }
    }

    // attributeChangedCallback() {
    //     // Triggered when next page or
    //     // previous page button is clicked
    //     const updatedPageNum = this.getAttribute("book-page");

    //     if (this.isAValidPage(updatedPageNum)) {
    //         this.sectionNum = updatedPageNum;
    //         this.loadSection(this.book, this.sectionNum);
    //     }
    //     this.setCurrentOffset(0);
    // }
}

window.customElements.define("book-component", BookComponent);
