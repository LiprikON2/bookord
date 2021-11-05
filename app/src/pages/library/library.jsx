import React, { useState, useLayoutEffect, useEffect } from "react";
import { Link } from "react-router-dom";

// import icon from "../../../resources/icon.svg"; // todo
import ROUTES from "Constants/routes";
import LibraryUpload from "./LibraryUpload";
import LibraryList from "./LibraryList";

const dragDrop = require("drag-drop");

const Library = () => {
    const [files, setFiles] = useState([]);

    return (
        <>
            <section className="section">
                <div className="container">
                    <h1>Library</h1>
                </div>
            </section>

            <LibraryUpload files={files} setFiles={setFiles} />
            <LibraryList files={files} setFiles={setFiles} />
        </>
    );
};

export default Library;
