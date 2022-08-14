import React, { useState, useLayoutEffect, useContext } from "react";
import { Stack, Title } from "@mantine/core";
import { writeConfigRequest } from "secure-electron-store";

import SettingItem from "./SettingItem";
import { AppContext } from "Core/Routes";
import { useDebouncedValue } from "@mantine/hooks";

const SettingsList = () => {
    const { settings, updateTheme } = useContext(AppContext);
    const [debouncedSettings] = useDebouncedValue(settings, 100);

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

    useLayoutEffect(() => {
        window.api.store.send(writeConfigRequest, "settings", debouncedSettings);
        Object.values(settings).forEach((setting) => updateTheme(setting));
    }, [debouncedSettings]);

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
                                                <SettingItem
                                                    settingID={key}
                                                    setting={setting}
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
