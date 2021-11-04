import React, { useEffect, useLayoutEffect } from "react";

const dragDrop = require("drag-drop");

const LibraryUpload = ({ files, setFiles }) => {
    const handleUpload = () => {
        const promise = window.api.invoke("app:on-fs-dialog-open");
        promise.then(() => {
            updateFiles();
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
                updateFiles();
            });
        });
    });
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
