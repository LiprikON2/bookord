///<reference path="../types/index.d.ts" />

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { useHotkeys, useDidUpdate, useListState } from "@mantine/hooks";
import {
    readConfigRequest,
    readConfigResponse,
    writeConfigRequest,
} from "secure-electron-store";

import ImageModal from "components/ImageModal";
import BookUI from "./BookUI";
import ReadContextMenu from "./ReadContextMenu";
// @ts-ignore
import ROUTES from "Constants/routes";
import "../../components/bookComponent/BookComponent";
import "./Read.css";

const Read = ({ setLastOpenedBookTitle }) => {
    const location = useLocation();

    // Callback ref for passing object to the web component
    const bookComponentRef = useRef(null);
    const setBookComponentRef = useCallback((bookComponent) => {
        if (bookComponent) {
            // @ts-ignore
            const bookSource = location?.state?.bookFile ? "location" : "last";

            // Send an IPC request to get config
            window.api.store.send(readConfigRequest, "recentBooks");

            // Listen for responses from the electron store
            window.api.store.onReceive(readConfigResponse, (args) => {
                // Check first if the requested book is already parsed
                // i.e. is currently in recent books
                if (args.key === "recentBooks" && args.success) {
                    const retrivedRecentBooks = args.value ?? [];
                    setRecentBooks.setState(retrivedRecentBooks);

                    let parsedBook;
                    if (retrivedRecentBooks.length) {
                        if (bookSource === "location") {
                            // Check if book from location is in recent books
                            // @ts-ignore
                            const bookName = location.state.bookFile.name;
                            retrivedRecentBooks.forEach((bookObj) => {
                                if (bookObj.name === bookName) {
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
                    if (!parsedBook) {
                        window.api.store.send(readConfigRequest, "allBooks");
                    }
                }
                // Provide unparsed book, last opened book are always parsed
                if (
                    args.key === "allBooks" &&
                    args.success &&
                    bookSource === "location"
                ) {
                    const allBooks = args.value;

                    // @ts-ignore
                    const bookName = location.state.bookFile.name;
                    const bookObj = allBooks[bookName];

                    loadBookComponent(bookObj);
                }
            });
        }

        bookComponentRef.current = bookComponent;
    }, []);

    const loadBookComponent = (bookObj, isAlreadyParsed = false) => {
        // Stop handling config respones if the book is being loaded
        window.api.store.clearRendererBindings();
        const bookRef = bookComponentRef.current;
        const bookName = bookObj?.bookFile?.name ?? bookObj.name;
        const promise = retriveBookmarks(bookName);

        promise.then((bookmarkList) => {
            bookRef.loadBook(bookObj, bookmarkList, isAlreadyParsed);
            bookRef.addEventListener("imgClickEvent", handleImgClick);
            bookRef.addEventListener("saveBookmarksEvent", handleSavingBookmarks);
            bookRef.addEventListener("saveParsedBookEvent", handleSavingParsedBook);
            bookRef.addEventListener("uiStateUpdate", handleUiUpdate);
        });
    };
    const [uiState, setUiState] = useState({});

    const handleUiUpdate = (e) => {
        const newState = e.detail.state;
        setUiState(() => newState);
    };

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
        setBookmarks((prevBookmarks) => ({ ...prevBookmarks, ...updatedBookmarks }));
    };

    const handleSavingParsedBook = (e) => {
        const parsedBook = e.detail.parsedBook;
        // TODO add bookFile property to recentBooks' ParsedBook
        // TODO check bookfile size property to determine amount of recent books to keep
        setRecentBooks.setState([parsedBook]);
    };

    const flipNPages = (n) => {
        bookComponentRef.current.flipNPages(n);
    };
    const pageForward = () => {
        bookComponentRef.current.pageForward();
    };
    const pageBackward = () => {
        bookComponentRef.current.pageBackward();
    };
    const sectionForward = () => {
        bookComponentRef.current.sectionForward();
    };
    const sectionBackward = () => {
        bookComponentRef.current.sectionBackward();
    };

    useDidUpdate(() => {
        const bookRef = bookComponentRef.current;
        if (bookRef.status === "ready") {
            window.api.store.send(writeConfigRequest, "bookmarks", bookmarks);
        }
    }, [bookmarks]);
    useDidUpdate(() => {
        const bookRef = bookComponentRef.current;
        if (bookRef.status === "ready") {
            window.api.store.send(writeConfigRequest, "recentBooks", recentBooks);
        }

        const lastOpenedBook = recentBooks[recentBooks.length - 1];
        if (lastOpenedBook) {
            const lastOpenedBookTitle = lastOpenedBook.info.title;
            setLastOpenedBookTitle(lastOpenedBookTitle);
        }
    }, [recentBooks]);

    const history = useHistory();
    useHotkeys([
        ["ArrowRight", () => pageForward()],
        ["ArrowLeft", () => pageBackward()],
        ["Ctrl + ArrowRight", () => flipNPages(5)],
        ["Ctrl + ArrowLeft", () => flipNPages(-5)],
        ["Ctrl + Shift + ArrowRight", () => sectionForward()],
        ["Ctrl + Shift + ArrowLeft", () => sectionBackward()],
        ["Backspace", () => history.push(ROUTES.LIBRARY)],
    ]);

    useEffect(() => {
        return () => {
            // Terminate child process when user leaves page during book parsing
            window.api.send("app:on-stop-parsing");
            window.api.store.clearRendererBindings();
        };
    }, []);

    return (
        <>
            <section className="section read-section">
                <BookUI UIState={uiState}>
                    <div
                        className="component-container"
                        style={{
                            visibility: bookComponentRef !== null ? "visible" : "hidden",
                        }}>
                        <book-component ref={setBookComponentRef} book-page={10} />
                    </div>
                </BookUI>
                <ImageModal
                    // @ts-ignore
                    name={uiState?.bookTitle}
                    src={imageModalSrc}
                    setSrc={setImageModalSrc}></ImageModal>
                <ReadContextMenu />
            </section>
        </>
    );
};
// TODO add skeleton loading animation
// TODO add page counting loading animation

export default Read;
