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
import { useLocalStorage, useToggle } from "@mantine/hooks";
import { groupingData } from "Utils/bookGroup";
import { getSort, sortingData } from "Utils/bookSort";
import useSort from "Hooks/useSort";

const SortButton = ({ onClick, value }) => {
    return (
        <Button
            onClick={onClick}
            title={`Sorted in ${value.toLowerCase()} order`}
            isIconOnly={true}
            isGhost={true}>
            {value === "Ascending" ? <SortAscending2 /> : <SortDescending2 />}
        </Button>
    );
};

const Library = () => {
    const { files, setFiles, skeletontFileCount, setSkeletontFileCount, setIsInitLoad } =
        useContext(AppContext);
    const [grouping, setGrouping] = useLocalStorage({
        key: "grouping",
        defaultValue: "None",
    });
    const [sorting, setSorting] = useLocalStorage({
        key: "sorting",
        defaultValue: "Title",
    });
    const [sortingOrder, toggleSortingOrder] = useToggle(["Ascending", "Descending"]);
    const [groupingOrder, toggleGroupingOrder] = useToggle(["Ascending", "Descending"]);

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

    // TODO subsequent calls while it runs will not refresh last added book
    const updateFiles = debounce(
        () => {
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

                    const sortedFiles = filesWithMetadata.sort(
                        getSort(sorting, sortingOrder)
                    );
                    setFiles.setState(sortedFiles);

                    // TODO delete relevant recent book as well
                    window.api.store.send(writeConfigRequest, "allBooks", mergedAllBooks);
                }
                setIsInitLoad(false);
                setSkeletontFileCount(0);
            });
        },
        100,
        { trailing: true }
    );

    useSort(files, setFiles.setState, getSort(sorting, sortingOrder), [
        sorting,
        sortingOrder,
    ]);

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
                    subRight={
                        <SortButton
                            onClick={() => toggleGroupingOrder()}
                            value={groupingOrder}
                        />
                    }
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
                        <SortButton
                            onClick={() => toggleSortingOrder()}
                            value={sortingOrder}
                        />
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
                groupingOrder={groupingOrder}
            />
        </>
    );
};

export default Library;
