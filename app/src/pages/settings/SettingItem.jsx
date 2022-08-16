import React, { useContext } from "react";
import { HoverCard, Text, Group } from "@mantine/core";
import { Rotate } from "tabler-icons-react";

import { AppContext } from "Core/Routes";
import Button from "components/Button";

import SettingItemInput from "./SettingItemInput";
import HoverDescription from "./HoverDescription";

const SettingItem = ({ settingId, setting }) => {
    const { settings, setSettings } = useContext(AppContext);

    const updateSettings = (setting, value) => {
        // const updatedSetting = { ...settings[setting], value: value };
        // // Updates only one specific value of an object inside another object
        // const updatedSettings = {
        //     ...settings,
        //     [setting]: updatedSetting,
        // };
        // setSettings(updatedSettings);
    };

    const restoreDefaults = (setting, value) => {
        if (setting.type !== "complex") {
            updateSettings(setting, value);
        } else {
            /* TODO */
        }
    };

    const settingGroupStyle =
        setting.type !== "checkbox" && setting.type !== "complex"
            ? { alignItems: "flex-end" }
            : null;

    return (
        <Group spacing="xs" style={{ ...settingGroupStyle, width: "100%" }}>
            {setting.type !== "complex" ? (
                <>
                    <Button
                        title="Restore To Default"
                        isIconOnly={true}
                        isGhost={true}
                        isVisible={setting.defaultValue !== setting.value}
                        onClick={() => restoreDefaults(settingId, setting.defaultValue)}>
                        <Rotate strokeWidth={1.5} color="var(--clr-primary-100)" />
                    </Button>
                    <HoverDescription setting={setting}>
                        <SettingItemInput
                            updateSettings={updateSettings}
                            settingId={settingId}
                            setting={setting}
                        />
                    </HoverDescription>
                </>
            ) : (
                <SettingItemInput
                    updateSettings={updateSettings}
                    settingId={settingId}
                    setting={setting}
                />
            )}
        </Group>
    );
};

export default SettingItem;
