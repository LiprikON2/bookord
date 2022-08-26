import React, { useState } from "react";
import { Edit, ArrowUpRightCircle, Trash } from "tabler-icons-react";

import Button from "components/Button";
import Dropdown from "components/Dropdown";
import "./LibraryListCard.css";

const LibraryListCard = ({ file, style = undefined, to = undefined }) => {
    const handleDelete = (e, file) => {
        e.preventDefault();
        window.api.send("app:on-file-delete", file);
        // Chokidar (from `io.js`) then triggers file update
    };

    const [todo, setTodo] = useState("Edit");
    return (
        <>
            <div
                className="card"
                style={file.isSkeleton ? { pointerEvents: "none", ...style } : style}>
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
                            {/* {file.info.title} */}
                            {typeof file.info.date === "object" && "_" in file.info.date
                                ? file.info.date._
                                : file.info.date}
                        </span>
                    </h3>
                    {!file.isSkeleton ? (
                        <Dropdown>
                            <Button
                                to={to}
                                compact
                                leftIcon={
                                    <ArrowUpRightCircle
                                        strokeWidth={1.25}
                                        color="var(--clr-primary-100)"
                                    />
                                }>
                                Open
                            </Button>
                            <Button
                                compact
                                leftIcon={
                                    <Edit
                                        strokeWidth={1.25}
                                        color="var(--clr-primary-100)"
                                    />
                                }
                                onClick={() => setTodo("WIP =(")}>
                                {todo}
                            </Button>
                            <Button
                                className="btn-danger"
                                compact
                                leftIcon={
                                    <Trash
                                        strokeWidth={1.25}
                                        color="var(--clr-danger-000)"
                                    />
                                }
                                divider={true}
                                onClick={(e) => handleDelete(e, file)}>
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
