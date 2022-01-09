import React from "react";

import Link from "components/Link";
import ROUTES from "Constants/routes";
import SettingsList from "./SettingsList";

const Settings = ({ settings, setSettings }) => {
    return (
        <>
            <section className="section">
                <h1>Settings</h1>
                <Link to={ROUTES.LIBRARY}>Home</Link>
            </section>
            <SettingsList settings={settings} setSettings={setSettings} />
        </>
    );
};

export default Settings;
