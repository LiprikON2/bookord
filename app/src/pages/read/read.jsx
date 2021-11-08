import React, { useState, useLayoutEffect, useEffect } from "react";
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

    const handleBookRendition = (lastOpenedBook) => {
        const bookFile = location?.state?.bookFile || lastOpenedBook;
        const book = openBook(bookFile);

        // Initialize book render
        book.then((book) => {
            const options = {
                // method: "continuous",
                width: 600,
                height: 400,
            };
            const rendition = book.renderTo("book", options);
            const counter_rendition = book.renderTo("page-counter", options);

            rendition.display();
            const d = counter_rendition.display();

            d.then(() => {
                counter_rendition.next();
                counter_rendition.next();
                counter_rendition.next();
                counter_rendition.next();
                counter_rendition.next();
            });

            setRendition(rendition);
            // countPages(counter_rendition);
        });
    };

    const goNext = () => {
        rendition.next();
        rendition.next();
        rendition.next();
        rendition.next();
        rendition.next();
        rendition.next();
        rendition.next();
        rendition.next();
        rendition.next();
        rendition.next();
        rendition.next();
        rendition.next();
        rendition.next();
        console.log("re", rendition);
    };
    const goBack = () => {
        rendition.prev();
    };

    // const countPages = (counter_rendition) => {
    //     const displayed = counter_rendition.display();
    //     // console.log("counter_rendition", counter_rendition.next);
    //     let i = 1;
    //     displayed.then(() => {
    //         while (!counter_rendition.location?.atEnd) {
    //             i++;
    //             counter_rendition.next();
    //             console.log("lop");
    //             if (i === 1000) {
    //                 console.log(counter_rendition.location);
    //                 break;
    //             }
    //         }
    //     });

    //     console.log("i", i);
    // };

    return (
        <>
            <section className="section">
                <h1>Read</h1>
                <main id="book"></main>
                <button role="button" onClick={goBack}>
                    Back
                </button>
                <button role="button" onClick={goNext}>
                    Next
                </button>
                <Link to={ROUTES.LIBRARY}>Home</Link>
                <div hidden id="page-counter"></div>
            </section>
        </>
    );
};

export default Read;
