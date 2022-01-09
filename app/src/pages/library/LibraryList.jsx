import React from "react";

import Link from "components/Link";
import LibraryListCard from "./LibraryListCard";
import LibraryListUpload from "./LibraryListUpload";
import ROUTES from "Constants/routes";
import "./LibraryList.css";

import Spinner from "components/Spinner";

const LibraryList = ({ files, setFiles }) => {
    // todo Link component
    return (
        <>
            <section className="section library-list" id="uploader">
                <LibraryListUpload files={files} setFiles={setFiles} />

                {files.length > 0 ? (
                    <div className="card-list" role="list">
                        {files.map((file, index) => (
                            <Link
                                to={{
                                    pathname: ROUTES.READ,
                                    state: {
                                        book: file,
                                    },
                                }}
                                className="a"
                                role="listitem"
                                key={file.path}>
                                <LibraryListCard file={file}></LibraryListCard>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <Spinner></Spinner>
                )}
            </section>
        </>
    );
};

export default LibraryList;
