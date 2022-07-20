import React from "react";

import SettingsList from "./SettingsList";

const Settings = ({ settings, setSettings }) => {
    return (
        <>
            <section className="section">
                <h1>Settings</h1>
            </section>
            <SettingsList settings={settings} setSettings={setSettings} />
        </>
    );
};

export default Settings;
