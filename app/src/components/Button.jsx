import React from "react";
import { Button as MantineButton, ActionIcon, Divider } from "@mantine/core";
import { withRouter } from "react-router";

import "./Button.css";

// Can be a button, link or an Action icon
const Button = ({
    children,
    className = "",
    onClick,
    isIconOnly = false,
    isGhost = false,
    isVisible = true,
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
                className={
                    isGhost
                        ? className + " button btn" + " btn-ghost"
                        : className + " button btn"
                }
                onClick={(event) => {
                    onClick && onClick(event);
                    if (to) history.push(to);
                }}
                style={
                    !isVisible
                        ? {
                              opacity: "0",
                              pointerEvents: "none",
                          }
                        : null
                }
                {...rest}>
                {children}
            </DynamicButton>
        </>
    );
};

export default withRouter(Button);
