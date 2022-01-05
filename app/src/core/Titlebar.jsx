import React from "react";
import logo from "resources/icon.svg";
// TODO disable right click on buttons
const Titlebar = () => {
    return (
        <>
            <header id="titlebar">
                <div id="drag-region">
                    <img className="logo" src={logo} alt="" />
                    <span>Bookord app</span>
                </div>
                <div className="button-group">
                    <button tabIndex="-1" className="button">
                        ─
                    </button>
                    <button tabIndex="-1" className="button">
                        ❒
                    </button>
                    <button tabIndex="-1" className="button close-button">
                        ✕
                    </button>
                </div>
            </header>
        </>
    );
};

export default Titlebar;
