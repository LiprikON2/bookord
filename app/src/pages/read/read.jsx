import React, { useEffect, useLayoutEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import ePub from "epubjs";

import ROUTES from "Constants/routes";

const Read = () => {
    const location = useLocation();
    const { bookFile } = location.state || "hey";

    const openFile = (file) => {
        const buffer = window.api.invoke("app:on-file-open", file);
        const epub = buffer.then((buffer) => ePub(buffer));

        return epub;
    };

    useLayoutEffect(() => {
        const book = openFile(bookFile);

        book.then((book) => {
            var rendition = book.renderTo("book", { width: 600, height: 400 });
            var displayed = rendition.display();
        });
    }, []);

    return (
        <>
            <section className="section">
                <main id="book"></main>

                <h1>Lorem ipsum dolor sit amet.</h1>
                <p id="area">
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                    Corporis omnis rem fugiat totam nesciunt accusamus amet
                    minus? Sed, sapiente placeat soluta odit optio non at ipsam
                    repellendus quaerat nostrum autem aperiam voluptatem vitae
                    repellat labore impedit ea! Quod eum, unde aperiam quia,
                    aliquam atque nam exercitationem enim sapiente velit
                    ratione.
                </p>
                <Link to={ROUTES.LIBRARY}>Home</Link>
            </section>
        </>
    );
};

export default Read;
