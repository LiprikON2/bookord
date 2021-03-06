import React from "react";
import { Button as MantineButton, ActionIcon, Divider } from "@mantine/core";
import { withRouter } from "react-router";

import "./Button.css";

const Button = ({
    children,
    className = "",
    onClick,
    isIconOnly = false,
    divider = false,
    history,
    location,
    match,
    staticContext,
    to,
    ...rest
}) => {
    const DynamicButton = isIconOnly ? ActionIcon : MantineButton;
    return (
        <>
            {divider ? <Divider className="btn-divider" size="xs" /> : null}
            <DynamicButton
                className={className + " button btn"}
                onClick={(event) => {
                    onClick && onClick(event);
                    if (to) history.push(to);
                }}
                {...rest}>
                {children}
            </DynamicButton>
        </>
    );
};

export default withRouter(Button);
