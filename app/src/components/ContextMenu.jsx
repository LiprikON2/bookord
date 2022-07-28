import React, { useState, useEffect } from "react";
import { Dialog } from "@mantine/core";
import { useDisclosure, useClickOutside } from "@mantine/hooks";

import "./ContextMenu.css";

const ContextMenu = ({
    children,
    opened = false,
    setOpened,
    setContextMenuEvent,
    position,
    ...rest
}) => {
    useEffect(() => {
        document.addEventListener(
            "contextmenu",
            (e) => {
                const selectedText = window.getSelection().toString();
                const bookComponent = document.querySelector("book-component");
                const selection = bookComponent.shadowRoot.getSelection();

                if (e.target.tagName === "BOOK-COMPONENT" && selectedText) {
                    e.preventDefault();

                    setContextMenuEvent({ event: e, selectedText, selection });
                    setPos({ x: e.x, y: e.y });
                    setOpened.open();
                }
            },
            false
        );
    }, []);

    const [pos, setPos] = useState({ x: 0, y: 0 });

    const ref = useClickOutside(() => setOpened.close());

    return (
        <>
            <Dialog
                className="context-menu"
                ref={ref}
                opened={opened}
                position={{ left: pos.x, top: pos.y }}
                {...rest}>
                {children}
            </Dialog>
        </>
    );
};

export default ContextMenu;
