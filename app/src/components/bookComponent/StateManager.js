class BookState {
    #parentComponent;

    title = "";
    sectionCount = 0;

    get currentPage() {
        return;
    }
    get totalPages() {
        return;
    }

    constructor(bookComponent) {
        this.#parentComponent = bookComponent;
    }
}
class SectionState {
    #parentComponent;

    title = "";
    sectionCount = 0;

    get currentPage() {
        const displayWidth = this.#parentComponent._getDisplayWidth();
        const currentOffset = this.#parentComponent._getCurrentOffset();
        const currentPage = currentOffset / displayWidth;
        return currentPage + 1;
    }
    get totalPages() {
        const totalWidth = this.#parentComponent._getTotalDisplayWidth();
        const width = this.#parentComponent._getDisplayWidth();

        const sectionPages = totalWidth / width;
        const rounded = Math.round(sectionPages);

        if (Math.abs(rounded - sectionPages) > 0.01)
            console.log(
                "Warning. countSectionPages rounding error",
                rounded,
                sectionPages
            );

        return rounded;
    }
    get firstPage() {
        return 1;
    }
    get lastPage() {
        return this.totalPages;
    }

    constructor(bookComponent) {
        this.#parentComponent = bookComponent;
    }
}

export default class StateManager {
    #parentComponent;

    totalSections = 0;
    bookTitle = "";

    currentSection;
    sectionPagesArr = [0];
    currentSectionTitle = "";

    book;
    section;

    constructor(bookComponent) {
        this.#parentComponent = bookComponent;

        this.book = new BookState(this.#parentComponent);
        this.section = new SectionState(this.#parentComponent);
    }

    async setInitBookInfo(book) {
        book = await book;
        this.totalSections = book.sectionsTotal;
        this.bookTitle = book.info.title;
    }

    getSectionBookPageBelongsTo(page) {
        const sliceOfPages = [];
        for (const [index, pageCount] of this.sectionPagesArr.entries()) {
            sliceOfPages.push(pageCount);
            const sumOfPages = sliceOfPages.reduce(
                (prevValue, currValue) => prevValue + currValue
            );
            if (page <= sumOfPages) return index;
        }
        throw new Error("Couldn't get section book page belonged to.");
    }

    getCurrentSectionPage() {
        const displayWidth = this.#parentComponent._getDisplayWidth();
        const currentOffset = this.#parentComponent._getCurrentOffset();
        const currentPage = currentOffset / displayWidth;
        return currentPage + 1;
    }
    getTotalSectionPages(sectionIndex) {
        return this.sectionPagesArr[sectionIndex];
    }

    isSectionCounted(section) {
        return !!this.sectionPagesArr[section];
    }
    getCurrentBookPage() {
        const sumOfPages = this._sumFirstNArrayItems(
            this.sectionPagesArr,
            this.currentSection
        );
        const totalSectionPages = this.getTotalSectionPages(this.currentSection);
        const totalSectionPages2 = this.#parentComponent.countSectionPages();
        const currentSectionPage = this.getCurrentSectionPage();

        return sumOfPages - totalSectionPages2 + currentSectionPage;
    }
    getTotalBookPages() {
        const totalBookPages = this.sectionPagesArr.reduce(
            (prevValue, currValue) => prevValue + currValue
        );
        return totalBookPages;
    }

    _sumFirstNArrayItems(array, n) {
        const arraySlice = array.slice(0, n + 1);
        const arraySum = arraySlice.reduce(
            (prevValue, currValue) => prevValue + currValue
        );
        return arraySum;
    }

    /**
     * Updates book's state
     * @param {number} currentSection
     * @returns {Promise<void>}
     */
    async updateBookSectionState(currentSection) {
        const book = await this.#parentComponent.book;

        this.currentSection = currentSection;
        this.currentSectionTitle = this.#recGetSectionTitle(
            book,
            book.structure,
            this.currentSection
        );
    }

    /**
     * Recursively extracts section (chapter) title from book's TOC
     * @param {InitBook | ParsedBook} book
     * @param {HtmlObject} toc - Table of Contents
     * @param {number} sectionIndex - Section index
     * @param {boolean} [root] - A way to differentiate between recursive and non-recursive function call
     * @returns {string}
     */
    #recGetSectionTitle(book, toc, sectionIndex, root = true) {
        let descendantSectionTitle;
        for (let tocEntry of toc) {
            const tocEntryChildren = tocEntry?.children;
            if (tocEntryChildren) {
                descendantSectionTitle = this.#recGetSectionTitle(
                    book,
                    tocEntryChildren,
                    sectionIndex,
                    false
                );
                if (descendantSectionTitle) break;
            }
        }
        const tocEntry = toc.find(
            (tocEntry) => tocEntry.sectionId === book.sectionNames[sectionIndex]
        );
        const sectionTitle = tocEntry?.name;

        if (descendantSectionTitle) {
            // Use the deep-nested title if possible
            return descendantSectionTitle;
        } else if (sectionTitle) {
            return sectionTitle;
        } else if (root && sectionIndex >= 0 && sectionIndex < this.totalSections) {
            // Untitled sections try to use previous section's title
            const prevSectionTitle = this.#recGetSectionTitle(
                book,
                toc,
                sectionIndex - 1
            );
            return prevSectionTitle;
        } else {
            return "";
        }
    }
}
