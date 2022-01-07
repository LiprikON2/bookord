import React, { useRef, useEffect } from "react";

import "./LibraryListCard.css";

const LibraryListCard = ({ file }) => {
    const dropdownRef = useRef(null);

    useEffect(() => {
        return function cleanup() {
            document.body.removeEventListener("click", closeDropdown);
        };
    }, []);
    const closeDropdown = (e) => {
        if (dropdownRef.current) {
            const isMenu = dropdownRef.current.contains(e.target);
            if (!isMenu) {
                dropdownRef.current.classList.remove("is-active");
                document.body.removeEventListener("click", closeDropdown);
            }
        }
    };

    const openDropdown = (e) => {
        e.preventDefault();

        dropdownRef.current.classList.toggle("is-active");
        document.body.addEventListener("click", closeDropdown);
    };

    const handleDelete = (e, file) => {
        // todo remove from last opened book too
        // todo fix freeze on delete or add
        e.preventDefault();

        window.api.send("app:on-file-delete", file);
    };
    /* Make fallback cover image */
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
                    <h3 className="card-content-title" title={file.info.title}>
                        <span>{file.info.title}</span>
                    </h3>
                    <div ref={dropdownRef} className="dropdown is-up is-right">
                        <div className="dropdown-trigger">
                            <button
                                className="button is-dark"
                                aria-haspopup="true"
                                aria-controls="dropdown-menu-options"
                                onClick={openDropdown}>
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
                        </div>
                    </div>
                </div>
            </li>
        </>
    );
};
export default LibraryListCard;
