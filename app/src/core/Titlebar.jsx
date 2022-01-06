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
                <div className="window-control-group">
                    <button
                        tabIndex="-1"
                        className="button"
                        id="minimize-button">
                        ─
                    </button>
                    <button
                        tabIndex="-1"
                        className="button"
                        id="maximize-button">
                        ❐◻
                    </button>
                    <button tabIndex="-1" className="button" id="close-button">
                        ✕
                    </button>
                </div>
            </header>
        </>
    );
};

export default Titlebar;
