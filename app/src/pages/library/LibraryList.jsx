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
                <ul className="card-list">
                    {files.map((file) => (
                        <Link
                            to={{
                                pathname: ROUTES.READ,
                                state: {
                                    book: file,
                                },
                            }}
                            key={file.path}>
                            <li className="card">
                                <img
                                    className="card-cover"
                                    src={file.info.cover}
                                    alt="book cover"
                                />
                                <div className="card-content">
                                    <h3 className="card-content-title">
                                        {file.info.title}
                                    </h3>
                                    <button
                                        className="card-content-button button is-dark"
                                        onClick={(e) => e.preventDefault()}>
                                        ⚙
                                    </button>
                                </div>

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
