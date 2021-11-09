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

const formatStringToCamelCase = (str) => {
    const splitted = str.split("-");
    if (splitted.length === 1) return splitted[0];
    return (
        splitted[0] +
        splitted
            .slice(1)
            .map((word) => word[0].toUpperCase() + word.slice(1))
            .join("")
    );
};

const getStyleObjectFromString = (str) => {
    const style = {};
    str.split(";").forEach((el) => {
        const [property, value] = el.split(":");
        if (!property) return;

        const formattedProperty = formatStringToCamelCase(property.trim());
        style[formattedProperty] = value.trim();
    });

    return style;
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
        const [a, styles] = await window.api.invoke(
            "app:on-book-import",
            bookFile
        );
        // console.log(a[6][0]);
        // console.log(a[6][1]);
        console.log(a[6][2]);

        // EXAMPLE ++++++++++
        // const element = React.createElement(
        //     "h1",
        //     { className: "greeting" },
        //     "Hello im child"
        // );
        // const parent = React.createElement("h1", { className: "greeting" }, [
        //     "im text",
        //     element,
        // ]);
        // console.log("Example", parent);
        // EXAMPLE ++++++++++

        ReactDOM.render(
            a[6].map((a) => {
                const b = recConvertToReactElement(a);
                // console.log("b", b);
                return b;
            }),
            document.getElementById("new")
        );
        // TODO export it as a blob
        // e.g. blob:http://localhost:40992/a5cf1d1b-5f01-44e2-9ea0-0c07766445ec
        document.querySelector(".book-container > style").innerText =
            styles[0]["styles.css"]._data;
        return a[0];
    };

    const recConvertToReactElement = (htmlObject) => {
        /*
         * Recursively converts every html object gotten
         * from parsing epub to a React element
         */
        if (htmlObject.tag) {
            if (htmlObject.attrs) {
                const { style, ...otherAttrs } = htmlObject.attrs;
                const styleObj = style
                    ? getStyleObjectFromString(style)
                    : undefined;
                return React.createElement(
                    htmlObject.tag,
                    {
                        style: styleObj,
                        ...otherAttrs,
                    },
                    htmlObject.children?.map((child) =>
                        recConvertToReactElement(child)
                    )
                );
            } else {
                return React.createElement(
                    htmlObject.tag,
                    {},
                    htmlObject.children?.map((child) =>
                        recConvertToReactElement(child)
                    )
                );
            }
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
                <div className="book-container">
                    <style scoped></style>
                    <div id="new" style={{ maxWidth: "500px" }}></div>
                </div>
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
