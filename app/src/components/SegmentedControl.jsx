import React from "react";
import { SegmentedControl as MantineSegmentedControl } from "@mantine/core";

import "./SegmentedControl.css";

const SegmentedControl = ({ data, orientation = undefined, className = "", ...rest }) => {
    const isShort = data.length <= 5;
    const isVertical = orientation === "vertical" || !isShort;

    return (
        <MantineSegmentedControl
            className={className + (isVertical ? " vertical" : "")}
            orientation={orientation ?? (isShort ? null : "vertical")}
            data={data}
            {...rest}
        />
    );
};

export default SegmentedControl;
