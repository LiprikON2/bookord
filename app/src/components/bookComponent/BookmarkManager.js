import debounce from "lodash/debounce";

export default class BookmarkManager {
    #parentComponent;
    #bookmarkList = [{ sectionIndex: 0, elementIndex: 0 }];

    constructor(bookComponent) {
        this.#parentComponent = bookComponent;
    }

    /**
     * Sets the entire bookmarkList if provided bookmarkList is not empty.
     * @param {BookmarkList} bookmarkList
     * @returns {void}
     */
    setBookmarkList(bookmarkList) {
        if (bookmarkList.length) {
            const hasCorrectKeys = bookmarkList.every((bookmark) =>
                this.#isValidBookmark(bookmark)
            );

            if (hasCorrectKeys) {
                this.#bookmarkList = bookmarkList;
            }
        }
    }

    /**
     * Adds bookmark to the bookmarkList
     * @param {Bookmark} bookmark
     * @returns {void}
     */
    addBookmark(bookmark) {
        if (this.#isValidBookmark(bookmark)) {
            this.#bookmarkList.push(bookmark);
        }
    }

    /**
     * Returns autobookmark
     * @returns {[number, number]} - sectionIndex and elementIndex of a bookmark
     */
    getAutoBookmark() {
        const { sectionIndex, elementIndex } = this.#bookmarkList[0];
        return [sectionIndex, elementIndex];
    }

    /**
     * Sets autoBookmark to the specified bookmark
     * @param {Bookmark} bookmark
     * @returns {void}
     */
    setAutoBookmark(bookmark) {
        if (this.#isValidBookmark(bookmark)) {
            this.#bookmarkList[0] = bookmark;
        }
    }

    /**
     * Updates autoBookmark to the current position inside the book
     * @returns {void}
     */
    updateAutoBookmark() {
        const element = this.getVisibleElement();
        if (!element) return;

        const elementIndex = this.#getElementIndex(element);
        const sectionIndex = this.#parentComponent.stateManager.currentSection;

        this.setAutoBookmark({ sectionIndex, elementIndex });
    }

    /**
     * Returns currently fully visible or partially visible element
     * @returns {HTMLElement}
     */
    getVisibleElement() {
        const fullyVisibleElement = this.#recGetVisibleElement();

        if (!fullyVisibleElement) {
            const partiallyVisibleElement = this.#recGetVisibleElement(null, false);

            if (!partiallyVisibleElement) {
                throw new Error("Couldn't find visible element");
            }

            return partiallyVisibleElement;
        }
        return fullyVisibleElement;
    }

    /**
     * Emits "saveBookmarksEvent" to save bookmarks externally
     * @param {Event} e - Event
     * @listens Event
     * @return {void}
     */
    emitSaveBookmarks = debounce((e) => {
        let book;
        if (this.#parentComponent.status !== "sectionReady") {
            book = this.#parentComponent.book;
        } else {
            book = this.#parentComponent.initBook;
        }

        book.then(({ name: bookName }) => {
            this.updateAutoBookmark();
            const saveBookmarksEvent = new CustomEvent("saveBookmarksEvent", {
                bubbles: true,
                cancelable: false,
                composed: true,
                detail: {
                    bookName,
                    bookmarkList: this.#bookmarkList,
                },
            });

            // this.#parentComponent.dispatchEvent(saveBookmarksEvent); // todo uncomment
        });
    }, 500);

    /**
     * Returns true if bookmark object has "sectionIndex" and "elementIndex" keys, throws error otherwise
     * @param {Bookmark} bookmark
     * @returns {boolean}
     */
    #isValidBookmark(bookmark) {
        const hasKeys = "sectionIndex" in bookmark && "elementIndex" in bookmark;
        if (!hasKeys) {
            throw new Error("The format of a bookmark is wrong.");
        }
        return hasKeys;
    }

    // TODO use binary search
    /**
     * Recursively searches for elements that are fully visible to act as an anchor for the bookmark
     * @param {HTMLCollection} [elements]
     * @returns {HTMLElement | any}
     */
    #recGetVisibleElement(elements, strict = true) {
        if (!elements) {
            elements = this.#parentComponent.contentElem.children;
        }

        for (let element of elements) {
            const [isFullyVis, isAtLeastPartVis] =
                this.#parentComponent.checkVisibility(element);
            const requiredVisibility = strict ? isFullyVis : isAtLeastPartVis;
            const hasChildren = element.children.length;

            if (requiredVisibility && !hasChildren) {
                return element;
            } else if (hasChildren) {
                const descendantElem = this.#recGetVisibleElement(
                    element.children,
                    strict
                );
                if (descendantElem) {
                    return descendantElem;
                }
            }
        }
        return null;
    }

    /**
     * Returns selector of an element based on nth-child with respect to the content element
     * @param {HTMLElement} element
     * @returns {number}
     */
    #getElementIndex(element) {
        const allElems = this.#parentComponent.contentElem.querySelectorAll("*");
        let nthElement;
        [...allElems].some((elem, index) => {
            const isFound = elem === element;
            if (isFound) {
                nthElement = index;
            }
            return isFound;
        });
        return nthElement;
    }
}
