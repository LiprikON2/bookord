import React, { useEffect, useLayoutEffect, useState } from "react";
import debounce from "lodash.debounce";

import Button from "components/Button";
import {
    writeConfigRequest,
    useConfigInMainRequest,
    useConfigInMainResponse,
} from "secure-electron-store";

const dragDrop = require("drag-drop");

const LibraryListUpload = ({ setFiles, setLoading }) => {
    const [uploading, setUploading] = useState(false);

    const handleUpload = () => {
        // Prevets queueing up explorer windows
        if (!uploading) {
            setUploading(true);
            const promise = window.api.invoke("app:on-fs-dialog-open");
            promise.then(() => {
                updateFiles();
                setUploading(false);
            });
        }
    };

    const debouncedUpdate = debounce(() => {
        console.time("updateFiles");
        // Updates store in main
        window.api.store.send(useConfigInMainRequest);

        window.api.store.onReceive(useConfigInMainResponse, async (args) => {
            if (args.success) {
                window.api.store.clearRendererBindings();

                const [filesWithMetadata, mergedInteractionStates] =
                    await window.api.invoke("app:get-books");

                console.timeEnd("updateFiles");
                setFiles(filesWithMetadata);

                window.api.store.send(
                    writeConfigRequest,
                    "interactionStates",
                    mergedInteractionStates
                );
            }
            setLoading(false);
        });
    }, 100);

    const updateFiles = () => {
        debouncedUpdate();
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
