import React from "react";
import { writeConfigRequest } from "secure-electron-store";
import { Checkbox, HoverCard, Text, NumberInput, Space, ColorInput } from "@mantine/core";

const dynamicInputTypes = { numberInput: NumberInput, colorInput: ColorInput };

const Setting = ({ settingID, setting, settings, setSettings }) => {
    const updateSettings = (setting, value) => {
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
            <HoverCard
                position="left"
                offset={20}
                width={280}
                openDelay={1000}
                shadow="md">
                <HoverCard.Target>
                    <div>
                        {setting.type === "checkbox" ? (
                            <Checkbox
                                size="md"
                                label={setting.name}
                                checked={setting.value}
                                onChange={() => updateSettings(settingID, !setting.value)}
                            />
                        ) : setting.type in dynamicInputTypes ? (
                            (() => {
                                const GenericInput = dynamicInputTypes[setting.type];
                                return (
                                    <GenericInput
                                        onChange={(newValue) =>
                                            updateSettings(settingID, newValue)
                                        }
                                        value={setting.value}
                                        label={
                                            <>
                                                {setting.name}
                                                <Space h="sm" />
                                            </>
                                        }
                                        size="md"
                                    />
                                );
                            })()
                        ) : null}
                    </div>
                </HoverCard.Target>
                <HoverCard.Dropdown>
                    <Text size="sm">{setting.description}</Text>
                </HoverCard.Dropdown>
            </HoverCard>
        </>
    );
};

export default Setting;
