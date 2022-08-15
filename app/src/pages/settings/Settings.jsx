import React from "react";
import { Title } from "@mantine/core";

import SettingsList from "./SettingsList";

const Settings = () => {
    return (
        <>
            <section className="section" style={{ maxWidth: "75rem" }}>
                <Title order={1}>Settings</Title>
                <SettingsList />
            </section>
        </>
    );
};

export default Settings;
