import React, { useEffect, useLayoutEffect, useState } from "react";
import { useWindowEvent } from "@mantine/hooks";
import debounce from "lodash.debounce";
import {
    writeConfigRequest,
    useConfigInMainRequest,
    useConfigInMainResponse,
} from "secure-electron-store";

import Button from "components/Button";
import Link from "components/Link";
import Dropzone from "components/Dropzone";
import LibraryListCard from "./LibraryListCard";

import ROUTES from "Constants/routes";
import "./LibraryList.css";

const skeletonFile = {
    isSkeleton: true,
    info: { title: "" },
};

const LibraryList = ({
    files,
    setFiles,
    skeletontFileCount,
    setSkeletontFileCount,
    isInitLoad,
    setIsInitLoad,
}) => {
    const [uploading, setUploading] = useState(false);

    const handleUpload = () => {
        // Prevets queueing up explorer windows
        if (!uploading) {
            setUploading(true);
            const promise = window.api.invoke("app:on-fs-dialog-open");
            promise.then((fileCount) => {
                setSkeletontFileCount(skeletontFileCount + fileCount);
                updateFiles();
                setUploading(false);
            });
        }
    };

    const updateFiles = debounce(() => {
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
            setIsInitLoad(false);
            setSkeletontFileCount(0);
        });
    }, 100);

    const handleDrop = (files) => {
        const mappedFiles = files.map((file) => {
            return {
                name: file.name,
                path: file.path,
            };
        });
        // send file(s) add event to the `main` process
        const promise = window.api.invoke("app:on-file-add", mappedFiles);
        promise.then((fileCount) => {
            setSkeletontFileCount(fileCount);
            updateFiles();
        });
    };

    useLayoutEffect(() => {
        // Initial file load
        updateFiles();
        const unlisten = window.api.receive("app:receive-skeleton-count", (count) => {
            setSkeletontFileCount(count);
        });
        return () => {
            unlisten();
        };
    }, []);

    useEffect(() => {
        const unlisten = window.api.receive("app:file-is-deleted", () => {
            updateFiles();
        });

        return () => {
            window.api.store.clearRendererBindings();
            unlisten();
        };
    }, []);

    // Exit chokidar watcher on reload
    const stopWatchingFiles = () => {
        window.api.send("app:stop-watching-files");
    };
    useWindowEvent("beforeunload", stopWatchingFiles);

    const haveBooks = files.length || skeletontFileCount || isInitLoad;

    return (
        <>
            <section className="section library-list" id="uploader">
                <div>
                    <Button onClick={handleUpload}>Add a book</Button>
                </div>
                {haveBooks && <Dropzone fullscreen={true} onDrop={handleDrop}></Dropzone>}

                <div className="card-list" role="list">
                    {haveBooks ? (
                        <>
                            {files.map((file, index) => (
                                <Link
                                    to={{
                                        pathname: ROUTES.READ,
                                        state: {
                                            book: file,
                                        },
                                    }}
                                    className=""
                                    role="listitem"
                                    key={file.path}>
                                    <LibraryListCard file={file}></LibraryListCard>
                                </Link>
                            ))}
                            {[...Array(skeletontFileCount)].map((e, index) => (
                                <div role="listitem" key={"skeleton" + index}>
                                    <LibraryListCard
                                        file={skeletonFile}></LibraryListCard>
                                </div>
                            ))}
                        </>
                    ) : (
                        // TODO this dropzone has different explorer uploader onClick
                        <Dropzone onDrop={handleDrop}></Dropzone>
                    )}
                </div>
            </section>
        </>
    );
};

// <div className="no-cards">
//     <img src={dropzoneImg} alt="" />
//     <span>Add some books =)</span>
// </div>
export default LibraryList;
