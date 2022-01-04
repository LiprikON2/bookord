import React, { useState } from "react";

import LibraryUpload from "./LibraryUpload";
import LibraryList from "./LibraryList";
import "./Library.css";

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
