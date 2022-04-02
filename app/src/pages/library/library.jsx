import React from "react";

import Link from "components/Link";
import ROUTES from "Constants/routes";
import LibraryList from "./LibraryList";
import "./Library.css";

const Library = ({
    files,
    setFiles,
    skeletontFileCount,
    setSkeletontFileCount,
    loading,
    setLoading,
}) => {
    return (
        <>
            <section className="section">
                <div className="container">
                    <h1>Library</h1>
                </div>
                <div className="button-group">
                    <Link to={ROUTES.SETTINGS}>Settings</Link>
                    <Link to={ROUTES.READ}>Read</Link>
                </div>
            </section>

            <LibraryList
                files={files}
                setFiles={setFiles}
                skeletontFileCount={skeletontFileCount}
                setSkeletontFileCount={setSkeletontFileCount}
                loading={loading}
                setLoading={setLoading}
            />
        </>
    );
};

export default Library;
