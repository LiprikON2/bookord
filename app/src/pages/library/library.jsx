import React from "react";
import { Title } from "@mantine/core";

import LibraryList from "./LibraryList";
import "./Library.css";

const Library = ({
    files,
    setFiles,
    skeletontFileCount,
    setSkeletontFileCount,
    isInitLoad,
    setIsInitLoad,
}) => {
    return (
        <>
            <section className="section">
                <Title order={1}>Library</Title>

                <LibraryList
                    files={files}
                    setFiles={setFiles}
                    skeletontFileCount={skeletontFileCount}
                    setSkeletontFileCount={setSkeletontFileCount}
                    isInitLoad={isInitLoad}
                    setIsInitLoad={setIsInitLoad}
                />
            </section>
        </>
    );
};

export default Library;
