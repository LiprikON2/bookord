import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";

import { readConfigRequest, readConfigResponse } from "secure-electron-store";

import ROUTES from "Constants/routes";
import "./bookComponent";
import "./Read.css";

function useEventListener(eventName, handler, element = window) {
    // Create a ref that stores handler
    const savedHandler = useRef();
    // Update ref.current value if handler changes.
    // This allows our effect below to always get latest handler ...
    // ... without us needing to pass it in effect deps array ...
    // ... and potentially cause effect to re-run every render.
    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);
    useEffect(
        () => {
            // Make sure element supports addEventListener
            // On
            const isSupported = element && element.addEventListener;
            if (!isSupported) return;
            // Create event listener that calls handler function stored in ref
            const eventListener = (event) => savedHandler.current(event);
            // Add event listener
            element.addEventListener(eventName, eventListener);
            // Remove event listener on cleanup
            return () => {
                element.removeEventListener(eventName, eventListener);
            };
        },
        [eventName, element] // Re-run if eventName or element changes
    );
}

const Read = () => {
    const location = useLocation();

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

                    const bookPath = bookFile?.path;
                    const interactionStates = args.value;
                    const savedInteractionState = interactionStates?.[bookPath];
                    node.loadBook(savedInteractionState, interactionStates);
                }
            });
        }

        bookComponentRef.current = node;
    }, []);

    const handleKeypress = (event) => {
        if (event.key === "ArrowRight" && event.ctrlKey) {
            flipNPages(5);
        } else if (event.key === "ArrowLeft" && event.ctrlKey) {
            flipNPages(-5);
        } else if (event.key === "ArrowRight") {
            goNext();
        } else if (event.key === "ArrowLeft") {
            goBack();
        }
    };
    // Add event listener using custom hook
    useEventListener("keydown", handleKeypress);

    const goNext = () => {
        flipNPages(1);
    };
    const goBack = () => {
        flipNPages(-1);
    };

    const flipNPages = (nPageShift) => {
        const bookRef = bookComponentRef.current;
        const currentPage = bookRef.bookState.getCurrentBookPage(bookRef) + 1;
        const validNextPage = bookRef.enforcePageRange(
            currentPage + nPageShift
        );
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
