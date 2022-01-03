import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";

import { readConfigRequest, readConfigResponse } from "secure-electron-store";

import ROUTES from "Constants/routes";
import "./bookComponent";
import "./Read.css";

const Read = () => {
    const location = useLocation();
    const initStorage = window.api.store.initial();

    const [page, setPage] = useState(1);

    // Callback ref for passing object to the web component
    const bookComponentRef = useRef(null);
    const setBookComponentRef = useCallback((node) => {
        if (node) {
            window.api.store.clearRendererBindings();

            // Send an IPC request to get config
            window.api.store.send(readConfigRequest, "interactionStates");

            // Listen for responses from the electron store
            window.api.store.onReceive(readConfigResponse, (args) => {
                if (args.key === "interactionStates" && args.success) {
                    let bookFile;
                    // Tries to get book file from link's location
                    if (location?.state?.book) {
                        bookFile = location.state.book;
                    }
                    // If no book is specified, open last opened bok
                    else if (args.value?.lastOpenedBook) {
                        bookFile = args.value.lastOpenedBook;
                    } else {
                        return;
                    }

                    const defaultInteractionState = {
                        ...bookFile,
                        section: 0,
                        sectionPage: 0,
                    };

                    const bookPath = defaultInteractionState?.path;
                    const interactionStates = args.value;
                    const savedInteractionState = interactionStates?.[bookPath];

                    if (savedInteractionState) {
                        node.loadBook(savedInteractionState, interactionStates);
                    } else {
                        node.loadBook(
                            defaultInteractionState,
                            interactionStates
                        );
                    }
                }
            });
        }

        bookComponentRef.current = node;
    }, []);

    const goNext = () => {
        const bookRef = bookComponentRef.current;
        const currentPage =
            bookRef.bookState.getCurrentBookPage(bookRef.contentElem) + 1;
        const validNextPage = bookRef.enforcePageRange(currentPage + 1);
        setPage(validNextPage);
    };
    const goBack = () => {
        const bookRef = bookComponentRef.current;
        const currentPage =
            bookRef.bookState.getCurrentBookPage(bookRef.contentElem) + 1;
        const validNextPage = bookRef.enforcePageRange(currentPage - 1);
        setPage(validNextPage);
    };

    return (
        <>
            <section className="section">
                <h1>Read</h1>
                <div className="book-container">
                    <book-component
                        ref={setBookComponentRef}
                        book-page={page}
                    />
                </div>

                <button role="button" onClick={goBack}>
                    Back
                </button>
                <button role="button" onClick={goNext}>
                    Next
                </button>
                <Link to={ROUTES.LIBRARY}>Home</Link>
            </section>
        </>
    );
};

export default Read;
