import React, { useState, useLayoutEffect, useContext } from "react";
import { Stack, Tabs } from "@mantine/core";
import { useDebouncedValue, useDidUpdate } from "@mantine/hooks";
import { writeConfigRequest } from "secure-electron-store";

import SettingsSubsections from "./SettingsSubsections";
import { AppContext } from "Core/Routes";
import tinycolor from "tinycolor2";

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
    }, [debouncedSettings]);

    useDidUpdate(() => {
        reloadTheme(settings);
    }, [settings]);

    const updateSettings = (settingKey, value, parentSettingKey, valueKey = "value") => {
        let updatedSetting;
        const settingOrSubsetting = parentSettingKey
            ? settings[parentSettingKey].subsettings[settingKey]
            : settings[settingKey];
        // Is not a subsetting
        if (!parentSettingKey && settingOrSubsetting.type !== "complex") {
            // Updates only one specific property of an object inside another object
            updatedSetting = { ...settings[settingKey], [valueKey]: value };
        } else if (settingOrSubsetting.type === "complex") {
            // is a setting that has subsettings
            updatedSetting = {
                ...settings[settingKey],
                useSubsettings: value,
            };
        } else {
            // Is normal subsetting
            updatedSetting = {
                ...settings[parentSettingKey],
                subsettings: {
                    ...settings[parentSettingKey].subsettings,
                    [settingKey]: {
                        ...settings[parentSettingKey].subsettings[settingKey],
                        [valueKey]: value,
                    },
                },
            };
        }

        if (
            settingOrSubsetting?.theme?.controlledSettings &&
            settingOrSubsetting.type === "colorInput" &&
            valueKey === "value"
        ) {
            // Is main subsetting
            const updatedSubsettings = {};

            settingOrSubsetting.theme.controlledSettings.forEach(
                (controlledSettingObj) => {
                    const { subsettingKey, h, s, l } = controlledSettingObj;
                    const controlledSetting = {
                        ...settings[parentSettingKey].subsettings[subsettingKey],
                    };
                    const color = tinycolor(value);
                    color.isDark()
                        ? color.lighten(l).saturate(s).spin(h)
                        : color.darken(l).desaturate(s).spin(-h);

                    controlledSetting.value = color.toString();
                    controlledSetting.defaultValue = color.toString();
                    updatedSubsettings[subsettingKey] = controlledSetting;
                }
            );
            const updatedSubsetting = updatedSetting.subsettings[settingKey];
            const mergedSetting = {
                ...settings[parentSettingKey],
                subsettings: {
                    ...settings[parentSettingKey].subsettings,
                    [settingKey]: { ...updatedSubsetting },
                    ...updatedSubsettings,
                },
            };

            const updatedSettings = {
                ...settings,
                [parentSettingKey]: mergedSetting,
            };
            setSettings(updatedSettings);
        } else if (
            settingOrSubsetting?.theme?.controlledSettings &&
            valueKey === "disabled"
        ) {
            // Unchecks useSubsettings and "override" in controlled subsettings
            const updatedSubsettings = {};

            settingOrSubsetting.theme.controlledSettings.forEach(
                (controlledSettingObj) => {
                    const { subsettingKey } = controlledSettingObj;
                    const controlledSetting = {
                        ...settings[parentSettingKey].subsettings[subsettingKey],
                    };

                    controlledSetting.disabled = true;
                    updatedSubsettings[subsettingKey] = controlledSetting;
                }
            );
            const updatedSubsetting = updatedSetting.subsettings[settingKey];
            const mergedSetting = {
                ...settings[parentSettingKey],
                useSubsettings: false,
                subsettings: {
                    ...settings[parentSettingKey].subsettings,
                    [settingKey]: { ...updatedSubsetting },
                    ...updatedSubsettings,
                },
            };

            const updatedSettings = {
                ...settings,
                [parentSettingKey]: mergedSetting,
            };
            setSettings(updatedSettings);
        } else {
            const updatedSettings = {
                ...settings,
                [parentSettingKey ?? settingKey]: updatedSetting,
            };
            setSettings(updatedSettings);
        }
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
                                        style={{
                                            marginInline: 0,
                                            width: "100%",
                                            gap: 0,
                                        }}>
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
