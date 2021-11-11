const template = document.createElement("template");
template.innerHTML = `
    <section>
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
        const style = this.shadowRoot.getElementById("book-style");
        const sectionStyles = this.getSectionStyles(book.sections[section_num]);
        style.innerHTML = "";

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
                if (element?.text !== undefined) {
                    tag.innerText = element.text;
                }
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
        });
    }

    connectedCallback() {
        const bookPath = this.getAttribute("book-path");
        this.book = this.asyncLoadBook(bookPath);
        this.page = this.getAttribute("book-page");

        this.loadSection(this.book, this.page);
    }

    attributeChangedCallback() {
        // Triggered when next page or
        // previous page button is clicked
        if (this.page !== undefined) {
            this.page = this.getAttribute("book-page");

            this.loadSection(this.book, this.page);
        }
    }
}

window.customElements.define("book-component", BookComponent);
