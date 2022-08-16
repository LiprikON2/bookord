import { HoverCard, Text } from "@mantine/core";
import React from "react";

const HoverDescription = ({ children, setting }) => {
    return (
        <HoverCard
            // @ts-ignore
            position={setting.type === "checkbox" ? "left" : "left-end"}
            offset={20}
            width={280}
            openDelay={1000}
            shadow="md">
            <HoverCard.Target>
                <span>{children}</span>
            </HoverCard.Target>
            <HoverCard.Dropdown>
                <Text size="sm">{setting.description}</Text>
            </HoverCard.Dropdown>
        </HoverCard>
    );
};

export default HoverDescription;
