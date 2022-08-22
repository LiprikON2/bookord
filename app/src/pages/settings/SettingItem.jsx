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

    return (
        <Group
            spacing="xs"
            style={{ ...settingGroupStyle, width: "100%", paddingBottom: "4px" }}>
            {setting.type !== "complex" ? (
                <>
                    <HoverDescription
                        offset={30}
                        openDelay={300}
                        position="bottom-start"
                        description="Restore To Default"
                        disabled={
                            !setting.disabled && setting.defaultValue !== setting.value
                        }
                        className="btn-restore">
                        <Button
                            isIconOnly={true}
                            isGhost={true}
                            isVisible={
                                !setting.disabled &&
                                setting.defaultValue !== setting.value
                            }
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
                        position={setting.type === "checkbox" ? "right" : "right-end"}
                        description={setting.hoverDescription}>
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
