import React from "react";
import { Link } from "react-router-dom";

import ROUTES from "Constants/routes";
import SettingsList from "./SettingsList";

const Settings = ({ settings, setSettings }) => {
    return (
        <>
            <section className="section">
                <h1>Settings</h1>
                <Link
                    to={ROUTES.LIBRARY}
                    draggable="false"
                    onAuxClick={(e) => e.preventDefault()}
                    className="button is-dark"
                    role="button">
                    Home
                </Link>
            </section>
            <SettingsList settings={settings} setSettings={setSettings} />
        </>
    );
};

export default Settings;
