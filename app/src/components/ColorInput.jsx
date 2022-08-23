import React, { useState } from "react";
import { ColorInput as MantineColorInput } from "@mantine/core";

import "./ColorInput.css";
import { useDebouncedValue, useDidUpdate } from "@mantine/hooks";

const ColorInput = ({
    value = undefined,
    onChange = undefined,
    swatches = [
        "#25262b",
        "#868e96",
        "#fa5252",
        "#e64980",
        "#be4bdb",
        "#7950f2",
        "#4c6ef5",
        "#228be6",
        "#15aabf",
        "#12b886",
    ],
    ...rest
}) => {
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
        <MantineColorInput
            value={inputValue}
            onChange={setInputValue}
            swatches={swatches}
            {...rest}
        />
    );
};

export default ColorInput;
