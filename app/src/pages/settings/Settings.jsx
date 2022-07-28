import React from "react";
import { Title } from "@mantine/core";

import SettingsList from "./SettingsList";

const Settings = ({ settings, setSettings }) => {
    return (
        <>
            <section className="section">
                <Title order={1}>Settings</Title>
                <SettingsList settings={settings} setSettings={setSettings} />
            </section>
        </>
    );
};

export default Settings;
