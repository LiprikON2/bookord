import React, { useEffect, useLayoutEffect } from "react";

import Button from "components/Button";
import {
    readConfigRequest,
    readConfigResponse,
    writeConfigRequest,
    useConfigInMainRequest,
} from "secure-electron-store";

const dragDrop = require("drag-drop");

const mapInGroups = (arr, iteratee, groupSize) => {
    const groups = _.groupBy(arr, (_v, i) => Math.floor(i / groupSize));

    return Object.values(groups).reduce(
        async (memo, group) => [
            ...(await memo),
            ...(await Promise.all(group.map(iteratee))),
        ],
        []
    );
};

const LibraryListUpload = ({ files, setFiles }) => {
    const handleUpload = () => {
        const promise = window.api.invoke("app:on-fs-dialog-open");
        promise.then(() => {
            updateFiles();
        });
    };

    const updateFiles = () => {
        const files = window.api.invoke("app:get-files");
        window.api.store.clearRendererBindings();
        window.api.store.send(readConfigRequest, "interactionStates");

        window.api.store.onReceive(readConfigResponse, async (args) => {
            if (args.key === "interactionStates" && args.success) {
                const interactionStates = args.value;

                files.then(async (files = []) => {
                    const updatedInteractionStateList = [];

                    // window.api.store.send(useConfigInMainRequest);

                    // window.api.store.onReceive(
                    //     useConfigInMainResponse,
                    //     (args) => {
                    //         if (args.success) {
                    //             console.log(
                    //                 "Successfully used store in electron main process"
                    //             );
                    //         }
                    //     }
                    // );

                    const filesWithMetadata = await mapInGroups(
                        files,
                        async (file) => {
                            const savedMetadata =
                                interactionStates?.[file.path]?.info;
                            // If books were already parsed, retrive saved results
                            if (savedMetadata) {
                                return { ...file, info: savedMetadata };
                            }
                            // Otherwise parse books for metadata & then save results
                            else {
                                const metadata = await window.api.invoke(
                                    "app:get-parsed-book-metadata",
                                    file.path
                                );
                                // TODO change object key to file.name instead?
                                const updatedInteractionState = {
                                    [file.path]: {
                                        file,
                                        state: {
                                            section: 0,
                                            sectionPage: 0,
                                        },
                                        ...interactionStates?.[file.path],
                                        info: metadata,
                                    },
                                };
                                updatedInteractionStateList.push(
                                    updatedInteractionState
                                );
                                return { ...file, info: metadata };
                            }
                        },
                        2
                    );

                    const mergedInteractionStates = Object.assign(
                        {},
                        interactionStates,
                        ...updatedInteractionStateList
                    );

                    window.api.store.send(
                        writeConfigRequest,
                        "interactionStates",
                        mergedInteractionStates
                    );

                    setFiles(filesWithMetadata);
                });
            }
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

        const unlisten = window.api.receive(
            "app:file-is-deleted",
            (filename) => {
                updateFiles();
            }
        );

        window.addEventListener("beforeunload", stopWatchingFiles);
        return () => {
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
