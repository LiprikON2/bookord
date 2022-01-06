import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";

import LibraryListCard from "./LibraryListCard";
import ROUTES from "Constants/routes";
import "./LibraryList.css";

const LibraryList = ({ files, setFiles }) => {
    const handleDelete = (e, file) => {
        // todo remove from last opened book too
        e.preventDefault();
        window.api.send("app:on-file-delete", file);
    };

    const dropdownRef = useRef(null);

    const toggleDropdown = (e) => {
        e.preventDefault();
        const dropdownElem = e.currentTarget.parentNode.parentNode;
        console.log("dropdownRef", dropdownRef.current, dropdownElem);
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
                            draggable="false"
                            key={file.path}>
                            <LibraryListCard file={file}></LibraryListCard>
                        </Link>
                    ))}
                </ul>
            </section>
        </>
    );
};

export default LibraryList;
