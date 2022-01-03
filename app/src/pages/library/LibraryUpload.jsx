import React, { useEffect, useLayoutEffect } from "react";

import { readConfigRequest, readConfigResponse } from "secure-electron-store";

const dragDrop = require("drag-drop");

const LibraryUpload = ({ files, setFiles }) => {
    const initStorage = window.api.store.initial();

    const handleUpload = () => {
        const promise = window.api.invoke("app:on-fs-dialog-open");
        promise.then(() => {
            updateFiles();
        });
    };

    const updateFiles = () => {
        const promise = window.api.invoke("app:get-files");
        promise.then(async (files = []) => {
            const interactionStates = initStorage.interactionStates || {};
            const filesWithMetadata = await Promise.all(
                files.map(async (file) => {
                    if (interactionStates[file.path]?.info) {
                        console.log(
                            "interactionStates.[file.path]",
                            interactionStates[file.path]
                        );
                        return file;
                    } else {
                        console.log("no");
                        const metadata = await window.api.invoke(
                            "app:on-book-metadata-import",
                            file.path
                        );
                        return { ...file, info: metadata };
                    }
                })
            );
            console.log("filesWithMetadata", filesWithMetadata);
            setFiles(filesWithMetadata);
        });
    };

    useLayoutEffect(() => {
        // Initial file load
        updateFiles();
    }, []);

    useEffect(() => {
        // window.api.store.send(readConfigRequest, "interactionStates");

        // window.api.store.onReceive(readConfigResponse, (args) => {
        //     if (args.key === "interactionStates" && args.success) {

        //     }
        // });

        // Initial file drag and drop event litener
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

        // Listen for chokidar file delete events
        window.api.on("app:delete-file", (event, filename) => {
            updateFiles();
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
