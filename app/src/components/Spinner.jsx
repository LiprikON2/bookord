import React, { useLayoutEffect } from "react";

import "./Spinner.css";

const Spinner = ({ size = "5rem", style = undefined }) => {
    useLayoutEffect(() => {
        document.documentElement.style.setProperty("--spinner-size", size);
    }, []);
    return (
        <div style={style} className="spinner">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    );
};

export default Spinner;
