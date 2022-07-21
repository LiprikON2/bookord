import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeft, Settings, Speakerphone, Book, Typography } from "tabler-icons-react";
import { Divider } from "@mantine/core";
import { readConfigRequest, readConfigResponse } from "secure-electron-store";

import ROUTES from "../constants/routes.json";
import Button from "../components/Button";
import "./Navbar.css";

const Navbar = ({ lastOpenedBookTitle }) => {
    const location = useLocation();

    const isBtnBackVisible = location.pathname === ROUTES.LIBRARY;
    const conditionalBackButtonStyle = {
        opacity: isBtnBackVisible ? "0" : "1",
        pointerEvents: isBtnBackVisible ? "none" : "auto",
    };

    const isBtnContinueReadingVisible =
        location.pathname === ROUTES.READ || !lastOpenedBookTitle;
    const conditionalContinueReadingStyle = {
        opacity: isBtnContinueReadingVisible ? "0" : "1",
        pointerEvents: isBtnContinueReadingVisible ? "none" : "auto",
    };

    // useEffect(() => {
    //     // Send an IPC request to get config
    //     window.api.store.send(readConfigRequest, "recentBooks");

    //     // Listen for responses from the electron store
    //     window.api.store.onReceive(readConfigResponse, (args) => {
    //         // Check first if the requested book is already parsed
    //         // i.e. is currently in recent books
    //         if (args.key === "recentBooks" && args.success) {
    //             const retrivedRecentBooks = args.value ?? [];
    //             console.log("got retrivedRecentBooks", retrivedRecentBooks);

    //             if (retrivedRecentBooks.length) {
    //                 // The last book in the list of recent books is the last opened book
    //                 const parsedBook =
    //                     retrivedRecentBooks[retrivedRecentBooks.length - 1];

    //                 setLastReadBook(parsedBook);
    //             }
    //         }
    //     });
    // }, []);

    return (
        <>
            <nav className="navbar">
                <ul className="navbar-list">
                    <li className="navbar-item" style={conditionalBackButtonStyle}>
                        <Button
                            disabled={isBtnBackVisible}
                            to={ROUTES.LIBRARY}
                            title="Back to Library"
                            isIconOnly={true}>
                            <ArrowLeft strokeWidth={1.5} color="var(--clr-primary-100)" />
                        </Button>
                    </li>
                    <Divider size="md" orientation="vertical" />
                    <li className="navbar-item">
                        <Button
                            to={ROUTES.SETTINGS}
                            title="Application Settings"
                            leftIcon={
                                <Settings
                                    strokeWidth={1.5}
                                    color="var(--clr-primary-100)"
                                />
                            }>
                            Settings
                        </Button>
                    </li>
                    <li className="navbar-item">
                        <Button
                            title="Font Settings"
                            leftIcon={
                                <Typography
                                    strokeWidth={1.5}
                                    color="var(--clr-primary-100)"
                                />
                            }>
                            Font
                        </Button>
                    </li>
                    <li className="navbar-item">
                        <Button
                            title="Text-To-Speech Settings"
                            leftIcon={
                                <Speakerphone
                                    strokeWidth={1.5}
                                    color="var(--clr-primary-100)"
                                />
                            }>
                            TTS
                        </Button>
                    </li>
                    <li className="navbar-item">
                        <Button
                            to={ROUTES.CONTEXTMENU}
                            leftIcon={
                                <Book strokeWidth={1.5} color="var(--clr-primary-100)" />
                            }>
                            TEST
                        </Button>
                    </li>
                    <li className="navbar-item" style={conditionalContinueReadingStyle}>
                        <Button
                            disabled={isBtnContinueReadingVisible}
                            to={ROUTES.READ}
                            title={`Continue Reading "${lastOpenedBookTitle}"`}
                            leftIcon={
                                <Book strokeWidth={1.5} color="var(--clr-primary-100)" />
                            }>
                            Continue Reading
                        </Button>
                    </li>
                </ul>
            </nav>
        </>
    );
};

export default Navbar;
