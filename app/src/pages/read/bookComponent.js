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
            height: 400px;
            column-gap: 50vw;
            /*transform: translate(calc(-400px - 50vw));*/
        }
        </style>
        <style id="book-style"></style>
        <div id="book-content"></div>
    </section>
`;

class BookComponent extends HTMLElement {
    // Listen for changes in attribute
    static get observedAttributes() {
        return ["book-page"];
    }
    constructor() {
        super();

        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
    async asyncLoadBook(bookPath) {
        const book = await window.api.invoke("app:on-book-import", bookPath);
        return book;
    }

    getSectionStyles(section) {
        // First tag of a section is the head tag
        const headLinks = section[0].children.filter((elem) => {
            return elem.tag === "link";
        });

        const sectionStyles = headLinks.map((link) => link?.attrs?.href);
        return sectionStyles;
    }

    loadStyles(book, section_num) {
        // Loads styles into book-component
        const section = book.sections[section_num];
        const style = this.shadowRoot.getElementById("book-style");
        const sectionStyles = this.getSectionStyles(section);

        const headStyles = section[0].children.filter((elem) => {
            return elem.tag === "style";
        });
        const inlineStyles = headStyles[0]?.children?.[0]?.text || "";

        style.innerHTML = inlineStyles;
        console.log("after!!", { ys: style.innerHTML });
        Object.keys(book.styles).forEach((index) => {
            const bookStyle = book.styles[index];
            if (sectionStyles.includes(bookStyle.href)) {
                style.innerHTML += bookStyle._data;
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

    loadContent(book, section_num) {
        const content = this.shadowRoot.getElementById("book-content");
        content.innerHTML = "";
        // Making a copy of an array
        const section = book.sections[section_num].slice();
        // Removes head tag from section
        section.shift();
        this.recCreateElements(content, section);
    }

    loadSection(book, section_num) {
        book.then((book) => {
            this.loadStyles(book, section_num);
            this.loadContent(book, section_num);
            this.sectionsCount = book.sections.length;
        });
    }

    connectedCallback() {
        const bookPath = this.getAttribute("book-path");
        this.book = this.asyncLoadBook(bookPath);
        this.page = this.getAttribute("book-page");

        this.loadSection(this.book, this.page);
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
        const updatedPage = this.getAttribute("book-page");

        console.log("valid", this.isAValidPage(updatedPage));

        if (this.isAValidPage(updatedPage)) {
            this.page = this.getAttribute("book-page");
            this.loadSection(this.book, this.page);
        }
    }
}

window.customElements.define("book-component", BookComponent);
