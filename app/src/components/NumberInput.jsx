import React, { useState } from "react";
import { NumberInput as MantineNumberInput } from "@mantine/core";

import "./NumberInput.css";
import { useDebouncedValue, useDidUpdate } from "@mantine/hooks";

const NumberInput = ({
    value = undefined,
    onChange = undefined,
    step = undefined,
    precision = undefined,
    min = 0,
    ...rest
}) => {
    const isBigValue = value && value > 5;
    const decimalStepForSmallNumbers = step ?? ((isBigValue ? 1 : 0.1) || 1);

    // todo make this as onChangeEnd
    const [inputValue, setInputValue] = useState(value);
    const [debouncedFontValue] = useDebouncedValue(inputValue, 300);

    useDidUpdate(() => {
        onChange && onChange(debouncedFontValue);
    }, [debouncedFontValue]);

    useDidUpdate(() => {
        if (value !== inputValue) {
            setInputValue(value);
        }
    }, [value]);

    return (
        <MantineNumberInput
            value={inputValue}
            onChange={setInputValue}
            step={decimalStepForSmallNumbers}
            precision={precision ?? isBigValue ? 0 : 2}
            min={min}
            {...rest}
        />
    );
};

export default NumberInput;
