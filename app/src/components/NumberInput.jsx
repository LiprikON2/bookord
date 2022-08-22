import React from "react";
import { NumberInput as MantineNumberInput } from "@mantine/core";

import "./NumberInput.css";

const NumberInput = ({
    value = undefined,
    step = undefined,
    precision = undefined,
    min = 0,
    ...rest
}) => {
    const isBigValue = value && value > 5;
    const decimalStepForSmallNumbers = step ?? ((isBigValue ? 1 : 0.1) || 1);

    return (
        <MantineNumberInput
            value={value}
            step={decimalStepForSmallNumbers}
            precision={precision ?? isBigValue ? 0 : 2}
            min={min}
            {...rest}
        />
    );
};

export default NumberInput;
