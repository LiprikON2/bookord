const template = document.createElement("template");
template.innerHTML = `
    <section>
        <style>
        img {
            display: block;
            max-width: 100%;
            height: auto;
            /*
            width:100%;
            height:100%;
            object-fit: scale-down;
            */
        }
        #book-content > * {
            max-height: 400px;
        }
        #book-content {
            columns: 1;
            column-gap: 0;
            height: 400px;
            
            /*column-gap: 50vw;*/
            /*transform: translate(calc(-400px - 50vw));*/
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

    getSectionStyleReferences(section) {
        /*
         * Returns all references to stylesheet names in a section
         */

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
    recCreateElements(parent, children) {
        /*
         * Recursively creates and appends child
         * elements to the respective child's parent
         */
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

    createMarker() {
        /*
         * Crates a marker that signifies the end of a section
         * which is used in calculating max offset value
         */
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
    loadSection(book, section_num) {
        book.then((book) => {
            this.loadStyles(book, section_num);
            this.loadContent(book, section_num);
            this.sectionsCount = book.sections.length;
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
        return element.offsetLeft;
    }
    getMaxOffset() {
        const marker = this.shadowRoot.getElementById("endMarker");
        return this.getElementOffset(marker);
    }

    calcNextOffset(inPositiveDirection) {
        const displayWidth = this.content.offsetWidth;
        const currentOffset = this.getCurrentOffset();

        const minPos = 0;
        const maxPos = this.getMaxOffset() / displayWidth;
        const currentPos = Math.abs(currentOffset / displayWidth);
        console.log("min max", currentPos, "/", maxPos);

        if (inPositiveDirection) {
            if (currentPos + 1 >= minPos && currentPos + 1 <= maxPos) {
                return currentOffset - displayWidth;
            }
        } else {
            if (currentPos - 1 >= minPos && currentPos - 1 <= maxPos) {
                return currentOffset + displayWidth;
            }
        }
    }
    btnClickEvent(next) {
        /*
         * Incerements offset to go to the
         * next part of the text (next=true)
         * or to go back (next=false)
         */
        const newOffset = this.calcNextOffset(next);
        this.setCurrentOffset(newOffset);
    }

    connectedCallback() {
        const bookPath = this.getAttribute("book-path");
        this.book = this.asyncLoadBook(bookPath);
        this.page = this.getAttribute("book-page");

        this.loadSection(this.book, this.page);

        const nextBtn = this.shadowRoot.querySelector("button#next");
        const backBtn = this.shadowRoot.querySelector("button#back");

        nextBtn.addEventListener("click", () => {
            this.btnClickEvent(true);
        });
        backBtn.addEventListener("click", () => {
            this.btnClickEvent(false);
        });
    }
    disconnectedCallback() {
        const nextBtn = this.shadowRoot.querySelector("button#next");
        const backBtn = this.shadowRoot.querySelector("button#back");
        nextBtn.removeEventListener("click", this.btnClickEvent);
        backBtn.removeEventListener("click", this.btnClickEvent);
    }
    isAValidPage(updatedPage) {
        // Checks if it's a first render
        if (this.page !== undefined) {
            return updatedPage >= 0 && updatedPage <= this.sectionsCount - 1;
        }
    }

    attributeChangedCallback() {
        // Triggered when next page or
        // previous page button is clicked
        const updatedPageNum = this.getAttribute("book-page");

        if (this.isAValidPage(updatedPageNum)) {
            this.page = updatedPageNum;
            this.loadSection(this.book, this.page);
        }
        this.setCurrentOffset(0);
    }
}

window.customElements.define("book-component", BookComponent);
