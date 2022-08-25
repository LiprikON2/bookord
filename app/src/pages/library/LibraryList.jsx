import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { useWindowEvent } from "@mantine/hooks";
import debounce from "lodash/debounce";
import {
    writeConfigRequest,
    useConfigInMainRequest,
    useConfigInMainResponse,
} from "secure-electron-store";
import { Box, Center, Group, Stack, Text } from "@mantine/core";
import {
    AlphabetLatin,
    Calendar,
    CalendarStats,
    Category,
    Clock,
    FilePlus,
    MasksTheater,
    SortAscending2,
    User,
    X,
} from "tabler-icons-react";

import Button from "components/Button";
import Link from "components/Link";
import Dropzone from "components/Dropzone";
import LibraryListCard from "./LibraryListCard";
import { AppContext } from "Core/Routes";
import SegmentedControl from "components/SegmentedControl";

// @ts-ignore
import ROUTES from "Constants/routes";
import "./LibraryList.css";

const skeletonFile = {
    isSkeleton: true,
    info: { title: "" },
};

const LibraryList = () => {
    const {
        files,
        setFiles,
        skeletontFileCount,
        setSkeletontFileCount,
        isInitLoad,
        setIsInitLoad,
    } = useContext(AppContext);
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

                const [filesWithMetadata, mergedAllBooks] = await window.api.invoke(
                    "app:get-books"
                );

                console.timeEnd("updateFiles");
                setFiles(filesWithMetadata);

                // TODO delete relevant recent book as well
                window.api.store.send(writeConfigRequest, "allBooks", mergedAllBooks);
            }
            setIsInitLoad(false);
            setSkeletontFileCount(0);
        });
    }, 100);

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

    const [grouping, setGrouping] = useState("None");

    return (
        <>
            <div className="library-container" id="uploader">
                <Group
                    className="card-control"
                    position="apart"
                    style={{ alignItems: "flex-end" }}>
                    <Stack style={{ gap: "0.5rem" }}>
                        <Group
                            style={{ gap: "0.25rem", color: "var(--clr-primary-150)" }}>
                            <Category size={24} />

                            <Text size="md" weight={500}>
                                Group by
                            </Text>
                        </Group>

                        <Group spacing="xs">
                            <SegmentedControl
                                value={grouping}
                                onChange={setGrouping}
                                data={[
                                    {
                                        value: "None",
                                        label: (
                                            <Center>
                                                <X size={16} />
                                                <Box ml={10}>None</Box>
                                            </Center>
                                        ),
                                    },
                                    {
                                        value: "Recent",
                                        label: (
                                            <Center>
                                                <Clock size={16} />
                                                <Box ml={10}>Recent</Box>
                                            </Center>
                                        ),
                                    },
                                    {
                                        value: "Date Added",
                                        label: (
                                            <Center>
                                                <CalendarStats size={16} />
                                                <Box ml={10}>Date Added</Box>
                                            </Center>
                                        ),
                                    },
                                    // {
                                    //     value: "Date Published",
                                    //     label: (
                                    //         <Center>
                                    //             <Calendar size={16} />
                                    //             <Box ml={10}>Date Published</Box>
                                    //         </Center>
                                    //     ),
                                    // },
                                    {
                                        value: "Author",
                                        label: (
                                            <Center>
                                                <User size={16} />
                                                <Box ml={10}>Author</Box>
                                            </Center>
                                        ),
                                    },
                                    // {
                                    //     value: "Alphabet",
                                    //     label: (
                                    //         <Center>
                                    //             <AlphabetLatin size={16} />
                                    //             <Box ml={10}>Alphabet</Box>
                                    //         </Center>
                                    //     ),
                                    // },
                                    {
                                        value: "Genre",
                                        label: (
                                            <Center>
                                                <MasksTheater size={16} />
                                                <Box ml={10}>Genre</Box>
                                            </Center>
                                        ),
                                    },
                                ]}
                            />
                            {/* TODO */}
                            <Button isIconOnly={true} isGhost={true}>
                                <SortAscending2 />
                            </Button>
                        </Group>
                    </Stack>
                    <Button
                        leftIcon={<FilePlus />}
                        onClick={handleUpload}
                        style={{ height: "2.625rem" }}>
                        Add
                    </Button>
                </Group>

                {hasBooks && <Dropzone fullscreen={true} onDrop={handleDrop}></Dropzone>}
                <Stack align="stretch" className="card-group-list">
                    {hasBooks ? (
                        <>
                            {grouping === "None" ? (
                                <div className="card-list" role="list">
                                    {files.map((file) => {
                                        const toLocation = {
                                            pathname: ROUTES.READ,
                                            state: {
                                                bookFile: file,
                                            },
                                        };
                                        return (
                                            <Link
                                                to={toLocation}
                                                className=""
                                                role="listitem"
                                                key={file.name}>
                                                <LibraryListCard
                                                    file={file}
                                                    to={toLocation}
                                                />
                                            </Link>
                                        );
                                    })}
                                    {[...Array(skeletontFileCount)].map((e, index) => (
                                        <div role="listitem" key={"skeleton" + index}>
                                            <LibraryListCard file={skeletonFile} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    {[...Array(skeletontFileCount)].map((e, index) => (
                                        <React.Fragment key={"loading-group"}>
                                            <Text size="lg">Loading</Text>
                                            <div className="card-list" role="list">
                                                <div
                                                    role="listitem"
                                                    key={"skeleton" + index}>
                                                    <LibraryListCard
                                                        file={skeletonFile}
                                                    />
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    ))}
                                    {files.length &&
                                        Object.entries(
                                            files.reduce((groups, file) => {
                                                const { author } = file.info;
                                                if (!groups[author]) groups[author] = [];
                                                groups[author].push(file);
                                                return groups;
                                            }, [])
                                        ).map(([group, files]) => {
                                            return (
                                                <React.Fragment key={group}>
                                                    <Text size="lg">{group}</Text>
                                                    <div
                                                        className="card-list"
                                                        role="list"
                                                        key={group}>
                                                        {files.map((file) => {
                                                            const toLocation = {
                                                                pathname: ROUTES.READ,
                                                                state: {
                                                                    bookFile: file,
                                                                },
                                                            };
                                                            return (
                                                                <Link
                                                                    to={toLocation}
                                                                    className=""
                                                                    role="listitem"
                                                                    key={file.name}>
                                                                    <LibraryListCard
                                                                        file={file}
                                                                        to={toLocation}
                                                                    />
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                </React.Fragment>
                                            );
                                        })}
                                </>
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
