import React, { useState } from "react";
import { Link } from "react-router-dom";

import ROUTES from "Constants/routes";
import LibraryUpload from "./LibraryUpload";
import LibraryList from "./LibraryList";
import "./Library.css";

const Library = () => {
    const [files, setFiles] = useState([]);

    return (
        <>
            <main id="main">
                <section className="section">
                    <div className="container">
                        <h1>Library</h1>
                    </div>
                    <Link
                        to={ROUTES.SETTINGS}
                        className="button is-dark"
                        role="button">
                        Settings
                    </Link>
                    <Link
                        to={ROUTES.READ}
                        className="button is-dark"
                        role="button">
                        Read
                    </Link>
                </section>

                <LibraryUpload files={files} setFiles={setFiles} />
                <LibraryList files={files} setFiles={setFiles} />
            </main>
        </>
    );
};

export default Library;
