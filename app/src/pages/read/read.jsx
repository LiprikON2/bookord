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
    const [lastOpenedBook, setLastOpenedBook] = useState();
    const location = useLocation();

    // const getLastOpenedBook = () => {
    //     window.api.store.send(readConfigRequest, "lastOpenedBook");
    //     window.api.store.onReceive(readConfigResponse, (args) => {
    //         console.log("recived+++", args.value.name);
    //         return args.value;
    //     });
    //     // return window.api.store.send(readConfigRequest, "lastOpenedBook");
    //     // return window.api.store.initial()["lastOpenedBook"];
    // };
    const sendLastOpenedBook = (bookFile) => {
        console.log("COMMITING NEW LAST BOOK:", bookFile?.name);
        window.api.store.send(writeConfigRequest, "lastOpenedBook", bookFile);
    };

    const openBook = (bookFile) => {
        sendLastOpenedBook(bookFile);

        const buffer = window.api.invoke("app:on-file-open", bookFile);
        const epub = buffer.then((buffer) => ePub(buffer));

        return epub;
    };

    // useEffect(() => {

    // Listen for eletron store responses
    // window.api.store.onReceive(readConfigResponse, function (args) {
    //     if (args.success) {
    //         // Do something with the value from file
    //         console.log("wtf", args);
    //     }
    // });
    // const initial = window.api.store.initial()["test"];
    // window.api.store.send(writeConfigRequest, "test", "14");
    // console.log("trio", initial);
    // }, []);

    useLayoutEffect(() => {
        // setLast("Please, work", console.log("fuuuck", last));
        // console.log("Here:", last);

        // Listen for responses from the electron store
        window.api.store.clearRendererBindings();
        window.api.store.onReceive(readConfigResponse, (args) => {
            console.log("got a call");
            if (args.key === "lastOpenedBook" && args.success) {
                // todo
                setLastOpenedBook(args.value, handleBookRendition());
            }
        });
    }, [lastOpenedBook]);

    useLayoutEffect(() => {
        window.api.store.send(readConfigRequest, "lastOpenedBook");
    });

    const handleBookRendition = () => {
        const bookFile = location?.state?.bookFile || lastOpenedBook;
        console.log(
            "URL BOOK:",
            location?.state?.bookFile?.name,
            "\nSTATE BOOK:",
            lastOpenedBook?.name
        );

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
