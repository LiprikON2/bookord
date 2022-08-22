import React from "react";
import { Group, Space } from "@mantine/core";
import { Wand } from "tabler-icons-react";

import Checkbox from "components/Checkbox";
import NumberInput from "components/NumberInput";
import ColorInput from "components/ColorInput";
import ComplexInput from "./ComplexInput";
import FontInput from "components/FontInput";
import SettingDescription from "./SettingDescription";
import HoverDescription from "./HoverDescription";

const dynamicInputTypes = {
    numberInput: NumberInput,
    fontSizeInput: NumberInput,
    colorInput: ColorInput,
    fontFamilyInput: FontInput,
};

const SettingItemInput = ({ updateSettings, settingKey, setting, parentSettingKey }) => {
    return (
        <>
            {setting.type === "checkbox" ? (
                <Checkbox
                    label={`${setting.canBeDisabled ? "Override ― " : ""}${setting.name}`}
                    checked={setting.value}
                    onChange={() =>
                        updateSettings(settingKey, !setting.value, parentSettingKey)
                    }
                    size="md"
                />
            ) : setting.type in dynamicInputTypes ? (
                (() => {
                    const GenericInput = dynamicInputTypes[setting.type];
                    return (
                        <GenericInput
                            description={
                                <>
                                    <SettingDescription
                                        description={setting.description}
                                    />
                                    <Space h="sm" />
                                </>
                            }
                            rightSection={
                                setting.type === "colorInput" &&
                                setting?.theme?.controlledSettings ? (
                                    <HoverDescription
                                        description={
                                            "Changing this value will affect all other font settings in the group."
                                        }
                                        withArrow
                                        position="top"
                                        width={220}
                                        offset={10}
                                        disabled={setting.disabled}
                                        arrowSize={10}>
                                        <Group>
                                            <Wand />
                                        </Group>
                                    </HoverDescription>
                                ) : null
                            }
                            onChange={(newValue) =>
                                updateSettings(settingKey, newValue, parentSettingKey)
                            }
                            value={setting.value}
                            placeholder={setting.defaultValue}
                            disabled={setting.disabled}
                            label={
                                setting.canBeDisabled ? (
                                    <Checkbox
                                        label={"Override ― " + setting.name}
                                        checked={!setting.disabled}
                                        onChange={() =>
                                            updateSettings(
                                                settingKey,
                                                !setting.disabled,
                                                parentSettingKey,
                                                "disabled"
                                            )
                                        }
                                        size="md"
                                    />
                                ) : (
                                    setting.name
                                )
                            }
                            style={{ width: "15rem" }}
                        />
                    );
                })()
            ) : setting.type === "complex" ? (
                <ComplexInput
                    updateSettings={updateSettings}
                    settingKey={settingKey}
                    setting={setting}
                />
            ) : null}
        </>
    );
};

export default SettingItemInput;
