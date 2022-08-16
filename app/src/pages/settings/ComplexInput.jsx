import React from "react";
import { Accordion, Box, Group, Switch } from "@mantine/core";

import "./ComplexInput.css";
import SettingItem from "./SettingItem";
import { useToggle } from "@mantine/hooks";
import HoverDescription from "./HoverDescription";

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
                                />
                            </Accordion.Control>
                            <HoverDescription setting={setting}>
                                <Switch label="Show more" onChange={() => toggleShow()} />
                            </HoverDescription>
                        </Box>
                        <Accordion.Panel>
                            {Object.keys(setting.subsettings)
                                .slice(1)
                                .map((key) => {
                                    const subsetting = setting.subsettings[key];
                                    return (
                                        <React.Fragment key={key}>
                                            <SettingItem
                                                settingId={key}
                                                setting={subsetting}
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
