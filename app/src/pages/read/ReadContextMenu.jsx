import React, { useState, useEffect, useRef, useCallback } from "react";
import { Copy, Speakerphone, Highlight, Language } from "tabler-icons-react";
import { Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import Button from "components/Button";
import ContextMenu from "components/ContextMenu";
import SECRET from "Constants/secret";

const ReadContext = () => {
    const [opened, setOpened] = useDisclosure(false);
    const [contextMenuEvent, setContextMenuEvent] = useState(null);

    const handleCopy = () => {
        if (contextMenuEvent) {
            navigator.clipboard.writeText(contextMenuEvent.selectedText);
            setOpened.close();
        }
    };

    const handleTranslate = () => {
        const targetLang = "RU";

        fetch("https://api-free.deepl.com/v2/translate", {
            method: "POST",
            headers: {
                "Host": "api-free.deepl.com",
                "User-Agent": "YourApp",
                "Accept": "*/*",
                "Content-Length": "100",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                auth_key: SECRET.DEEPL,
                text: contextMenuEvent.selectedText,
                target_lang: targetLang,
            }).toString(),
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error("Something went wrong");
            })
            .then((response) => {
                const { text, detected_source_language: sourceLang } =
                    response.translations[0];
                const targetNode = contextMenuEvent.event.path[0];

                console.log(sourceLang + "->" + targetLang, text);
                console.log(targetNode);

                // const TooltipWrapper = <Tooltip opened label={text} withArrow></Tooltip>;
                const TooltipWrapper = document.querySelector(
                    "#root > nav > ul > li:nth-child(3)"
                );

                targetNode.parentNode.insertBefore(TooltipWrapper, targetNode);
                TooltipWrapper.appendChild(targetNode);
            })
            .catch((error) => {
                console.log(error);
            });
    };

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
                    onClick={handleTranslate}
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
