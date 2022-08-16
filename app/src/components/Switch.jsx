import React from "react";
import { Switch as MantineSwitch } from "@mantine/core";

import "./Switch.css";

const Switch = ({ ...rest }) => {
    return <MantineSwitch {...rest} />;
};

export default Switch;
