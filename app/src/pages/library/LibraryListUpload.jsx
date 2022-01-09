import React, { useEffect, useLayoutEffect } from "react";

import Button from "components/Button";
import {
    readConfigRequest,
    readConfigResponse,
    writeConfigRequest,
} from "secure-electron-store";

const dragDrop = require("drag-drop");
const Promise = require("bluebird");

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
        console.log("UPDATE FILES CALLED");
        const files = window.api.invoke("app:get-files");
        window.api.store.clearRendererBindings();
        window.api.store.send(readConfigRequest, "interactionStates");

        window.api.store.onReceive(readConfigResponse, (args) => {
            if (args.key === "interactionStates" && args.success) {
                const interactionStates = args.value;

                files.then(async (files = []) => {
                    const updatedInteractionStateList = [];

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
                        1
                    );
                    // const filesWithMetadata = await Promise.all(
                    //     files.map(async (file) => {
                    //         const savedMetadata =
                    //             interactionStates?.[file.path]?.info;
                    //         // If books were already parsed, retrive saved results
                    //         if (savedMetadata) {
                    //             return { ...file, info: savedMetadata };
                    //         }
                    //         // Otherwise parse books for metadata & then save results
                    //         else {
                    //             const metadata = await window.api.invoke(
                    //                 "app:get-parsed-book-metadata",
                    //                 file.path
                    //             );

                    //             const updatedInteractionState = {
                    //                 [file.path]: {
                    //                     file,
                    //                     state: {
                    //                         section: 0,
                    //                         sectionPage: 0,
                    //                     },
                    //                     ...interactionStates?.[file.path],
                    //                     info: metadata,
                    //                 },
                    //             };
                    //             updatedInteractionStateList.push(
                    //                 updatedInteractionState
                    //             );

                    //             return { ...file, info: metadata };
                    //         }
                    //     })
                    // );
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

    useLayoutEffect(() => {
        // Initial file load
        console.log("initial");
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
                console.log("added");
                updateFiles();
            });
        });

        window.api.receive("app:file-is-deleted", (filename) => {
            console.log("deleted", filename);
            updateFiles();
        });
    }, []);
    return (
        <>
            <div>
                <Button onClick={handleUpload}>Add a book</Button>
            </div>
        </>
    );
};

export default LibraryListUpload;
