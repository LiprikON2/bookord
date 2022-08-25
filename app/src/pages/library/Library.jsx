import React, { useContext, useState } from "react";
import debounce from "lodash/debounce";
import {
    writeConfigRequest,
    useConfigInMainRequest,
    useConfigInMainResponse,
} from "secure-electron-store";

import LibraryList from "./LibraryList";
import "./Library.css";
import TitleWithIcon from "components/TitleWithIcon";
import GroupingControl from "./GroupingControl";
import { AppContext } from "Core/Routes";

const Library = () => {
    const {
        files,
        setFiles,
        skeletontFileCount,
        setSkeletontFileCount,
        isInitLoad,
        setIsInitLoad,
    } = useContext(AppContext);
    const [grouping, setGrouping] = useState("Date Added"); //todo

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

    return (
        <>
            <section className="section library-section">
                <TitleWithIcon
                    order={1}
                    description="Manage your books."
                    style={{ marginBottom: "1.5rem" }}>
                    Library
                </TitleWithIcon>
                <GroupingControl
                    handleUpload={handleUpload}
                    grouping={grouping}
                    setGrouping={setGrouping}
                />
            </section>
            <LibraryList
                updateFiles={updateFiles}
                handleUpload={handleUpload}
                grouping={grouping}
            />
        </>
    );
};

export default Library;
