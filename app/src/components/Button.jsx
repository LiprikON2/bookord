import React from "react";
import { Button as MantineButton } from "@mantine/core";
import { withRouter } from "react-router";

import "./Button.css";

const Button = ({
    children,
    className,
    onClick,
    history,
    location,
    match,
    staticContext,
    to,
    ...rest
}) => {
    return (
        <>
            <MantineButton
                className={className ?? "button btn"}
                onClick={(event) => {
                    onClick && onClick(event);
                    if (to) history.push(to);
                }}
                {...rest}>
                {children}
            </MantineButton>
        </>
    );
};

export default withRouter(Button);
