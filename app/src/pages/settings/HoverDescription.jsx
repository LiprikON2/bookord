import { HoverCard } from "@mantine/core";
import React from "react";

import SettingDescription from "./SettingDescription";
import "./HoverDescription.css";

const HoverDescription = ({
    children,
    offset = 20,
    openDelay = 1000,
    position = "left",
    description,
}) => {
    // todo make text unselectable
    // todo make default value for numberinput work
    return (
        <HoverCard
            // @ts-ignore
            position={position}
            offset={offset}
            width={280}
            openDelay={openDelay}
            shadow="md">
            <HoverCard.Target>
                <span>{children}</span>
            </HoverCard.Target>
            <HoverCard.Dropdown>
                <SettingDescription description={description} />
            </HoverCard.Dropdown>
        </HoverCard>
    );
};

export default HoverDescription;
