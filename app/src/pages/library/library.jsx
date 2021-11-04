import React, { useState } from "react";
import { Link } from "react-router-dom";

// import icon from "../../../resources/icon.svg";
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
                    {/* <img width="100px" alt="icon" src={icon} /> */}
                    <div>
                        <Link to={`${ROUTES.READ}/1`}>Book 1</Link>
                    </div>
                    <div>
                        <Link to={ROUTES.MOTD}>Using the Electron store.</Link>{" "}
                        <br />
                        <Link to={ROUTES.LOCALIZATION}>
                            Changing locales.
                        </Link>{" "}
                        <br />
                        <Link to={ROUTES.UNDOREDO}>
                            Undo/redoing actions.
                        </Link>{" "}
                        <br />
                        <Link to={ROUTES.CONTEXTMENU}>
                            Custom context menu.
                        </Link>{" "}
                        <br />
                    </div>
                </div>
            </section>

            <LibraryUpload files={files} setFiles={setFiles} />
            <LibraryList files={files} setFiles={setFiles} />
        </>
    );
};

export default Library;
