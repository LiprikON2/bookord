import React from "react";
import { SegmentedControl as MantineSegmentedControl } from "@mantine/core";

import "./SegmentedControl.css";

const SegmentedControl = ({ data, size = undefined, ...rest }) => {
    return (
        <MantineSegmentedControl
            size={size ?? data.length <= 5 ? null : "xs"}
            data={data}
            {...rest}
        />
    );
};

export default SegmentedControl;
