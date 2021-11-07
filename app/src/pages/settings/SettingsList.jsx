import React, { useState, useLayoutEffect, useEffect } from "react";
import {
    readConfigRequest,
    readConfigResponse,
    writeConfigRequest,
} from "secure-electron-store";

const SettingsList = ({ initSettings }) => {
    const [settings, setSettings] = useState(initSettings);
    // Extracts all unique settings sections
    const sections = [
        ...new Set(Object.keys(settings).map((key) => settings[key].section)),
    ];

    useLayoutEffect(() => {
        console.log("initSettings", initSettings);
        console.log(":", settings, Object.keys(settings));
        console.log("sections", sections);
    }, []);

    const handleSettigChange = ({ target }) => {
        const setting = target.id;
        const value =
            target.type === "checkbox" ? target.checked : target.value;

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
                                            <li key={key}>
                                                <input
                                                    id={key}
                                                    type="checkbox"
                                                    onChange={
                                                        handleSettigChange
                                                    }
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
