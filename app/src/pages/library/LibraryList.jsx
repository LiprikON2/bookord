import React from "react";

import Link from "components/Link";
import LibraryListCard from "./LibraryListCard";
import LibraryListUpload from "./LibraryListUpload";
import ROUTES from "Constants/routes";
import "./LibraryList.css";

const LibraryList = ({ files, setFiles }) => {
    // todo Link component
    return (
        <>
            <section className="section" id="uploader">
                <ul className="card-list">
                    {files.map((file, index) => (
                        <Link
                            to={{
                                pathname: ROUTES.READ,
                                state: {
                                    book: file,
                                },
                            }}
                            className="a"
                            key={file.path}>
                            <LibraryListCard file={file}></LibraryListCard>
                        </Link>
                    ))}
                </ul>
                <LibraryListUpload files={files} setFiles={setFiles} />
            </section>
        </>
    );
};

export default LibraryList;
