import React from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeft, Settings, Speakerphone, Book, Typography } from "tabler-icons-react";
import { Divider } from "@mantine/core";

// @ts-ignore
import ROUTES from "Constants/routes";
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
                    <li className="navbar-item" cm-template="textSelectionTemplate">
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
