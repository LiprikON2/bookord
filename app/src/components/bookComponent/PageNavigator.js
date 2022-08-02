export default class PageNavigator {
    #parentComponent;
    currentSection;
    totalSections = 0;
    sectionPagesArr = [0];
    bookTitle = "";
    currentSectionTitle = "";

    constructor(bookComponent) {
        this.#parentComponent = bookComponent;
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

    // Zero-based
    getCurrentSectionPage() {
        const displayWidth = this.#parentComponent._getDisplayWidth();
        const currentOffset = this._getCurrentOffset();
        const currentPage = Math.abs(currentOffset / displayWidth);
        return currentPage;
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
    _getCurrentOffset() {
        // TODO make positive
        // Strips all non-numeric characters from a string
        return (
            parseInt(
                this.#parentComponent.contentElem.style.transform.replace(/[^\d.-]/g, "")
            ) ?? 0
        );
    }
}
