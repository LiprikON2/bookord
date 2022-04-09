import React from "react";

import Button from "components/Button";
import Dropdown from "components/Dropdown";

import "./LibraryListCard.css";

const LibraryListCard = ({ file }) => {
    const handleDelete = (e, file) => {
        e.preventDefault();
        window.api.send("app:on-file-delete", file);
        // Chokidar (from `io.js`) then triggers file update
    };
    return (
        <>
            <div
                className="card"
                style={file.isSkeleton ? { pointerEvents: "none" } : {}}>
                {file.info.cover ? (
                    <span className="card-cover">
                        <img src={file.info.cover} alt="book cover" />
                    </span>
                ) : (
                    <span
                        className={`card-cover no-cover ${
                            file.isSkeleton ? "skeleton" : ""
                        }`}>
                        <div className="clip-path-wrapper">
                            <div className="clip-path">
                                <h3>
                                    {!file.isSkeleton ? (
                                        file.info.title
                                    ) : (
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "0.25rem",
                                            }}>
                                            <div className="skeleton-text"></div>
                                            <div className="skeleton-text"></div>
                                            <div className="skeleton-text"></div>
                                        </div>
                                    )}
                                </h3>
                            </div>
                        </div>
                    </span>
                )}
                <div
                    className={`card-content ${file.isSkeleton ? "skeleton" : ""}`}
                    onClick={(e) => {
                        e.preventDefault();
                    }}>
                    <h3 className="card-content-title" title={file.info.title}>
                        <span className={file.isSkeleton ? "skeleton-text" : ""}>
                            {file.info.title}
                        </span>
                    </h3>
                    {!file.isSkeleton ? (
                        <Dropdown>
                            <Button>Open</Button>
                            <Button>Edit</Button>
                            <Button divider="true" onClick={(e) => handleDelete(e, file)}>
                                Delete
                            </Button>
                        </Dropdown>
                    ) : (
                        <div className="button dropdown skeleton-dropdown">
                            <div className="skeleton-text"></div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
export default LibraryListCard;
