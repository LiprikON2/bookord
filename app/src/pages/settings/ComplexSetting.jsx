import React from "react";
import { Plus } from "tabler-icons-react";
import { Accordion, Group, Switch } from "@mantine/core";
import ColorInput from "components/ColorInput";

import "./ComplexSetting.css";
import SettingItem from "./SettingItem";

const ComplexSetting = ({ updateSettings, settingId, setting }) => {
    const mainSubsettingKey = Object.keys(setting.subsettings)[0];
    const mainSubsetting = setting.subsettings[mainSubsettingKey];

    return (
        <>
            <Group
                style={{ justifyContent: "space-between", width: "100%" }}
                spacing="xs">
                <Accordion
                    value={setting.useSubsettings ? setting.name : null}
                    onChange={(e) => {
                        console.log("e", e, setting.useSubsettings);
                        updateSettings(settingId, !setting.useSubsettings);
                    }}
                    style={{ width: "100%" }}
                    variant="filled"
                    chevron={
                        <>
                            <Plus size={16} />
                        </>
                    }
                    styles={{
                        chevron: {
                            "&[data-rotate]": {
                                transform: "rotate(45deg)",
                            },
                        },
                    }}>
                    <Accordion.Item value={setting.name}>
                        <Accordion.Control>
                            <SettingItem
                                settingId={mainSubsettingKey}
                                setting={mainSubsetting}
                            />
                        </Accordion.Control>
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

export default ComplexSetting;
