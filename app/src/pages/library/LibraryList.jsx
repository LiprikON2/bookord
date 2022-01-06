import React, { useState } from "react";
import { Link } from "react-router-dom";

import ROUTES from "Constants/routes";
import "./LibraryList.css";

const LibraryList = ({ files, setFiles }) => {
    const handleDelete = (e, file) => {
        // todo remove from last opened book too
        e.preventDefault();
        window.api.send("app:on-file-delete", file);
    };

    const toggleDropdown = (e) => {
        e.preventDefault();
        const dropdownElem = e.currentTarget.parentNode.parentNode;
        dropdownElem.classList.toggle("is-active");
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
                                <div
                                    className="card-content"
                                    onClick={(e) => {
                                        e.preventDefault();
                                    }}>
                                    <h3 className="card-content-title">
                                        <span>{file.info.title}</span>
                                    </h3>
                                    <div className="card-content-dropdown dropdown is-up is-right">
                                        <div className="dropdown-trigger">
                                            <button
                                                className="button is-dark"
                                                aria-haspopup="true"
                                                aria-controls="dropdown-menu-options"
                                                onClick={toggleDropdown}>
                                                <span>☰</span>
                                            </button>
                                        </div>
                                        <div
                                            className="dropdown-menu"
                                            id="dropdown-menu-options"
                                            role="menu">
                                            <div className="dropdown-content">
                                                <hr className="dropdown-divider" />
                                                <div className="dropdown-item">
                                                    <button
                                                        className="button is-dark"
                                                        onClick={(e) =>
                                                            handleDelete(
                                                                e,
                                                                file
                                                            )
                                                        }>
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </Link>
                    ))}
                </ul>
            </section>
        </>
    );
};

export default LibraryList;
