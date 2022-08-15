import React from "react";
import { ColorInput as MantineColorInput } from "@mantine/core";

import "./ColorInput.css";

const ColorInput = ({ ...rest }) => {
    return <MantineColorInput {...rest} />;
};

export default ColorInput;
