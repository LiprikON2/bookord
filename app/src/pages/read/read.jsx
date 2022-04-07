import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { useHotkeys, useViewportSize, useDidUpdate } from "@mantine/hooks";
import { readConfigRequest, readConfigResponse } from "secure-electron-store";

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
    const location = useLocation();

    const [page, setPage] = useState(1);

    // Callback ref for passing object to the web component
    const bookComponentRef = useRef(null);
    const setBookComponentRef = useCallback((bookComponent) => {
        if (bookComponent) {
            // Send an IPC request to get config
            window.api.store.send(readConfigRequest, "interactionStates");
            // window.api.store.send(readConfigRequest, "appState");

            // Listen for responses from the electron store
            window.api.store.onReceive(readConfigResponse, (args) => {
                if (args.key === "interactionStates" && args.success) {
                    window.api.store.clearRendererBindings();
                    const interactionStates = args.value;

                    let bookFile;
                    // Tries to get book file from link's location
                    if (location?.state?.book) {
                        bookFile = location.state.book;
                    }
                    // If no book is specified, open last opened bok
                    else if (interactionStates?.lastOpenedBook) {
                        bookFile = interactionStates.lastOpenedBook;
                    } else {
                        return;
                    }

                    bookComponent.loadBook(bookFile.name, interactionStates);
                    bookComponent.addEventListener("imgClickEvent", handleImgClick);
                }
                // if (args.key === "appState" && args.success) {
                //     window.api.store.clearRendererBindings();

                //     const appState = args.value;
                //     bookComponent.test(appState.recentBooks.recent[0]);
                // }
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

export default Read;
