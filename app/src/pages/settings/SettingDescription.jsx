import { Space, Text } from "@mantine/core";
import React from "react";

const SettingDescription = ({ description }) => {
    return (
        <>
            {description.split("\n").map((line, index) => (
                <React.Fragment key={line + index}>
                    <Text size="sm" mt={index !== 0 ? "xs" : null}>
                        {line}
                    </Text>
                </React.Fragment>
            ))}
        </>
    );
};

export default SettingDescription;
