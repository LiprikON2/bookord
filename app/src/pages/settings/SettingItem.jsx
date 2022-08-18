import React, { useContext } from "react";
import { Group } from "@mantine/core";
import { Rotate } from "tabler-icons-react";

import Button from "components/Button";

import SettingItemInput from "./SettingItemInput";
import HoverDescription from "./HoverDescription";

const SettingItem = ({ updateSettings, settingId, setting, parentSettingId = null }) => {
    const settingGroupStyle =
        setting.type !== "checkbox" && setting.type !== "complex"
            ? { alignItems: "flex-end" }
            : null;

    return (
        <Group spacing="xs" style={{ ...settingGroupStyle, width: "100%" }}>
            {setting.type !== "complex" ? (
                <>
                    <HoverDescription
                        offset={10}
                        openDelay={300}
                        position="bottom-start"
                        description="Restore To Default">
                        <Button
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
                    </HoverDescription>
                    <HoverDescription
                        position={setting.type === "checkbox" ? "left" : "left-end"}
                        description={setting.hoverDescription}>
                        <SettingItemInput
                            updateSettings={updateSettings}
                            settingId={settingId}
                            setting={setting}
                            parentSettingId={parentSettingId}
                        />
                    </HoverDescription>
                </>
            ) : (
                <>
                    <SettingItemInput
                        updateSettings={updateSettings}
                        settingId={settingId}
                        setting={setting}
                        parentSettingId={parentSettingId}
                    />
                </>
            )}
        </Group>
    );
};

export default SettingItem;
