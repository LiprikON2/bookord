import React, { useState } from "react";
import { writeConfigRequest } from "secure-electron-store";

// todo test if works correctly (needs refresh to save changes for some reason)
const SettingsList = ({ initSettings }) => {
    const [settings, setSettings] = useState(initSettings);
    // Extracts all unique settings sections
    const sections = [
        ...new Set(Object.keys(settings).map((key) => settings[key].section)),
    ];

    const handleSettigChange = ({ target }) => {
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
