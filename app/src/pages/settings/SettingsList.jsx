import React, { useState, useLayoutEffect, useEffect } from "react";
import {
    readConfigRequest,
    readConfigResponse,
    writeConfigRequest,
} from "secure-electron-store";

const SettingsList = ({ initSettings }) => {
    const [settings, setSettings] = useState(initSettings);

    useLayoutEffect(() => {
        console.log("initSettings", initSettings);
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
        window.api.store.send(writeConfigRequest, `settings`, updatedSettings);
    };

    return (
        <>
            <section className="section">
                <h2>here:</h2>
                <ul>
                    {Object.keys(settings).map((key) => {
                        const setting = settings[key];
                        return (
                            <li key={key}>
                                <input
                                    id={key}
                                    type="checkbox"
                                    onChange={handleSettigChange}
                                    checked={setting.value}
                                />
                                <label htmlFor={key}>{setting.name}</label>
                            </li>
                        );
                    })}
                </ul>
            </section>
        </>
    );
};

export default SettingsList;
