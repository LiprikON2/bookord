import React from "react";
import { Accordion, Box, Group } from "@mantine/core";
import { useToggle } from "@mantine/hooks";

import "./ComplexInput.css";
import SettingItem from "./SettingItem";
import HoverDescription from "./HoverDescription";
import Switch from "components/Switch";

const ComplexInput = ({ updateSettings, settingId, setting }) => {
    const mainSubsettingKey = Object.keys(setting.subsettings)[0];
    const mainSubsetting = setting.subsettings[mainSubsettingKey];

    const [show, toggleShow] = useToggle([null, setting.name]);

    return (
        <>
            <Group style={{ justifyContent: "space-between", width: "100%" }}>
                <Accordion
                    variant="separated"
                    value={show}
                    onChange={(e) => {
                        // console.log("e", e, setting.useSubsettings);
                        // updateSettings(settingId, !setting.useSubsettings);
                    }}
                    style={{ width: "100%" }}
                    chevron={null}>
                    <Accordion.Item value={setting.name}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Accordion.Control>
                                <SettingItem
                                    settingId={mainSubsettingKey}
                                    setting={mainSubsetting}
                                    parentSettingId={settingId}
                                />
                            </Accordion.Control>
                            <HoverDescription setting={setting}>
                                <Switch label="Show more" onChange={() => toggleShow()} />
                            </HoverDescription>
                        </Box>
                        <Accordion.Panel>
                            {Object.keys(setting.subsettings)
                                .slice(1) // Removes main subsetting which is shown in Control
                                .map((subsettingKey) => {
                                    const subsetting = setting.subsettings[subsettingKey];
                                    console.log(
                                        "complex settingId",
                                        settingId,
                                        subsetting.type
                                    );
                                    return (
                                        <React.Fragment key={settingId + subsettingKey}>
                                            <SettingItem
                                                settingId={subsettingKey}
                                                setting={subsetting}
                                                parentSettingId={settingId}
                                            />
                                        </React.Fragment>
                                    );
                                })}
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>
            </Group>
        </>
    );
};

export default ComplexInput;
