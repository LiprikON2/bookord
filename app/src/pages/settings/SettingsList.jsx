import React, { useState, useLayoutEffect, useContext } from "react";
import { Stack, Tabs } from "@mantine/core";
import { writeConfigRequest } from "secure-electron-store";
import { Palette } from "tabler-icons-react";

import SettingItem from "./SettingItem";
import { AppContext } from "Core/Routes";
import { useDebouncedValue } from "@mantine/hooks";

const SettingsList = () => {
    const { settings, setSettings, updateTheme } = useContext(AppContext);
    const [debouncedSettings] = useDebouncedValue(settings, 100);

    const [sections, setSections] = useState([]);

    const firstSection = settings[Object.keys(settings)[0]].section;

    // Extracts all settings sections without repeats
    const createSections = () => {
        const sectionsSet = [
            ...new Set(Object.keys(settings).map((key) => settings[key].section)),
        ];

        setSections(sectionsSet);
    };

    useLayoutEffect(() => {
        createSections();
    }, []);

    useLayoutEffect(() => {
        window.api.store.send(writeConfigRequest, "settings", debouncedSettings);
        Object.values(settings).forEach((setting) => {
            updateTheme(setting);
            if ("subsettings" in setting) {
                Object.values(setting.subsettings).forEach((setting) =>
                    updateTheme(setting)
                );
            }
        });
    }, [debouncedSettings]);

    const updateSettings = (settingId, value, parentSettingId) => {
        let updatedSetting;
        const setting = parentSettingId
            ? settings[parentSettingId].subsettings[settingId]
            : settings[settingId];
        // Is not a subsetting
        if (!parentSettingId && setting.type !== "complex") {
            // Updates only one specific property of an object inside another object
            updatedSetting = { ...settings[settingId], value: value };
        } else if (setting.type === "complex") {
            // is a setting that has subsettings
            updatedSetting = { ...settings[settingId], useSubsettings: value };
        } else {
            // Is a subsetting
            updatedSetting = {
                ...settings[parentSettingId],
                subsettings: {
                    ...settings[parentSettingId].subsettings,
                    [settingId]: {
                        ...settings[parentSettingId].subsettings[settingId],
                        value: value,
                    },
                },
            };
        }
        const updatedSettings = {
            ...settings,
            [parentSettingId ?? settingId]: updatedSetting,
        };
        setSettings(updatedSettings);
    };

    return (
        <>
            <section className="section">
                <Tabs defaultValue={firstSection}>
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
                                                    <React.Fragment key={key + "-item"}>
                                                        <SettingItem
                                                            settingId={key}
                                                            setting={setting}
                                                            updateSettings={
                                                                updateSettings
                                                            }
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
