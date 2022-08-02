export default class StyleLoader {
    #shadowRoot;

    constructor(bookComponent) {
        this.#shadowRoot = bookComponent.shadowRoot;
    }

    /**
     * Collects book's styles and adds them to the book component
     * @param {InitBook|ParsedBook} book
     * @param {Array<HtmlObject>} section
     * @returns {Promise<void>}
     */
    async loadStyles(book, section) {
        const styleElem = this.#shadowRoot.getElementById("book-style");

        const sectionStyles = this.#getSectionStyleReferences(section);
        const inlineStyles = this.#getSectionInlineStyles(section);

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
     * Returns all references to stylesheet names in a section
     * @param {HtmlObject} section
     * @returns {Array<string>}
     */
    #getSectionStyleReferences(section) {
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
    #getSectionInlineStyles(section) {
        const headStyles = section[0].children.filter((elem) => {
            return elem.tag === "style";
        });
        return headStyles[0]?.children?.[0]?.text ?? "";
    }
}
