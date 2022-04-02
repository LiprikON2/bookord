import React from "react";

import "./Button.css";

const Button = ({ children, className, ...rest }) => {
    return (
        <>
            <button className={className ?? "button btn"} {...rest}>
                {children}
            </button>
        </>
    );
};

export default Button;
