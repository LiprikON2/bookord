import React, { useContext } from "react";
import { Group } from "@mantine/core";
import { Rotate } from "tabler-icons-react";

import { AppContext } from "Core/Routes";
import Button from "components/Button";

import SettingItemInput from "./SettingItemInput";
import HoverDescription from "./HoverDescription";

const SettingItem = ({ settingId, setting, parentSettingId = null }) => {
    const { settings, setSettings } = useContext(AppContext);

    const updateSettings = (settingId, value, parentSettingId) => {
        let updatedSetting;

        if (!parentSettingId) {
            updatedSetting = { ...settings[settingId], value: value };
            // Updates only one specific value of an object inside another object
        } else {
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
            [settingId]: updatedSetting,
        };
        console.log("before", settings);
        console.log("updatedSettings", updatedSettings);
        setSettings(updatedSettings);
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
                        onClick={() =>
                            updateSettings(
                                settingId,
                                setting.defaultValue,
                                parentSettingId
                            )
                        }>
                        <Rotate strokeWidth={1.5} color="var(--clr-primary-100)" />
                    </Button>
                    <HoverDescription setting={setting}>
                        <SettingItemInput
                            updateSettings={updateSettings}
                            settingId={settingId}
                            setting={setting}
                            parentSettingId={parentSettingId}
                        />
                    </HoverDescription>
                </>
            ) : (
                <SettingItemInput
                    updateSettings={updateSettings}
                    settingId={settingId}
                    setting={setting}
                    parentSettingId={parentSettingId}
                />
            )}
        </Group>
    );
};

export default SettingItem;
