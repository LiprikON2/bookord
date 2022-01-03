import React from "react";
import { Link } from "react-router-dom";

import ROUTES from "Constants/routes";
import "./LibraryList.css";

const LibraryList = ({ files, setFiles }) => {
    const handleDelete = (file) => {
        window.api.send("app:on-file-delete", file);
    };

    return (
        <>
            <section className="section">
                <ul className="book-list">
                    {files.map((file) => (
                        <Link
                            to={{
                                pathname: ROUTES.READ,
                                state: {
                                    book: file,
                                },
                            }}
                            key={file.path}>
                            <li>
                                <img
                                    id="cover"
                                    src={file.info.cover}
                                    alt="book cover"
                                />

                                <h3 className="title">{file.info.title}</h3>

                                {/* <button
                                    role="button"
                                    onClick={() => handleDelete(file)}>
                                    Delete
                                </button> */}
                            </li>
                        </Link>
                    ))}
                </ul>
            </section>
        </>
    );
};

export default LibraryList;
