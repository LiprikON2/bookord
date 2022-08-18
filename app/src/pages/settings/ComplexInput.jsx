import React from "react";
import { Accordion, Box, Group, Stack } from "@mantine/core";

import "./ComplexInput.css";
import SettingItem from "./SettingItem";
import HoverDescription from "./HoverDescription";
import Switch from "components/Switch";

const ComplexInput = ({ updateSettings, settingId, setting }) => {
    const mainSubsettingKey = Object.keys(setting.subsettings)[0];
    const mainSubsetting = setting.subsettings[mainSubsettingKey];

    return (
        <>
            <Group style={{ justifyContent: "space-between", width: "100%" }}>
                <Accordion
                    variant="separated"
                    value={setting.useSubsettings ? setting.name : null}
                    style={{ width: "100%" }}
                    chevron={null}>
                    <Accordion.Item value={setting.name}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Accordion.Control>
                                <SettingItem
                                    settingId={mainSubsettingKey}
                                    setting={mainSubsetting}
                                    parentSettingId={settingId}
                                    updateSettings={updateSettings}
                                />
                            </Accordion.Control>
                            <HoverDescription
                                position={
                                    setting.type === "checkbox" ? "left" : "left-end"
                                }
                                description={setting.hoverDescription}>
                                <Switch
                                    label="Show Advanced"
                                    checked={setting.useSubsettings}
                                    onChange={() =>
                                        updateSettings(settingId, !setting.useSubsettings)
                                    }
                                />
                            </HoverDescription>
                        </Box>
                        <Accordion.Panel>
                            <Stack
                                m="xl"
                                align="flex-start"
                                style={{ marginInline: 0, width: "100%" }}>
                                {Object.keys(setting.subsettings)
                                    .slice(1) // Removes main subsetting which is shown in Control
                                    .map((subsettingKey) => {
                                        const subsetting =
                                            setting.subsettings[subsettingKey];
                                        return (
                                            <React.Fragment
                                                key={settingId + subsettingKey}>
                                                <SettingItem
                                                    settingId={subsettingKey}
                                                    setting={subsetting}
                                                    parentSettingId={settingId}
                                                    updateSettings={updateSettings}
                                                />
                                            </React.Fragment>
                                        );
                                    })}
                            </Stack>
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>
            </Group>
        </>
    );
};

export default ComplexInput;
