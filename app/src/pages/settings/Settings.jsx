import React, { useContext, useState } from "react";
import { Palette, Adjustments, Rocket, Typography, Paint } from "tabler-icons-react";

import SettingSections from "./SettingsSections";
import { AppContext } from "Core/Routes";
import Title from "components/Title";

const sectionDetails = {
    "App Settings": {
        description: "Adjust how app behaves.",
        icon: <Adjustments size={14} />,
        subsections: {
            Startup: {
                description: "What happens at launch?",
                icon: <Rocket className="subsection-icon" size={64} />,
            },
        },
    },
    "Theme": {
        description: "Customize how the app feels.",
        icon: <Palette size={14} />,
        subsections: {
            Font: {
                description: "Style font's look and size.",
                icon: <Typography className="subsection-icon" size={64} />,
            },
            Color: {
                description: "Repaint the app!",
                icon: <Paint className="subsection-icon" size={64} />,
            },
        },
    },
};

const Settings = () => {
    const { settings } = useContext(AppContext);
    const firstSection = settings[Object.keys(settings)[0]].section;

    const [currentTab, setCurrentTab] = useState(firstSection);

    return (
        <>
            <section
                className="section"
                style={{
                    maxWidth: "calc(35rem + 30vw)",
                    margin: "1em auto",
                    padding: "0 0.5rem",
                }}>
                <Title
                    order={1}
                    description={sectionDetails[currentTab].description}
                    style={{ marginBottom: "0.25rem" }}>
                    Settings
                </Title>

                <SettingSections
                    initialTab={firstSection}
                    setCurrentTab={setCurrentTab}
                    sectionDetails={sectionDetails}
                />
            </section>
        </>
    );
};

export default Settings;
