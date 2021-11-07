import React, { useState, useLayoutEffect, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import ePub from "epubjs";

import {
    readConfigRequest,
    readConfigResponse,
    writeConfigRequest,
} from "secure-electron-store";

import ROUTES from "Constants/routes";

const Read = () => {
    const [rendition, setRendition] = useState();

    const location = useLocation();

    const sendLastOpenedBook = (bookFile) => {
        window.api.store.send(writeConfigRequest, "lastOpenedBook", bookFile);
    };

    const openBook = (bookFile) => {
        sendLastOpenedBook(bookFile);

        const buffer = window.api.invoke("app:on-file-open", bookFile);
        const epub = buffer.then((buffer) => ePub(buffer));

        return epub;
    };

    useLayoutEffect(() => {
        // Listen for responses from the electron store
        window.api.store.clearRendererBindings();
        window.api.store.onReceive(readConfigResponse, (args) => {
            if (args.key === "lastOpenedBook" && args.success) {
                const lastOpenedBook = args.value;
                handleBookRendition(lastOpenedBook);
            }
        });
        window.api.store.send(readConfigRequest, "lastOpenedBook");
    }, []);

    const handleBookRendition = (lastOpenedBook) => {
        const bookFile = location?.state?.bookFile || lastOpenedBook;
        const book = openBook(bookFile);

        // Initialize book render
        book.then((book) => {
            const rendition = book.renderTo("book", {
                width: 600,
                height: 400,
            });
            rendition.display();
            setRendition(rendition);
        });
    };

    const goNext = () => {
        rendition.next();
    };
    const goBack = () => {
        rendition.prev();
    };

    return (
        <>
            <section className="section">
                <h1>Read</h1>
                <main id="book"></main>
                <button id="test" role="button" onClick={goBack}>
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
