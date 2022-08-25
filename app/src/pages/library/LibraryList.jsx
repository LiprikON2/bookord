import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { useWindowEvent } from "@mantine/hooks";

import { Stack } from "@mantine/core";

import Dropzone from "components/Dropzone";
import { AppContext } from "Core/Routes";

// @ts-ignore
import "./LibraryList.css";
import ListGroupingNone from "./ListGroupingNone";
import ListGroupingGroup from "./ListGroupingGroup";

const LibraryList = ({ updateFiles, handleUpload, grouping }) => {
    const { files, skeletontFileCount, setSkeletontFileCount, isInitLoad } =
        useContext(AppContext);

    const handleDrop = (files, xx) => {
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

    const hasBooks = !!files.length || !!skeletontFileCount || isInitLoad;

    return (
        <>
            {hasBooks && <Dropzone fullscreen={true} onDrop={handleDrop}></Dropzone>}
            <div className="library-container" id="uploader">
                <Stack
                    spacing="xs"
                    align="stretch"
                    className={
                        "card-group-list" + (grouping !== "None" ? " grouped" : "")
                    }>
                    {hasBooks ? (
                        <>
                            {grouping === "None" ? (
                                <ListGroupingNone
                                    files={files}
                                    skeletontFileCount={skeletontFileCount}
                                />
                            ) : (
                                <ListGroupingGroup
                                    groupBy={grouping}
                                    files={files}
                                    skeletontFileCount={skeletontFileCount}
                                />
                            )}
                        </>
                    ) : (
                        <Dropzone onClick={handleUpload} onDrop={handleDrop}></Dropzone>
                    )}
                </Stack>
            </div>
        </>
    );
};

// TODO prevent click on skeleton
export default LibraryList;
