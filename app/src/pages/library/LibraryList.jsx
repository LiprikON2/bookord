import React from "react";
import { Link } from "react-router-dom";

import ROUTES from "Constants/routes";

const LibraryList = ({ files, setFiles }) => {
    const handleDelete = (file) => {
        window.api.send("app:on-file-delete", file);
    };

    return (
        <>
            <section className="section">
                <ul>
                    {files.map((file) => (
                        <li key={file.path}>
                            <img
                                src={file.info.cover}
                                style={{ maxHeight: "10em" }}
                            />
                            <Link
                                to={{
                                    pathname: ROUTES.READ,
                                    state: {
                                        book: file,
                                    },
                                }}>
                                {file.name}
                            </Link>
                            <span>
                                {" "}
                                | {file.path} | {file.info.publisher}
                            </span>

                            <button
                                role="button"
                                onClick={() => handleDelete(file)}>
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </section>
        </>
    );
};

export default LibraryList;
