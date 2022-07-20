import React from "react";

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
                <div className="container">
                    <h1>Library</h1>
                </div>
            </section>

            <LibraryList
                files={files}
                setFiles={setFiles}
                skeletontFileCount={skeletontFileCount}
                setSkeletontFileCount={setSkeletontFileCount}
                isInitLoad={isInitLoad}
                setIsInitLoad={setIsInitLoad}
            />
        </>
    );
};

export default Library;
