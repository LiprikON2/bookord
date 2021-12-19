import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import {
    readConfigRequest,
    readConfigResponse,
    writeConfigRequest,
} from "secure-electron-store";

import ROUTES from "Constants/routes";
import "./bookComponent";
import "./Read.css";

const sendLastOpenedBook = (bookFile) => {
    window.api.store.send(writeConfigRequest, "lastOpenedBook", bookFile);
};

const Read = () => {
    const [book, setBook] = useState({});
    const [page, setPage] = useState(1);

    const location = useLocation();

    useEffect(() => {
        // Listen for responses from the electron store
        window.api.store.clearRendererBindings();
        window.api.store.onReceive(readConfigResponse, (args) => {
            if (args.key === "lastOpenedBook" && args.success) {
                const lastOpenedBook = location?.state?.bookFile || args.value;
                setBook(lastOpenedBook);
                sendLastOpenedBook(lastOpenedBook);
            }
        });
        // Send an IPC request to get last opened book
        window.api.store.send(readConfigRequest, "lastOpenedBook");
    }, []);

    const goNext = () => {
        setPage(page + 1);
    };
    const goBack = () => {
        setPage(page - 1);
    };

    return (
        <>
            <section className="section">
                <h1>Read</h1>
                <div className="book-container">
                    {book.path && (
                        <book-component
                            book-path={book.path}
                            book-page={page}
                        />
                    )}
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
