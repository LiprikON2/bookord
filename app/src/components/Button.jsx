import React from "react";

const Button = ({ children, className, ...rest }) => {
    return (
        <>
            <button
                className={className ? className : "button is-dark"}
                {...rest}>
                {children}
            </button>
        </>
    );
};

export default Button;
