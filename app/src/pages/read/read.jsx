import React, { useState, useLayoutEffect, useEffect } from "react";
import ReactDOM from "react-dom";
import { Link, useParams, useLocation } from "react-router-dom";
import ePub from "epubjs";

import {
    readConfigRequest,
    readConfigResponse,
    writeConfigRequest,
} from "secure-electron-store";

import ROUTES from "Constants/routes";

const sendLastOpenedBook = (bookFile) => {
    window.api.store.send(writeConfigRequest, "lastOpenedBook", bookFile);
};

const openBook = (bookFile) => {
    sendLastOpenedBook(bookFile);

    const buffer = window.api.invoke("app:on-file-open", bookFile);
    const epub = buffer.then((buffer) => ePub(buffer));

    return epub;
};

const Read = () => {
    const [rendition, setRendition] = useState();

    const location = useLocation();

    useLayoutEffect(() => {
        // Listen for responses from the electron store
        window.api.store.clearRendererBindings();
        window.api.store.onReceive(readConfigResponse, (args) => {
            if (args.key === "lastOpenedBook" && args.success) {
                const lastOpenedBook = args.value;
                handleBookRendition(lastOpenedBook);
            }
        });
        // Send an IPC request to get last opened book
        window.api.store.send(readConfigRequest, "lastOpenedBook");
    }, []);

    const asyncLoadBook = async (bookFile) => {
        const a = await window.api.invoke("app:on-book-import", bookFile);

        // EXAMPLE ++++++++++
        const element = React.createElement(
            "h1",
            { className: "greeting" },
            "Hello im child"
        );
        const parent = React.createElement("h1", { className: "greeting" }, [
            "im text",
            element,
        ]);
        console.log("Example", parent);
        // EXAMPLE ++++++++++

        ReactDOM.render(
            recConvertToReactElement(a[0]),
            document.getElementById("new")
        );
        return a;
    };

    const recConvertToReactElement = (htmlObject) => {
        /*
         * Recursively converts every html object gotten
         * from parsing epub to a React element
         */
        console.log("parent", htmlObject);
        if (htmlObject.tag) {
            return React.createElement(
                htmlObject.tag,
                htmlObject.attrs,
                htmlObject.children?.map((child) =>
                    recConvertToReactElement(child)
                )
            );
        } else {
            return htmlObject.text;
        }
    };

    const handleBookRendition = (lastOpenedBook) => {
        const bookFile = location?.state?.bookFile || lastOpenedBook;
        const book = openBook(bookFile);

        asyncLoadBook(bookFile);
        // Initialize book render
        book.then((book) => {
            const options = {
                // method: "continuous",
                width: 600,
                height: 400,
            };
            const rendition = book.renderTo("book", options);

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
                <div id="new"></div>
                <main id="book"></main>

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
