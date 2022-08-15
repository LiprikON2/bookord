import React from "react";
import { NumberInput as MantineNumberInput } from "@mantine/core";

import "./NumberInput.css";

const NumberInput = ({ ...rest }) => {
    return <MantineNumberInput {...rest} />;
};

export default NumberInput;
