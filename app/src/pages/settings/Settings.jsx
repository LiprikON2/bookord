import React from "react";

import SettingsList from "./SettingsList";

const Settings = ({ initSettings }) => {
    return (
        <>
            <section className="section">
                <h1>Settings</h1>
            </section>
            <SettingsList initSettings={initSettings} />
        </>
    );
};

export default Settings;
