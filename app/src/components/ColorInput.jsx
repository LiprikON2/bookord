import React from "react";
import { ColorInput as MantineColorInput } from "@mantine/core";

import "./ColorInput.css";

const ColorInput = ({
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
    return <MantineColorInput swatches={swatches} {...rest} />;
};

export default ColorInput;
