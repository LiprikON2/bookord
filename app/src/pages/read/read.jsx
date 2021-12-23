import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";

import { readConfigRequest, readConfigResponse } from "secure-electron-store";

import ROUTES from "Constants/routes";
import "./bookComponent";
import "./Read.css";

const Read = () => {
    const [page, setPage] = useState(1);

    const location = useLocation();

    // Callback ref for passing object to the web component
    function useHookWithRefCallback() {
        const ref = useRef(null);
        const setRef = useCallback((node) => {
            if (node) {
                // Listen for responses from the electron store
                window.api.store.clearRendererBindings();
                window.api.store.onReceive(readConfigResponse, (args) => {
                    if (args.key === "lastOpenedBook" && args.success) {
                        const lastOpenedBook =
                            location?.state?.book || args.value;
                        node.loadBook(lastOpenedBook);
                    }
                });
                // Send an IPC request to get last opened book
                window.api.store.send(readConfigRequest, "lastOpenedBook");
            }

            ref.current = node;
        }, []);

        return [ref, setRef];
    }
    const [bookComponentRef, setBookComponentRef] = useHookWithRefCallback();

    const enforcePageRange = (nextPage) => {
        const bookRef = bookComponentRef.current;
        const minPage = 1;
        const maxPage = bookRef.bookState.getTotalBookPages();

        if (nextPage < minPage) {
            nextPage = minPage;
        } else if (nextPage > maxPage) {
            nextPage = maxPage;
        }
        return nextPage;
    };

    const goNext = () => {
        const bookRef = bookComponentRef.current;
        const currentPage =
            bookRef.bookState.getCurrentBookPage(bookRef.content) + 1;
        const validNextPage = enforcePageRange(currentPage + 1);
        setPage(validNextPage);
    };
    const goBack = () => {
        const bookRef = bookComponentRef.current;
        const currentPage =
            bookRef.bookState.getCurrentBookPage(bookRef.content) + 1;
        const validNextPage = enforcePageRange(currentPage - 1);
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
