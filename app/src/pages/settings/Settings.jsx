import React from "react";
import { Link } from "react-router-dom";

import ROUTES from "Constants/routes";
import SettingsList from "./SettingsList";

const Settings = ({ initSettings }) => {
    return (
        <>
            <section className="section">
                <h1>Settings</h1>
                <Link
                    to={ROUTES.LIBRARY}
                    className="button is-dark"
                    role="button">
                    Home
                </Link>
            </section>
            <SettingsList initSettings={initSettings} />
        </>
    );
};

export default Settings;
