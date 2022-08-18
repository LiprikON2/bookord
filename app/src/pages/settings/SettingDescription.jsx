import { Space, Text } from "@mantine/core";
import React from "react";

const SettingDescription = ({ description }) => {
    return (
        <>
            {description.split("\n").map((line, index) => (
                <React.Fragment key={line + index}>
                    {index !== 0 ? <Space h="xs" /> : null}
                    <Text size="sm">{line}</Text>
                </React.Fragment>
            ))}
        </>
    );
};

export default SettingDescription;
