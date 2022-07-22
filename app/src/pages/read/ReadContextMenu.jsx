import React, { useState, useEffect, useRef, useCallback } from "react";
import { Copy, Speakerphone, Highlight, Language } from "tabler-icons-react";
import { useDisclosure } from "@mantine/hooks";

import Button from "components/Button";
import ContextMenu from "components/ContextMenu";

const ReadContext = () => {
    const [opened, setOpened] = useDisclosure(false);
    const [contextMenuEvent, setContextMenuEvent] = useState(null);

    const handleCopy = () => {
        if (contextMenuEvent) {
            navigator.clipboard.writeText(contextMenuEvent.selectedText);
            setOpened.close();
        }
    };

    // const handleTranslate = () => {
    //     fetch(`https://api.example.com/comments`, {
    //         method: "POST", //This could be any http method
    //         headers: {
    //             "Authorization": "Basic SGVsbG8gdGhlcmUgOikgSGF2ZSBhIGdvb2QgZGF5IQ==",
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({
    //             UID: 58,
    //             Comment: "Fetch is really easy!",
    //         }),
    //     })
    //         .then((response) => response.json())
    //         .then((newComment) => {
    //             // Do something magical with your newly posted comment :)
    //         });
    // }

    return (
        <>
            <ContextMenu
                opened={opened}
                setOpened={setOpened}
                setContextMenuEvent={setContextMenuEvent}>
                <Button
                    onClick={handleCopy}
                    compact
                    leftIcon={<Copy strokeWidth={1.25} color="var(--clr-primary-100)" />}>
                    Copy
                </Button>
                <Button
                    compact
                    leftIcon={
                        <Speakerphone strokeWidth={1.25} color="var(--clr-primary-100)" />
                    }>
                    Read Aloud
                </Button>
                <Button
                    compact
                    leftIcon={
                        <Highlight strokeWidth={1.25} color="var(--clr-primary-100)" />
                    }>
                    Highlight
                </Button>
                <Button
                    compact
                    leftIcon={
                        <Language strokeWidth={1.25} color="var(--clr-primary-100)" />
                    }>
                    Translate
                </Button>
            </ContextMenu>
        </>
    );
};

export default ReadContext;
