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
    const bookComponentRef = useCallback((node) => {
        if (node !== null) {
            // Listen for responses from the electron store
            window.api.store.clearRendererBindings();
            window.api.store.onReceive(readConfigResponse, (args) => {
                if (args.key === "lastOpenedBook" && args.success) {
                    const lastOpenedBook = location?.state?.book || args.value;
                    node.loadBook(lastOpenedBook);
                }
            });
            // Send an IPC request to get last opened book
            window.api.store.send(readConfigRequest, "lastOpenedBook");
        }
        // return node; // todo: extract this logic into a reusable Hook (so nextPage works)
        // https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
        // https://medium.com/@teh_builder/ref-objects-inside-useeffect-hooks-eb7c15198780
    }, []);

    const enforcePageRange = (nextPage) => {
        const minPage = 1;
        const maxPage = bookComponentRef.current.bookState.getTotalBookPages();

        if (nextPage < minPage) {
            nextPage = minPage;
        } else if (nextPage > maxPage) {
            nextPage = maxPage;
        }
        return nextPage;
    };

    const goNext = () => {
        console.log("bookComponentRef", bookComponentRef.current);
        const currentPage =
            bookComponentRef.bookState.getCurrentBookPage(
                bookComponentRef.content
            ) + 1;
        const validNextPage = enforcePageRange(currentPage + 1);
        setPage(validNextPage);
    };
    const goBack = () => {
        const currentPage =
            bookComponentRef.bookState.getCurrentBookPage(
                bookComponentRef.content
            ) + 1;
        const validNextPage = enforcePageRange(currentPage - 1);
        setPage(validNextPage);
    };

    return (
        <>
            <section className="section">
                <h1>Read</h1>
                <div className="book-container">
                    <book-component ref={bookComponentRef} book-page={page} />
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
