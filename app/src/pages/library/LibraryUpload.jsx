import React, { useEffect, useLayoutEffect } from "react";

const dragDrop = require("drag-drop");

const LibraryUpload = ({ files, setFiles }) => {
    const handleUpload = () => {
        const promise = window.api.invoke("app:on-fs-dialog-open");
        promise.then(() => {
            updateFiles();
        });
    };

    const handleDelete = () => {
        // handle file delete event
        console.log("Huh?");
        window.api.on("app:delete-file", (event, filename) => {
            console.log("DELETE " + filename);
            // document.getElementById(filename).remove();
        });
    };

    const updateFiles = () => {
        const promise = window.api.invoke("app:get-files");
        promise.then((files = []) => {
            setFiles(files);
        });
    };

    useLayoutEffect(() => {
        updateFiles();
    }, []);

    useEffect(() => {
        // Drag and drop event litener
        dragDrop("#uploader", (files) => {
            const mappedFiles = files.map((file) => {
                return {
                    name: file.name,
                    path: file.path,
                };
            });
            // send file(s) add event to the `main` process
            window.api.invoke("app:on-file-add", mappedFiles).then(() => {
                updateFiles();
            });
        });
    }, []);
    return (
        <>
            <section className="section">
                <div id="uploader" className="container">
                    <button
                        className="bookUpload"
                        type="button"
                        onClick={handleUpload}>
                        Add a book
                    </button>
                </div>
            </section>
        </>
    );
};

export default LibraryUpload;
