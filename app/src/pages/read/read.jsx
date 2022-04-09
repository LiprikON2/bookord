import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useHotkeys, useViewportSize, useDidUpdate, useListState } from "@mantine/hooks";
import {
    readConfigRequest,
    readConfigResponse,
    writeConfigRequest,
} from "secure-electron-store";

import Link from "components/Link";
import Button from "components/Button";
import ImageModal from "components/ImageModal";
import ROUTES from "Constants/routes";
import "./bookComponent";
import "./Read.css";

const clamp = (min, value, max) => {
    return Math.min(Math.max(value, min), max);
};

const Read = () => {
    const [bookmarks, setBookmarks] = useState({});
    const [recentBooks, setRecentBooks] = useListState([]);

    const retriveBookmarks = (bookName) => {
        return new Promise((resolve, reject) => {
            window.api.store.send(readConfigRequest, "bookmarks");

            window.api.store.onReceive(readConfigResponse, (args) => {
                if (args.key === "bookmarks" && args.success) {
                    const retrivedBookmarks = args.value ?? {};
                    setBookmarks(retrivedBookmarks);

                    const bookmarkList = retrivedBookmarks?.[bookName] ?? [];
                    resolve(bookmarkList);
                }
            });
        });
    };

    const loadBookComponent = (bookObj, isAlreadyParsed = false) => {
        // Stop handling config respones if the book is being loaded
        window.api.store.clearRendererBindings();
        const bookRef = bookComponentRef.current;
        const bookName = bookObj.bookFile.name;
        const promise = retriveBookmarks(bookName);

        promise.then((bookmarkList) => {
            bookRef.loadBook(bookObj, bookmarkList, isAlreadyParsed);
            bookRef.addEventListener("imgClickEvent", handleImgClick);
            bookRef.addEventListener("saveBookmarksEvent", handleSavingBookmarks);
            bookRef.addEventListener("saveParsedBookEvent", handleSavingParsedBook);
        });
    };
    // TODO ensure refresh is properly handled
    const location = useLocation();

    const [page, setPage] = useState(1);

    // Callback ref for passing object to the web component
    const bookComponentRef = useRef(null);
    const setBookComponentRef = useCallback((bookComponent) => {
        if (bookComponent) {
            const bookSource = location?.state?.book ? "location" : "last";

            // Send an IPC request to get config
            window.api.store.send(readConfigRequest, "recentBooks");
            window.api.store.send(readConfigRequest, "allBooks");

            // Listen for responses from the electron store
            window.api.store.onReceive(readConfigResponse, (args) => {
                // Check first if the requested book is already parsed
                // i.e. is currently in recent books
                if (args.key === "recentBooks" && args.success) {
                    const retrivedRecentBooks = args.value ?? [];
                    setRecentBooks.setState(retrivedRecentBooks);

                    if (retrivedRecentBooks) {
                        let parsedBook;
                        if (bookSource === "location") {
                            // Check if book from location is in recent books
                            const bookName = location.state.book.name;
                            retrivedRecentBooks.forEach((bookObj) => {
                                if (bookObj.bookFile.name === bookName) {
                                    parsedBook = bookObj;
                                }
                            });
                        } else if (bookSource === "last") {
                            // The last book in the list of recent books is the last opened book
                            parsedBook =
                                retrivedRecentBooks[retrivedRecentBooks.length - 1];
                        }
                        if (parsedBook) {
                            loadBookComponent(parsedBook, true);
                        }
                    }
                }
                // Provide unparsed book, last opened book are always parsed
                if (
                    args.key === "allBooks" &&
                    args.success &&
                    bookSource === "location"
                ) {
                    const allBooks = args.value;
                    console.log("GOT allBooks", allBooks);
                    const bookName = location.state.book.name;
                    const bookObj = allBooks[bookName];

                    loadBookComponent(bookObj);
                }
            });
        }

        bookComponentRef.current = bookComponent;

        return () => {
            bookComponent.removeEventListener("imgClickEvent", handleImgClick);
        };
    }, []);

    const [imageModalSrc, setImageModalSrc] = useState();
    const handleImgClick = (e) => {
        setImageModalSrc(e.detail.src);
    };
    const handleSavingBookmarks = (e) => {
        const bookName = e.detail.bookName;
        const bookmarkList = e.detail.bookmarkList;

        const updatedBookmarks = {
            [bookName]: bookmarkList,
        };
        const mergedBookmarks = Object.assign({}, bookmarks, updatedBookmarks);
        window.api.store.send(writeConfigRequest, "bookmarks", mergedBookmarks);
        setBookmarks(mergedBookmarks);
    };
    const handleSavingParsedBook = (e) => {
        const parsedBook = e.detail.parsedBook;

        setRecentBooks.append(parsedBook);
        // console.log("sending", parsedBook, "vs", recentBooks);
        window.api.store.send(writeConfigRequest, "recentBooks", recentBooks);
    };

    const goNext = () => {
        flipNPages(1);
    };
    const goBack = () => {
        flipNPages(-1);
    };

    const flipNPages = (nPageShift) => {
        const book = bookComponentRef.current;

        const currentPage = book.bookState.getCurrentBookPage(book) + 1;
        const validNextPage = book.enforcePageRange(currentPage + nPageShift);
        setPage(validNextPage);
    };

    useHotkeys([
        ["ArrowRight", () => goNext()],
        ["ArrowLeft", () => goBack()],
        ["ctrl + ArrowRight", () => flipNPages(5)],
        ["ctrl + ArrowLeft", () => flipNPages(-5)],
    ]);

    useEffect(() => {
        return () => {
            // Terminate child process when user leaves page during book parsing
            window.api.send("app:on-stop-parsing");
            window.api.store.clearRendererBindings();
        };
    }, []);

    const { height, width } = useViewportSize();
    // todo set init value
    const [size, setSize] = useState(400);

    const resize = () => {
        const book = bookComponentRef.current;
        const aspectRatio = book.aspectRatio;

        const lowerbound = 200;
        const upperbound = Math.max(Math.ceil(height / (aspectRatio * 1.6)), lowerbound);

        const newSize = clamp(lowerbound, Math.ceil(width / 2), upperbound);

        // Get the precentage difference between two values
        const percentageDiff = Math.abs(newSize - size) / ((newSize + size) / 2);
        // Check if size change is in more than 10%
        if (percentageDiff > 0.1) {
            setSize(newSize);
            book.resize(newSize);
        }
        return newSize;
    };

    useDidUpdate(() => {
        resize();
    }, [width, height]);

    return (
        <>
            <section className="section">
                <code>w:{width}</code>
                <code>h:{height}</code>
                <br />
                <code>size:{size}</code>

                <h1>Read</h1>
                <Link to={ROUTES.LIBRARY}>Home</Link>
                <div
                    className="component-container"
                    style={{
                        visibility: bookComponentRef !== null ? "visible" : "hidden",
                    }}>
                    <book-component ref={setBookComponentRef} book-page={page} />
                </div>
                <ImageModal src={imageModalSrc} setSrc={setImageModalSrc}></ImageModal>
                <div className="button-group">
                    <Button onClick={goBack}>Back</Button>
                    <Button onClick={goNext}>Next</Button>
                </div>
            </section>
        </>
    );
};
// TODO check tf visibilty for
// TODO move UI to react
// TODO add skeleton loading animation
// TODO add page counting loading animation

export default Read;
