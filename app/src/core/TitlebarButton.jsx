import React from "react";

const TitlebarButton = ({ id, onClick, srcSet }) => {
    return (
        <>
            <button tabIndex="-1" className="button" id={id} onClick={onClick}>
                <img srcSet={srcSet} />
            </button>
        </>
    );
};

export default TitlebarButton;
