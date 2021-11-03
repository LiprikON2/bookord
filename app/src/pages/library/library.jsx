import React, { useEffect } from "react";
import { Link } from "react-router-dom";

// import icon from "../../../resources/icon.svg";
import ROUTES from "Constants/routes";

const dragDrop = require("drag-drop");

const Library = () => {
    const handleUpload = () => {
        // window.api.receive("fromMain", (data) => {
        //     console.log(`Received ${data} from main process`);
        // });

        // // Send a message to the main process
        // window.api.send("toMain", "some data");

        window.api.invoke("app:on-fs-dialog-open").then(() => {
            window.api.invoke("app:get-files").then((files = []) => {
                displayFiles(files);
            });
        });
    };

    useEffect(() => {
        // get list of files from the `main` process

        console.log("invoking... (library.jsx)");
        window.api.invoke("app:get-files");
        // .then(
        //     (files = []) => {
        //         console.log("invoked!... (library.jsx)");
        //         // dom.displayFiles(files);

        //         console.log(files);
        //     },
        //     (reason) => {
        //         console.log(reason);
        //     }
        // );

        // handle file delete event
        window.api.on("app:delete-file", (event, filename) => {
            console.log("DELETE " + filename);
            // document.getElementById(filename).remove();
        });

        dragDrop("#uploader", (files) => {
            const _files = files.map((file) => {
                return {
                    name: file.name,
                    path: file.path,
                };
            });

            // send file(s) add event to the `main` process
            window.api.invoke("app:on-file-add", _files).then(() => {
                window.api.invoke("app:get-files").then((files = []) => {
                    // dom.displayFiles(files);

                    console.log(files);
                });
            });
        });
    });
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
            <section className="section">
                <div id="uploader" className="container">
                    <button
                        className="bookUpload app__uploader__button-area__button"
                        type="button"
                        onClick={handleUpload}>
                        Add a book
                    </button>
                </div>
            </section>
        </>
    );
};

export default Library;
