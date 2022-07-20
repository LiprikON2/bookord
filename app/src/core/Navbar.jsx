import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeft, Settings, Speakerphone, Book } from "tabler-icons-react";

import ROUTES from "../constants/routes.json";
import Button from "../components/Button";
import "./Navbar.css";

const Navbar = () => {
    // const [navItems, setNavItems] = useState("".repeat(12));
    const location = useLocation();
    return (
        <>
            <nav className="navbar">
                <ul className="navbar-list">
                    <li
                        className="navbar-item"
                        style={{
                            opacity: location.pathname === ROUTES.LIBRARY ? "0" : "1",
                            cursor: location.pathname === ROUTES.LIBRARY ? "0" : "1",
                        }}>
                        <Button
                            disabled={location.pathname === ROUTES.LIBRARY}
                            to={ROUTES.LIBRARY}
                            leftIcon={
                                <ArrowLeft
                                    strokeWidth={1.5}
                                    color="var(--clr-primary-100)"
                                />
                            }></Button>
                    </li>
                    <li className="navbar-item">
                        <Button
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
                            to={ROUTES.SETTINGS}
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
                            to={ROUTES.READ}
                            leftIcon={
                                <Book strokeWidth={1.5} color="var(--clr-primary-100)" />
                            }>
                            Continue reading
                        </Button>
                    </li>
                </ul>
            </nav>
        </>
    );
};

export default Navbar;
