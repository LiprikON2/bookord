import React, { useState, useLayoutEffect, useContext } from "react";
import { Stack, Tabs, Title } from "@mantine/core";
import { writeConfigRequest } from "secure-electron-store";
import { Palette } from "tabler-icons-react";

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
                <Tabs defaultValue="App Settings">
                    <Tabs.List>
                        {sections.map((section) => (
                            <Tabs.Tab
                                key={section + "-tab"}
                                value={section}
                                icon={<Palette size={14} />}>
                                {section}
                            </Tabs.Tab>
                        ))}
                    </Tabs.List>
                    {sections.map((section) => {
                        return (
                            <Tabs.Panel key={section + "-panel"} value={section} pt="xs">
                                <section>
                                    <Stack
                                        m="xl"
                                        align="flex-start"
                                        style={{ marginInline: 0, width: "100%" }}>
                                        {Object.keys(settings).map((key) => {
                                            const setting = settings[key];
                                            if (setting.section === section) {
                                                return (
                                                    <React.Fragment key={key}>
                                                        <SettingItem
                                                            settingId={key}
                                                            setting={setting}
                                                        />
                                                    </React.Fragment>
                                                );
                                            }
                                        })}
                                    </Stack>
                                </section>
                            </Tabs.Panel>
                        );
                    })}
                </Tabs>
            </section>
        </>
    );
};

export default SettingsList;
