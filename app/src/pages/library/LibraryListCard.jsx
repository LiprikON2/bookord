import React, { useRef, useEffect } from "react";
import {
    readConfigRequest,
    readConfigResponse,
    writeConfigRequest,
} from "secure-electron-store";

import Button from "components/Button";
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
        e.preventDefault();

        window.api.store.clearRendererBindings();

        // Send an IPC request to get config
        window.api.store.send(readConfigRequest, "interactionStates");

        // Listen for responses from the electron store
        window.api.store.onReceive(readConfigResponse, (args) => {
            if (args.key === "interactionStates" && args.success) {
                const interactionStates = args.value;
                delete interactionStates[file.path];

                window.api.store.send(
                    writeConfigRequest,
                    "interactionStates",
                    interactionStates
                );
                window.api.send("app:on-file-delete", file);
            }
        });
    };
    /* Make fallback cover image */
    return (
        <>
            <li className="card">
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
                    <div ref={dropdownRef} className="dropdown is-up is-right">
                        <div className="dropdown-trigger">
                            <Button
                                aria-haspopup="true"
                                aria-controls="dropdown-menu-options"
                                onClick={openDropdown}>
                                <span>☰</span>
                            </Button>
                        </div>
                        <div
                            className="dropdown-menu"
                            id="dropdown-menu-options"
                            role="menu">
                            <div className="dropdown-content">
                                <div className="dropdown-item">
                                    <Button>Open</Button>
                                </div>
                                <div className="dropdown-item">
                                    <Button>Edit</Button>
                                </div>
                                <hr className="dropdown-divider" />
                                <div className="dropdown-item">
                                    <Button
                                        onClick={(e) => handleDelete(e, file)}>
                                        Delete
                                    </Button>
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
