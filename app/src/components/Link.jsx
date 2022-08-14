import React from "react";
import { Link as ReactRouterLink } from "react-router-dom";

import "./Button.css";

const Link = ({
    children = undefined,
    className,
    onAuxClick = undefined,
    draggable = undefined,
    to,
    ...rest
}) => {
    return (
        <>
            <ReactRouterLink
                to={to}
                className={className ?? "button btn"}
                onAuxClick={onAuxClick ? onAuxClick : (e) => e.preventDefault()}
                draggable={draggable ?? "false"}
                {...rest}>
                {children}
            </ReactRouterLink>
        </>
    );
};

export default Link;
