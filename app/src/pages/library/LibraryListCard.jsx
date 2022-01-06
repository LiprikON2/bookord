import React, { useRef } from "react";

import "./LibraryList.css";

const LibraryListCard = ({ file }) => {
    const dropdownRef = useRef(null);

    const toggleDropdown = (e) => {
        e.preventDefault();
        dropdownRef.current.classList.toggle("is-active");
    };

    const handleDelete = (e, file) => {
        // todo remove from last opened book too
        e.preventDefault();
        window.api.send("app:on-file-delete", file);
    };

    return (
        <>
            <li className="card">
                <span>
                    <img
                        className="card-cover"
                        src={file.info.cover}
                        alt="book cover"
                    />
                </span>
                <div
                    className="card-content"
                    onClick={(e) => {
                        e.preventDefault();
                    }}>
                    <h3 className="card-content-title">
                        <span>{file.info.title}</span>
                    </h3>
                    <div ref={dropdownRef} className="dropdown is-up is-right">
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
                                <div className="dropdown-item">
                                    <button className="button is-dark">
                                        Open
                                    </button>
                                </div>
                                <div className="dropdown-item">
                                    <button className="button is-dark">
                                        Edit
                                    </button>
                                </div>
                                <hr className="dropdown-divider" />
                                <div className="dropdown-item">
                                    <button
                                        className="button is-dark"
                                        onClick={(e) => handleDelete(e, file)}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <div
                                className="click-outside"
                                onClick={toggleDropdown}></div>
                        </div>
                    </div>
                </div>
            </li>
        </>
    );
};
export default LibraryListCard;
