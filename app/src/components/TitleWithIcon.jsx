import React from "react";
import { Title as MantineTitle, Text, Space, Box, Group, Stack } from "@mantine/core";

const TitleWithIcon = ({
    className = undefined,
    leftIcon = undefined,
    description = undefined,
    style = {},
    mb = "md",
    ...rest
}) => {
    return (
        <>
            <Group
                className={className}
                style={{ alignItems: "flex-start", ...style }}
                mb={mb}>
                {leftIcon && leftIcon}
                <Stack style={{ gap: 0, maxWidth: "80%" }}>
                    <MantineTitle
                        order={1}
                        style={{ marginBottom: "0.15em" }}
                        {...rest}
                    />
                    {description && <Text className="description">{description}</Text>}
                </Stack>
            </Group>
        </>
    );
};

export default TitleWithIcon;
