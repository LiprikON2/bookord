import React, { useContext, useEffect, useLayoutEffect } from "react";
import { useWindowEvent } from "@mantine/hooks";
import { Stack } from "@mantine/core";

import Dropzone from "components/Dropzone";
import { AppContext } from "Core/Routes";

// @ts-ignore
import "./LibraryList.css";
import ListGroupingNone from "./ListGroupingNone";
import ListGroupingGroup from "./ListGroupingGroup";

const sortingSorters = {
    "Title": {
        Ascending: (a, b) => (a.info.title > b.info.title ? 1 : -1),
        Descending: function (a, b) {
            return this.Ascending(a, b) === 1 ? -1 : 1;
        },
    },
    "Recent": {
        Ascending: (a, b) => 1,
        Descending: function (a, b) {
            return this.Ascending(a, b) === 1 ? -1 : 1;
        },
    },
    "Date Added": {
        Ascending: (a, b) => {
            const { dateAdded: dateAddedStringA } = a;
            const { dateAdded: dateAddedStringB } = b;

            const diffA = Math.abs(
                new Date().getTime() - new Date(dateAddedStringA).getTime()
            );

            const diffB = Math.abs(
                new Date().getTime() - new Date(dateAddedStringB).getTime()
            );

            return diffA > diffB ? 1 : -1;
        },
        Descending: function (a, b) {
            return this.Ascending(a, b) === 1 ? -1 : 1;
        },
    },
    "Date Published": {
        Ascending: (a, b) => 1,
        Descending: function (a, b) {
            return this.Ascending(a, b) === 1 ? -1 : 1;
        },
    },
};

const LibraryList = ({ updateFiles, handleUpload, grouping, sorting, sortingOrder }) => {
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
                                <div className="limit-width">
                                    <ListGroupingNone
                                        files={files}
                                        sort={sortingSorters[sorting][sortingOrder].bind(
                                            sortingSorters[sorting]
                                        )}
                                        skeletontFileCount={skeletontFileCount}
                                    />
                                </div>
                            ) : (
                                <ListGroupingGroup
                                    files={files}
                                    skeletontFileCount={skeletontFileCount}
                                    grouping={grouping}
                                    sort={sortingSorters[sorting][sortingOrder].bind(
                                        sortingSorters[sorting]
                                    )}
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
