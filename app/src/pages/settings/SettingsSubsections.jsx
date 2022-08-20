import React from "react";
import { Divider } from "@mantine/core";

import SettingItem from "./SettingItem";
import Title from "components/Title";
import "./SettingsSubsections.css";

const SettingsSubsections = ({
    section,
    subsections,
    sectionDetails,
    settings,
    updateSettings,
}) => {
    return (
        <>
            {subsections.map((subsection) => {
                const { icon, description } =
                    sectionDetails[section].subsections[subsection];

                return (
                    <React.Fragment key={subsection}>
                        <Title
                            className="subsection-title"
                            order={2}
                            description={description}
                            leftIcon={icon}>
                            {subsection}
                        </Title>
                        {Object.keys(settings).map((key) => {
                            const setting = settings[key];
                            if (
                                setting.section === section &&
                                setting.subsection === subsection
                            ) {
                                return (
                                    <React.Fragment key={key}>
                                        <SettingItem
                                            settingId={key}
                                            setting={setting}
                                            updateSettings={updateSettings}
                                        />
                                    </React.Fragment>
                                );
                            }
                        })}
                        <Divider
                            my="sm"
                            style={{
                                width: "100%",
                                height: "100%",
                            }}
                        />
                    </React.Fragment>
                );
            })}
        </>
    );
};

export default SettingsSubsections;
