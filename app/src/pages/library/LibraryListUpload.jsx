import React, { useEffect, useLayoutEffect } from "react";

import Button from "components/Button";
import {
    writeConfigRequest,
    useConfigInMainRequest,
    useConfigInMainResponse,
} from "secure-electron-store";

const dragDrop = require("drag-drop");

const LibraryListUpload = ({ setFiles, setLoading }) => {
    const handleUpload = () => {
        const promise = window.api.invoke("app:on-fs-dialog-open");
        promise.then(() => {
            updateFiles();
        });
    };

    const updateFiles = () => {
        // Updates store in main
        window.api.store.send(useConfigInMainRequest);

        window.api.store.onReceive(useConfigInMainResponse, async (args) => {
            if (args.success) {
                window.api.store.clearRendererBindings();

                const [filesWithMetadata, mergedInteractionStates] =
                    await window.api.invoke("app:get-books");

                setFiles(filesWithMetadata);

                window.api.store.send(
                    writeConfigRequest,
                    "interactionStates",
                    mergedInteractionStates
                );
            }
            setLoading(false);
        });
    };

    const stopWatchingFiles = () => {
        window.api.send("app:stop-watching-files");
    };

    useLayoutEffect(() => {
        // Initial file load
        updateFiles();
    }, []);

    useEffect(() => {
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

        const unlisten = window.api.receive("app:file-is-deleted", (filePath) => {
            // addToRemoveQueue(filePath);
            updateFiles();
        });

        window.addEventListener("beforeunload", stopWatchingFiles);
        return () => {
            window.api.store.clearRendererBindings();

            window.removeEventListener("beforeunload", stopWatchingFiles);
            unlisten();
        };
    }, []);

    return (
        <>
            <div>
                <Button onClick={handleUpload}>Add a book</Button>
                <Button onClick={updateFiles}>Refresh</Button>
            </div>
        </>
    );
};

export default LibraryListUpload;
