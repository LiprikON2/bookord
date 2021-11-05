import React, { useState, useLayoutEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import ePub from "epubjs";

import ROUTES from "Constants/routes";

const Read = () => {
    const location = useLocation();
    const { bookFile } = location.state || "hey";

    const [rendition, setRendition] = useState();

    const openFile = (file) => {
        const buffer = window.api.invoke("app:on-file-open", file);
        const epub = buffer.then((buffer) => ePub(buffer));

        return epub;
    };

    useLayoutEffect(() => {
        const book = openFile(bookFile);

        // Initialize book render
        book.then((book) => {
            const rendition = book.renderTo("book", {
                width: 600,
                height: 400,
            });
            rendition.display();
            setRendition(rendition);
        });
    }, []);

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
