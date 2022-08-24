import React from "react";
import { Group } from "@mantine/core";
import { Rotate } from "tabler-icons-react";

import Button from "components/Button";
import SettingItemInput from "./SettingItemInput";
import HoverDescription from "./HoverDescription";
import "./SettingItem.css";

const SettingItem = ({
    updateSettings,
    settingKey,
    setting,
    parentSettingKey = null,
}) => {
    const settingGroupStyle =
        setting.type !== "checkbox" && setting.type !== "complex"
            ? { alignItems: "flex-end" }
            : null;

    const isNonDefault = !setting.disabled && setting.defaultValue !== setting.value;

    return (
        <Group
            className={
                "setting-item" + (setting.type === "complex" ? " has-subsettings" : "")
            }
            spacing="xs"
            style={settingGroupStyle}>
            {setting.type !== "complex" ? (
                <>
                    <HoverDescription
                        offset={20}
                        openDelay={300}
                        position="bottom-start"
                        description="Restore To Default"
                        disabled={!isNonDefault}
                        className="btn-restore">
                        <Button
                            isIconOnly={true}
                            isGhost={true}
                            isVisible={isNonDefault}
                            onClick={() =>
                                updateSettings(
                                    settingKey,
                                    setting.defaultValue,
                                    parentSettingKey
                                )
                            }>
                            <Rotate strokeWidth={1.5} color="var(--clr-primary-100)" />
                        </Button>
                    </HoverDescription>
                    <HoverDescription
                        position={
                            setting.type === "checkbox"
                                ? "right"
                                : setting.previewComponent
                                ? "right-start"
                                : "right-end"
                        }
                        description={setting.hoverDescription}
                        previewComponent={setting.previewComponent}>
                        <SettingItemInput
                            updateSettings={updateSettings}
                            setting={setting}
                            settingKey={settingKey}
                            parentSettingKey={parentSettingKey}
                        />
                    </HoverDescription>
                </>
            ) : (
                <>
                    <SettingItemInput
                        updateSettings={updateSettings}
                        settingKey={settingKey}
                        setting={setting}
                        parentSettingKey={parentSettingKey}
                    />
                </>
            )}
        </Group>
    );
};

export default SettingItem;
