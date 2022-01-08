import React, { useState } from "react";
import { Link } from "react-router-dom";

import ROUTES from "Constants/routes";
import LibraryList from "./LibraryList";
import "./Library.css";

const Library = ({ files, setFiles }) => {
    return (
        <>
            <section className="section">
                <div className="container">
                    <h1>Library</h1>
                </div>
                <div className="button-group">
                    <Link
                        to={ROUTES.SETTINGS}
                        draggable="false"
                        onAuxClick={(e) => e.preventDefault()}
                        className="button is-dark"
                        role="button">
                        Settings
                    </Link>
                    <Link
                        to={ROUTES.READ}
                        draggable="false"
                        onAuxClick={(e) => e.preventDefault()}
                        className="button is-dark"
                        role="button">
                        Read
                    </Link>
                </div>
            </section>

            <LibraryList files={files} setFiles={setFiles} />
        </>
    );
};

export default Library;
