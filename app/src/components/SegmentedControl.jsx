import React from "react";
import { SegmentedControl as MantineSegmentedControl } from "@mantine/core";

import "./SegmentedControl.css";

const SegmentedControl = ({ data, ...rest }) => {
    return <MantineSegmentedControl data={data} {...rest} />;
};

export default SegmentedControl;
