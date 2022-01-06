import React from "react";
import { Link } from "react-router-dom";

import LibraryListCard from "./LibraryListCard";
import ROUTES from "Constants/routes";
import "./LibraryList.css";

const LibraryList = ({ files, setFiles }) => {
    // todo Link component
    return (
        <>
            <section className="section">
                <ul className="card-list">
                    {files.map((file, index) => (
                        <Link
                            to={{
                                pathname: ROUTES.READ,
                                state: {
                                    book: file,
                                },
                            }}
                            draggable="false"
                            onAuxClick={(e) => e.preventDefault()}
                            key={file.path}>
                            <LibraryListCard file={file}></LibraryListCard>
                        </Link>
                    ))}
                </ul>
            </section>
        </>
    );
};

export default LibraryList;
