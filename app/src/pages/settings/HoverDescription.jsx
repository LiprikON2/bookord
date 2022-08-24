import React from "react";
import { HoverCard } from "@mantine/core";

import SettingDescription from "./SettingDescription";
import "./HoverDescription.css";
import Preview from "./Preview";

const HoverDescription = ({
    className = undefined,
    children = undefined,
    style = undefined,
    offset = 20,
    openDelay = 1000,
    position = "right",
    disabled = false,
    description,
    previewComponent = "",
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
            <HoverCard.Dropdown style={disabled ? { display: "none", ...style } : style}>
                <SettingDescription description={description} />

                {previewComponent && <Preview component={previewComponent} />}
            </HoverCard.Dropdown>
        </HoverCard>
    );
};

export default HoverDescription;
