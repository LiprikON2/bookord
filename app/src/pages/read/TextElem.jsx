import React from "react";

const TextElem = ({ children, title, className }) => {
    return (
        <>
            <li className={className} title={children}>
                {children}
            </li>
        </>
    );
};

export default TextElem;
