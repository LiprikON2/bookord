import React from "react";

const Button = () => {
    return (
        <>
            <button
                tabIndex="-1"
                className="button"
                id="minimize-button"
                onClick={handleMinimize}>
                <img
                    srcSet={`${min10} 1x, ${min12} 1.25x, ${min15} 1.5x, ${min15} 1.75x, ${min20} 2x, ${min20} 2.25x, ${min24} 2.5x, ${min30} 3x, ${min30} 3.5x`}
                />
            </button>
        </>
    );
};
