import React from "react";
import { Link as ReactRouterLink } from "react-router-dom";

import "./Button.css";

const Link = ({ children, className, onAuxClick, draggable, ...rest }) => {
    return (
        <>
            <ReactRouterLink
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
