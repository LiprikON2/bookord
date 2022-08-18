import { Space } from "@mantine/core";
import React from "react";

import Checkbox from "components/Checkbox";
import NumberInput from "components/NumberInput";
import ColorInput from "components/ColorInput";
import ComplexInput from "./ComplexInput";
import FontInput from "components/FontInput";

const dynamicInputTypes = {
    numberInput: NumberInput,
    colorInput: ColorInput,
    fontInput: FontInput,
};

const SettingItemInput = ({ updateSettings, settingId, setting, parentSettingId }) => {
    return (
        <>
            {setting.type === "checkbox" ? (
                <Checkbox
                    label={setting.name}
                    checked={setting.value}
                    onChange={() =>
                        updateSettings(settingId, !setting.value, parentSettingId)
                    }
                    size="md"
                />
            ) : setting.type in dynamicInputTypes ? (
                (() => {
                    const GenericInput = dynamicInputTypes[setting.type];
                    return (
                        <GenericInput
                            onChange={(newValue) =>
                                updateSettings(settingId, newValue, parentSettingId)
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
                <ComplexInput
                    updateSettings={updateSettings}
                    settingId={settingId}
                    setting={setting}
                />
            ) : null}
        </>
    );
};

export default SettingItemInput;
