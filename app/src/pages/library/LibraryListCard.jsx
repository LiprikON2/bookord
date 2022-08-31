import React, { useContext, useState } from "react";
import { Edit, ArrowUpRightCircle, Trash, Photo } from "tabler-icons-react";

import Button from "components/Button";
import Dropdown from "components/Dropdown";
import "./LibraryListCard.css";
import { downloadImage } from "Utils/downloadImage";
// @ts-ignore
import ROUTES from "Constants/routes";
import Link from "components/Link";
import { AppContext } from "Core/Routes";

const LibraryListCard = ({
    file,
    withoutLink = false,
    style = undefined,
    to = undefined,
    innerRef = undefined,
    ...rest
}) => {
    const toLocation = {
        pathname: ROUTES.READ,
        state: {
            bookFile: {
                ...file,
            },
        },
    };

    if (!withoutLink) {
        return (
            <Link to={toLocation} className="" role="listitem" innerRef={innerRef}>
                <Card file={file} to={toLocation} style={style} {...rest} />
            </Link>
        );
    } else {
        return (
            <div ref={innerRef} role="listitem">
                <Card file={file} to={toLocation} style={style} {...rest} />
            </div>
        );
    }
};

const Card = ({ file, style = undefined, to = undefined }) => {
    const { files, setFiles } = useContext(AppContext);

    const handleDelete = (e, file) => {
        e.preventDefault();

        const fileIndex = files.findIndex((fileItem) => fileItem === file);
        setFiles.remove(fileIndex);

        window.api.send("app:on-file-delete", file);
        // Chokidar (from `io.js`) then triggers file update
    };

    const [todo, setTodo] = useState("Details");

    return (
        <div
            className="card"
            style={file.isSkeleton ? { pointerEvents: "none", ...style } : { ...style }}>
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
                            onClick={() =>
                                downloadImage(
                                    file.info.cover,
                                    file.info.title + " – Cover"
                                )
                            }
                            leftIcon={
                                <Photo
                                    strokeWidth={1.25}
                                    color="var(--clr-primary-100)"
                                />
                            }>
                            Save cover
                        </Button>
                        <Button
                            compact
                            leftIcon={
                                <Edit strokeWidth={1.25} color="var(--clr-primary-100)" />
                            }
                            onClick={() => setTodo("WIP =(")}>
                            {todo}
                        </Button>
                        <Button
                            className="btn-danger"
                            compact
                            leftIcon={
                                <Trash strokeWidth={1.25} color="var(--clr-danger-000)" />
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
    );
};
export default LibraryListCard;
