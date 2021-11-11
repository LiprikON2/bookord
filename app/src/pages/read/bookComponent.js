import {
    readConfigRequest,
    readConfigResponse,
    writeConfigRequest,
} from "secure-electron-store";

const template = document.createElement("template");
template.innerHTML = `
    <style id="book-style"></style>
    <div id="book-content">
        im book
    </div>
`;

class BookComponent extends HTMLElement {
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
        // First tag of a section is a head tag
        const headLinks = section[0].children.filter((elem) => {
            return elem.tag === "link";
        });
        const sectionStyles = headLinks.map((link) => link?.attrs?.href);
        // Remove head tag from section after
        // extractiong all css references
        section.shift();
        return sectionStyles;
    }

    loadStyles(book, section_num) {
        // Loads styles into book-component
        const style = this.shadowRoot.getElementById("book-style");
        const sectionStyles = this.getSectionStyles(book.sections[section_num]);

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
        this.recCreateElements(content, book.sections[section_num]);
    }

    connectedCallback() {
        const bookPath = this.getAttribute("book-path");
        const book = this.asyncLoadBook(bookPath);

        book.then((book) => {
            this.loadStyles(book, 10);
            this.loadContent(book, 10);
        });
    }
}

window.customElements.define("book-component", BookComponent);
