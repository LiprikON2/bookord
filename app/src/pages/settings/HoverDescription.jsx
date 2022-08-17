import { HoverCard, Space, Text } from "@mantine/core";
import React from "react";

import "./HoverDescription.css";

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
                {setting.description.split("\n").map((line, index) => (
                    <React.Fragment key={line + index}>
                        {index !== 0 ? <Space h="sm" /> : null}
                        <Text size="sm">{line}</Text>
                    </React.Fragment>
                ))}
            </HoverCard.Dropdown>
        </HoverCard>
    );
};

export default HoverDescription;
