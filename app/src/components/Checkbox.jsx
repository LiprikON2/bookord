import React from "react";
import { Checkbox as MantineCheckbox } from "@mantine/core";

import "./Checkbox.css";

const Checkbox = ({ ...rest }) => {
    return <MantineCheckbox {...rest} />;
};

export default Checkbox;
