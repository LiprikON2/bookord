import { HoverCard } from "@mantine/core";
import React from "react";

import SettingDescription from "./SettingDescription";
import "./HoverDescription.css";

const HoverDescription = ({
    className = undefined,
    children = undefined,
    offset = 20,
    openDelay = 1000,
    position = "right",
    disabled = false,
    description,
    ...rest
}) => {
    return (
        <HoverCard
            // @ts-ignore
            position={position}
            offset={offset}
            width={280}
            openDelay={openDelay}
            zIndex={30}
            {...rest}>
            <HoverCard.Target>
                <span className={className}>{children}</span>
            </HoverCard.Target>
            <HoverCard.Dropdown style={disabled ? { display: "none" } : null}>
                <SettingDescription description={description} />
            </HoverCard.Dropdown>
        </HoverCard>
    );
};

export default HoverDescription;
