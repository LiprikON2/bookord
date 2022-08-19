import React, { useState, useLayoutEffect, useContext } from "react";
import { Stack, Tabs } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { writeConfigRequest } from "secure-electron-store";

import SettingsSubsections from "./SettingsSubsections";
import { AppContext } from "Core/Routes";

const SettingSections = ({ initialTab, setCurrentTab, sectionDetails }) => {
    const { settings, setSettings, reloadTheme } = useContext(AppContext);
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
    }, []);

    useLayoutEffect(() => {
        window.api.store.send(writeConfigRequest, "settings", debouncedSettings);
        reloadTheme(settings);
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
            <section className="section" style={{ padding: "0" }}>
                <Tabs onTabChange={setCurrentTab} defaultValue={initialTab}>
                    <Tabs.List>
                        {sections.map((section) => (
                            <Tabs.Tab
                                key={section + "-tab"}
                                value={section}
                                icon={sectionDetails[section].icon}>
                                {section}
                            </Tabs.Tab>
                        ))}
                    </Tabs.List>
                    {sections.map((section) => {
                        const subsections = Object.keys(
                            sectionDetails[section].subsections
                        );

                        return (
                            <Tabs.Panel key={section + "-panel"} value={section} pt="xs">
                                <section>
                                    <Stack
                                        m="xl"
                                        align="flex-start"
                                        style={{ marginInline: 0, width: "100%" }}>
                                        <SettingsSubsections
                                            section={section}
                                            subsections={subsections}
                                            sectionDetails={sectionDetails}
                                            settings={settings}
                                            updateSettings={updateSettings}
                                        />
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

export default SettingSections;
