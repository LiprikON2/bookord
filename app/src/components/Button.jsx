import React from "react";
import { Button as MantineButton } from "@mantine/core";

import "./Button.css";

const Button = ({ children, className, ...rest }) => {
    return (
        <>
            <MantineButton className={className ?? "button btn"} {...rest}>
                {children}
            </MantineButton>
        </>
    );
};

export default Button;
