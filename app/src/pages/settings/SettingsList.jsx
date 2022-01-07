import React, { useState, useEffect, useLayoutEffect } from "react";
import {
    readConfigRequest,
    readConfigResponse,
    writeConfigRequest,
} from "secure-electron-store";

import DEFAULT_SETTINGS from "Constants/defaultSettings";

// todo test if works correctly (needs refresh to save changes for some reason)
const SettingsList = () => {
    const [settings, setSettings] = useState({});
    const [sections, setSections] = useState([]);

    const loadInitSettings = () => {
        window.api.store.clearRendererBindings();
        window.api.store.send(readConfigRequest, "settings");

        window.api.store.onReceive(readConfigResponse, (args) => {
            if (args.key === "settings" && args.success) {
                const initSettings = args.value;

                // Providing default values to settings without overriding existing ones
                const mergedSettings = Object.assign(
                    {},
                    DEFAULT_SETTINGS,
                    initSettings
                );
                setSettings(mergedSettings);

                window.api.store.send(
                    writeConfigRequest,
                    "settings",
                    mergedSettings
                );
            }
        });
    };
    // Extracts all settings sections without repeats
    const createSections = () => {
        const uniqueSections = [
            /* unique? todo */
            ...new Set(
                Object.keys(settings).map((key) => settings[key].section)
            ),
        ];
        setSections(uniqueSections);
    };

    useLayoutEffect(() => {
        // Initial loading of settings
        console.log("settings", settings);
        loadInitSettings();
    }, []);

    useLayoutEffect(() => {
        createSections();
    }, [settings]);

    const updateSettings = ({ target }) => {
        const setting = target.id;
        const value =
            target.type === "checkbox" ? target.checked : target.value;

        // Updates only one specific value of an object inside another object
        const updatedSettings = {
            ...settings,
            [setting]: { ...settings[setting], value: value },
        };

        setSettings(updatedSettings);
        window.api.store.send(writeConfigRequest, "settings", updatedSettings);
    };

    return (
        <>
            <section className="section">
                {sections.map((section) => {
                    return (
                        <section key={section}>
                            <h2>{section}</h2>
                            <ul>
                                {Object.keys(settings).map((key) => {
                                    const setting = settings[key];
                                    if (setting.section === section) {
                                        return (
                                            <li
                                                key={key}
                                                title={setting.description}>
                                                <input
                                                    id={key}
                                                    type="checkbox"
                                                    onChange={updateSettings}
                                                    checked={setting.value}
                                                />
                                                <label htmlFor={key}>
                                                    {setting.name}
                                                </label>
                                            </li>
                                        );
                                    }
                                })}
                            </ul>
                        </section>
                    );
                })}
            </section>
        </>
    );
};

export default SettingsList;
