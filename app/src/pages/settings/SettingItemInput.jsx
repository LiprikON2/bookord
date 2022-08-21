import React from "react";
import { Space } from "@mantine/core";
import { Wand } from "tabler-icons-react";

import Checkbox from "components/Checkbox";
import NumberInput from "components/NumberInput";
import ColorInput from "components/ColorInput";
import ComplexInput from "./ComplexInput";
import FontInput from "components/FontInput";
import SettingDescription from "./SettingDescription";

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
                    label={setting.name}
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
                                    <Wand />
                                ) : null
                            }
                            onChange={(newValue) =>
                                updateSettings(settingKey, newValue, parentSettingKey)
                            }
                            value={setting.value}
                            label={setting.name}
                            size="md"
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
