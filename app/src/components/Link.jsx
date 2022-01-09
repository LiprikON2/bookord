import React from "react";
import { Link as ReactRouterLink } from "react-router-dom";

const Link = ({ children, className, onAuxClick, draggable, ...rest }) => {
    return (
        <>
            <ReactRouterLink
                className={className ? className : "button is-dark"}
                onAuxClick={onAuxClick ? onAuxClick : (e) => e.preventDefault()}
                draggable={draggable ? draggable : "false"}
                {...rest}>
                {children}
            </ReactRouterLink>
        </>
    );
};

export default Link;
