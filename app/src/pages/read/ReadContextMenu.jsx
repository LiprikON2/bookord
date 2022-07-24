import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { Copy, Speakerphone, Highlight, Language } from "tabler-icons-react";
import { Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import Button from "components/Button";
import ContextMenu from "components/ContextMenu";
import SECRET from "Constants/secret";

const PortalTooltip = ({ toTooltip }) => {
    const { target, originalText, translatedText, targetLang, sourceLang } = toTooltip;
    const parent = target.parentNode;

    console.log(sourceLang + "->" + targetLang, translatedText);
    console.log(target);

    // Get contents of <p> as a text node
    // const foobar = target.textNode;

    // // Split 'foobar' into two text nodes, 'foo' and 'bar',
    // // and save 'bar' as a const
    // const bar = foobar.splitText(3);

    // // Create a <u> element containing ' new content '
    // const u = document.createElement("u");
    // u.appendChild(document.createTextNode(" new content "));

    // // Add <u> before 'bar'
    // p.insertBefore(u, bar);

    // The result is: <p>foo<u> new content </u>bar</p>
    // ++++++

    // TODO: this renders multiple times
    const index = target.textContent.indexOf(originalText);
    console.log("index", index, target, originalText);
    const barr = target.firstChild.splitText(index);
    barr.splitText(originalText.length);
    barr.remove();

    const TooltipWrapper = (
        <Tooltip opened label={translatedText} withArrow>
            {originalText}
        </Tooltip>
    );

    console.log(TooltipWrapper, "hhmm");

    return ReactDOM.createPortal(TooltipWrapper, target);
};

const ReadContext = () => {
    const [opened, setOpened] = useDisclosure(false);
    const [contextMenuEvent, setContextMenuEvent] = useState(null);
    const [toTooltip, setToTooltip] = useState({
        target: null,
        originalText: "",
        translatedText: "",
        targetLang: "",
        sourceLang: "",
    });

    const handleCopy = () => {
        if (contextMenuEvent) {
            navigator.clipboard.writeText(contextMenuEvent.selectedText);
            setOpened.close();
        }
    };

    const handleTranslate = () => {
        const targetLang = "RU";
        const originalText = contextMenuEvent.selectedText;

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
                text: originalText,
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
                const { text: translatedText, detected_source_language: sourceLang } =
                    response.translations[0];

                console.log("contextMenuEvent.event.path", contextMenuEvent.event.path);
                const target = contextMenuEvent.event.path[0];

                setToTooltip(() => ({
                    target,
                    originalText,
                    translatedText,
                    targetLang,
                    sourceLang,
                }));
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
            {toTooltip.target && <PortalTooltip toTooltip={toTooltip} />}
        </>
    );
};

export default ReadContext;
