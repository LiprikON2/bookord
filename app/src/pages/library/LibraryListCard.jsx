import React from "react";

import Button from "components/Button";
import Dropdown from "components/Dropdown";

import "./LibraryListCard.css";

const LibraryListCard = ({ file }) => {
    const handleDelete = (e, file) => {
        e.preventDefault();
        window.api.send("app:on-file-delete", file);
        // Chokidar then triggers removeFromInteractionState
    };
    // Todo Занимательная физика has too much height
    // Todo when only one book its too big
    // TODO Overlord - Volume 13 - Paladin of the Holy Kingdom (Second Part) cant find image
    return (
        <>
            <div className="card">
                {file.info.cover ? (
                    <span className="card-cover">
                        <img src={file.info.cover} alt="book cover" />
                    </span>
                ) : (
                    <span className="card-cover no-cover">
                        <div className="clip-path-wrapper">
                            <div className="clip-path">
                                <h3>{file.info.title}</h3>
                            </div>
                        </div>
                    </span>
                )}
                <div
                    className="card-content"
                    onClick={(e) => {
                        e.preventDefault();
                    }}>
                    <h3 className="card-content-title" title={file.info.title}>
                        <span>{file.info.title}</span>
                    </h3>
                    <Dropdown>
                        <Button>Open</Button>
                        <Button>Edit</Button>
                        <Button divider="true" onClick={(e) => handleDelete(e, file)}>
                            Delete
                        </Button>
                    </Dropdown>
                </div>
            </div>
        </>
    );
};
export default LibraryListCard;
