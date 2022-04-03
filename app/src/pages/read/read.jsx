import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useHotkeys } from "@mantine/hooks";
import { readConfigRequest, readConfigResponse } from "secure-electron-store";

import Link from "components/Link";
import Button from "components/Button";
import ImageModal from "components/ImageModal";
import ROUTES from "Constants/routes";
import "./bookComponent";
import "./Read.css";

const Read = () => {
    const location = useLocation();

    const [page, setPage] = useState(1);

    // Callback ref for passing object to the web component
    const bookComponentRef = useRef(null);
    const setBookComponentRef = useCallback((bookComponent) => {
        if (bookComponent) {
            // Send an IPC request to get config
            window.api.store.send(readConfigRequest, "interactionStates");

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

                    bookComponent.loadBook(bookFile.path, interactionStates);
                    bookComponent.addEventListener("imgClickEvent", handleImgClick);
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

    const goNext = () => {
        flipNPages(1);
    };
    const goBack = () => {
        flipNPages(-1);
    };
    const resize = () => {
        const bookRef = bookComponentRef.current;
        bookRef.resize(600);
    };

    const flipNPages = (nPageShift) => {
        const bookRef = bookComponentRef.current;
        if (!bookRef.isInit) return;

        const currentPage = bookRef.bookState.getCurrentBookPage(bookRef) + 1;
        const validNextPage = bookRef.enforcePageRange(currentPage + nPageShift);
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
            window.api.send("app:on-stop-parsing");
            window.api.store.clearRendererBindings();
        };
    }, []);

    return (
        <>
            <section className="section">
                <h1>Read</h1>
                <Link to={ROUTES.LIBRARY}>Home</Link>
                <div
                    className="book-container"
                    style={{
                        visibility: bookComponentRef !== null ? "visible" : "hidden",
                    }}>
                    <book-component ref={setBookComponentRef} book-page={page} />
                </div>
                <ImageModal src={imageModalSrc} setSrc={setImageModalSrc}></ImageModal>
                <div className="button-group">
                    <Button onClick={goBack}>Back</Button>
                    <Button onClick={goNext}>Next</Button>
                    <Button onClick={resize}>resize</Button>
                </div>
            </section>
        </>
    );
};

export default Read;
