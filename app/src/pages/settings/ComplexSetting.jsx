import { Group, Switch } from "@mantine/core";
import React from "react";

import "./ComplexSetting.css";

const ComplexSetting = () => {
    return (
        <>
            <Group
                style={{ justifyContent: "space-between", border: "1px solid black" }}
                spacing="xs">
                <span>Main thing</span>
                <Switch label="Show more" />
            </Group>
        </>
    );
};

export default ComplexSetting;
