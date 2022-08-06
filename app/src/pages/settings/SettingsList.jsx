import React, { useState, useLayoutEffect } from "react";
import { Stack, Title } from "@mantine/core";

import Setting from "./Setting";

const SettingsList = ({ settings, setSettings }) => {
    const [sections, setSections] = useState([]);

    // Extracts all settings sections without repeats
    const createSections = () => {
        const sectionsSet = [
            ...new Set(Object.keys(settings).map((key) => settings[key].section)),
        ];

        setSections(sectionsSet);
    };

    useLayoutEffect(() => {
        createSections();
    }, [settings]);

    return (
        <>
            <section className="section">
                {sections.map((section) => {
                    return (
                        <section key={section}>
                            <Title order={2}>{section}</Title>
                            <Stack m="xl" align="flex-start" style={{ marginInline: 0 }}>
                                {Object.keys(settings).map((key) => {
                                    const setting = settings[key];
                                    if (setting.section === section) {
                                        return (
                                            <React.Fragment key={key}>
                                                <Setting
                                                    settingID={key}
                                                    setting={setting}
                                                    settings={settings}
                                                    setSettings={setSettings}
                                                />
                                            </React.Fragment>
                                        );
                                    }
                                })}
                            </Stack>
                        </section>
                    );
                })}
            </section>
        </>
    );
};

export default SettingsList;
