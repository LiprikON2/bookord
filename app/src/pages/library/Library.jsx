import React, { useContext, useState } from "react";
import debounce from "lodash/debounce";
import {
    writeConfigRequest,
    useConfigInMainRequest,
    useConfigInMainResponse,
} from "secure-electron-store";
import {
    ArrowsSort,
    Category,
    FilePlus,
    SortAscending2,
    SortDescending2,
} from "tabler-icons-react";

import LibraryList from "./LibraryList";
import TitleWithIcon from "components/TitleWithIcon";
import { AppContext } from "Core/Routes";
import Button from "components/Button";
import LibraryControl from "./LibraryControl";
import { useToggle } from "@mantine/hooks";
import { groupingData } from "Utils/bookGroup";
import { sortingData } from "Utils/bookSort";

const Library = () => {
    const { setFiles, skeletontFileCount, setSkeletontFileCount, setIsInitLoad } =
        useContext(AppContext);
    const [grouping, setGrouping] = useState("None");
    const [sorting, setSorting] = useState("Title");
    const [sortingOrder, toggleSortingOrder] = useToggle(["Ascending", "Descending"]);

    const [uploading, setUploading] = useState(false);

    const handleUpload = () => {
        // Prevets queueing up explorer windows
        if (!uploading) {
            setUploading(true);

            // TODO fix broken sort on clicking 'Add' button
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

    return (
        <>
            <section className="section library-section">
                <TitleWithIcon
                    order={1}
                    description="Manage your books."
                    style={{ marginBottom: "1.5rem" }}>
                    Library
                </TitleWithIcon>
                <LibraryControl
                    value={grouping}
                    onChange={setGrouping}
                    label="Group by"
                    labelIcon={Category}
                    data={groupingData}
                />
                <LibraryControl
                    value={sorting}
                    onChange={setSorting}
                    right={
                        <Button
                            leftIcon={<FilePlus />}
                            onClick={handleUpload}
                            style={{ height: "2.625rem" }}>
                            Add
                        </Button>
                    }
                    subRight={
                        <Button
                            onClick={() => toggleSortingOrder()}
                            title={`Sorted in ${sortingOrder.toLowerCase()} order`}
                            isIconOnly={true}
                            isGhost={true}>
                            {sortingOrder === "Ascending" ? (
                                <SortAscending2 />
                            ) : (
                                <SortDescending2 />
                            )}
                        </Button>
                    }
                    label="Sort by"
                    labelIcon={ArrowsSort}
                    data={sortingData}
                />
            </section>
            <LibraryList
                updateFiles={updateFiles}
                handleUpload={handleUpload}
                grouping={grouping}
                sorting={sorting}
                sortingOrder={sortingOrder}
                uploading={uploading}
            />
        </>
    );
};

export default Library;
