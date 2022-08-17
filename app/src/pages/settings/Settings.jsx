import React from "react";
import { Title } from "@mantine/core";

import SettingsList from "./SettingsList";

const Settings = () => {
    return (
        <>
            <section
                className="section"
                style={{
                    maxWidth: "calc(35rem + 30vw)",
                    margin: "1em auto",
                    padding: "0 0.5rem",
                }}>
                <Title order={1} style={{ marginBottom: "1.5rem" }}>
                    Settings
                </Title>
                <SettingsList />
            </section>
        </>
    );
};

export default Settings;
