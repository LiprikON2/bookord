import React, { useContext } from "react";
import { HoverCard, Text, Space, Group } from "@mantine/core";
import { Rotate } from "tabler-icons-react";

import { AppContext } from "Core/Routes";
import Button from "components/Button";
import Checkbox from "components/Checkbox";
import NumberInput from "components/NumberInput";
import ColorInput from "components/ColorInput";
import ComplexSetting from "./ComplexSetting";

const dynamicInputTypes = { numberInput: NumberInput, colorInput: ColorInput };

const SettingItem = ({ settingID, setting }) => {
    const { settings, setSettings } = useContext(AppContext);

    const updateSettings = (setting, value) => {
        const updatedSetting = { ...settings[setting], value: value };
        // Updates only one specific value of an object inside another object
        const updatedSettings = {
            ...settings,
            [setting]: updatedSetting,
        };

        setSettings(updatedSettings);
    };

    const checkboxStyle = setting.type !== "checkbox" ? { alignItems: "flex-end" } : null;

    return (
        <Group spacing="xs" style={{ ...checkboxStyle, width: "100%" }}>
            <Button
                title="Restore To Default"
                isIconOnly={true}
                isGhost={true}
                isVisible={setting.defaultValue !== setting.value}
                onClick={() => updateSettings(settingID, setting.defaultValue)}>
                <Rotate strokeWidth={1.5} color="var(--clr-primary-100)" />
            </Button>
            <HoverCard
                // @ts-ignore
                style={setting.type === "complex" ? { width: "80%" } : null}
                position={setting.type === "checkbox" ? "left" : "left-end"}
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
                        ) : setting.type === "complex" ? (
                            <ComplexSetting />
                        ) : null}
                    </div>
                </HoverCard.Target>
                <HoverCard.Dropdown>
                    <Text size="sm">{setting.description}</Text>
                </HoverCard.Dropdown>
            </HoverCard>
        </Group>
    );
};

export default SettingItem;
