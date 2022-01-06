import React, { useEffect, useState } from "react";

import TitlebarButton from "./TitlebarButton";
import logo from "resources/icon.svg";

import min10 from "resources/titlebar icons/min-w-10.png";
import min12 from "resources/titlebar icons/min-w-12.png";
import min15 from "resources/titlebar icons/min-w-15.png";
import min20 from "resources/titlebar icons/min-w-20.png";
import min24 from "resources/titlebar icons/min-w-24.png";
import min30 from "resources/titlebar icons/min-w-30.png";

import restore10 from "resources/titlebar icons/restore-w-10.png";
import restore12 from "resources/titlebar icons/restore-w-12.png";
import restore15 from "resources/titlebar icons/restore-w-15.png";
import restore20 from "resources/titlebar icons/restore-w-20.png";
import restore24 from "resources/titlebar icons/restore-w-24.png";
import restore30 from "resources/titlebar icons/restore-w-30.png";

import max10 from "resources/titlebar icons/max-w-10.png";
import max12 from "resources/titlebar icons/max-w-12.png";
import max15 from "resources/titlebar icons/max-w-15.png";
import max20 from "resources/titlebar icons/max-w-20.png";
import max24 from "resources/titlebar icons/max-w-24.png";
import max30 from "resources/titlebar icons/max-w-30.png";

import close10 from "resources/titlebar icons/close-w-10.png";
import close12 from "resources/titlebar icons/close-w-12.png";
import close15 from "resources/titlebar icons/close-w-15.png";
import close20 from "resources/titlebar icons/close-w-20.png";
import close24 from "resources/titlebar icons/close-w-24.png";
import close30 from "resources/titlebar icons/close-w-30.png";

const Titlebar = () => {
    useEffect(() => {
        window.api.receive("app:window-is-restored", () => {
            setMaximized(false);
        });
        window.api.receive("app:window-is-maximized", () => {
            setMaximized(true);
        });
    }, []);

    const [title, setTitle] = useState("Bookord app");
    const [maximized, setMaximized] = useState(true);

    const handleMinimize = (e) => {
        e.preventDefault();
        window.api.send("app:minimize-window");
    };
    const handleRestore = (e) => {
        e.preventDefault();
        window.api.send("app:restore-window");
    };
    const handleMaximize = (e) => {
        e.preventDefault();
        window.api.send("app:maximize-window");
    };
    const handleClose = (e) => {
        e.preventDefault();
        window.api.send("app:close-window");
    };

    return (
        <>
            <header id="titlebar">
                <div id="drag-region">
                    <img className="logo" src={logo} alt="" />
                    <h1 className="window-title" title={title}>
                        {title}
                    </h1>
                </div>
                <div className="window-control-buttons">
                    <TitlebarButton
                        className="button"
                        id="minimize-button"
                        onClick={handleMinimize}
                        srcSet={`${min10} 1x, ${min12} 1.25x, ${min15} 1.5x, ${min15} 1.75x, ${min20} 2x, ${min20} 2.25x, ${min24} 2.5x, ${min30} 3x, ${min30} 3.5x`}></TitlebarButton>
                    {maximized ? (
                        <TitlebarButton
                            className="button"
                            id="restore-button"
                            onClick={handleRestore}
                            srcSet={`${restore10} 1x, ${restore12} 1.25x, ${restore15} 1.5x, ${restore15} 1.75x, ${restore20} 2x, ${restore20} 2.25x, ${restore24} 2.5x, ${restore30} 3x, ${restore30} 3.5x`}></TitlebarButton>
                    ) : (
                        <TitlebarButton
                            className="button"
                            id="maximize-button"
                            onClick={handleMaximize}
                            srcSet={`${max10} 1x, ${max12} 1.25x, ${max15} 1.5x, ${max15} 1.75x, ${max20} 2x, ${max20} 2.25x, ${max24} 2.5x, ${max30} 3x, ${max30} 3.5x`}></TitlebarButton>
                    )}
                    <TitlebarButton
                        className="button"
                        id="close-button"
                        onClick={handleClose}
                        srcSet={`${close10} 1x, ${close12} 1.25x, ${close15} 1.5x, ${close15} 1.75x, ${close20} 2x, ${close20} 2.25x, ${close24} 2.5x, ${close30} 3x, ${close30} 3.5x`}></TitlebarButton>
                </div>
            </header>
        </>
    );
};

export default Titlebar;
