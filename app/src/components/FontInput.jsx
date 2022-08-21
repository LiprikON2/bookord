import { Autocomplete, ScrollArea } from "@mantine/core";
import React, { forwardRef, useEffect, useState } from "react";
import { Text } from "@mantine/core";

import "./FontInput.css";
import { useDebouncedValue, useDidUpdate } from "@mantine/hooks";

const defaultFontsToCheck = new Set(
    [
        // Windows 10
        "Arial",
        "Arial Black",
        "Bahnschrift",
        "Calibri",
        "Cambria",
        "Cambria Math",
        "Candara",
        "Comic Sans MS",
        "Consolas",
        "Constantia",
        "Corbel",
        "Courier New",
        "Ebrima",
        "Franklin Gothic Medium",
        "Gabriola",
        "Gadugi",
        "Georgia",
        "HoloLens MDL2 Assets",
        "Impact",
        "Ink Free",
        "Javanese Text",
        "Leelawadee UI",
        "Lucida Console",
        "Lucida Sans Unicode",
        "Malgun Gothic",
        "Marlett",
        "Microsoft Himalaya",
        "Microsoft JhengHei",
        "Microsoft New Tai Lue",
        "Microsoft PhagsPa",
        "Microsoft Sans Serif",
        "Microsoft Tai Le",
        "Microsoft YaHei",
        "Microsoft Yi Baiti",
        "MingLiU-ExtB",
        "Mongolian Baiti",
        "MS Gothic",
        "MV Boli",
        "Myanmar Text",
        "Nirmala UI",
        "Palatino Linotype",
        "Segoe MDL2 Assets",
        "Segoe Print",
        "Segoe Script",
        "Segoe UI",
        "Segoe UI Historic",
        "Segoe UI Emoji",
        "Segoe UI Symbol",
        "SimSun",
        "Sitka",
        "Sylfaen",
        "Symbol",
        "Tahoma",
        "Times New Roman",
        "Trebuchet MS",
        "Verdana",
        "Webdings",
        "Wingdings",
        "Yu Gothic",
        // macOS
        "American Typewriter",
        "Andale Mono",
        "Arial",
        "Arial Black",
        "Arial Narrow",
        "Arial Rounded MT Bold",
        "Arial Unicode MS",
        "Avenir",
        "Avenir Next",
        "Avenir Next Condensed",
        "Baskerville",
        "Big Caslon",
        "Bodoni 72",
        "Bodoni 72 Oldstyle",
        "Bodoni 72 Smallcaps",
        "Bradley Hand",
        "Brush Script MT",
        "Chalkboard",
        "Chalkboard SE",
        "Chalkduster",
        "Charter",
        "Cochin",
        "Comic Sans MS",
        "Copperplate",
        "Courier",
        "Courier New",
        "Didot",
        "DIN Alternate",
        "DIN Condensed",
        "Futura",
        "Geneva",
        "Georgia",
        "Gill Sans",
        "Helvetica",
        "Helvetica Neue",
        "Herculanum",
        "Hoefler Text",
        "Impact",
        "Lucida Grande",
        "Luminari",
        "Marker Felt",
        "Menlo",
        "Microsoft Sans Serif",
        "Monaco",
        "Noteworthy",
        "Optima",
        "Palatino",
        "Papyrus",
        "Phosphate",
        "Rockwell",
        "Savoye LET",
        "SignPainter",
        "Skia",
        "Snell Roundhand",
        "Tahoma",
        "Times",
        "Times New Roman",
        "Trattatello",
        "Trebuchet MS",
        "Verdana",
        "Zapfino",
    ].sort()
);

const checkFont = (fontFamily) => {
    return document.fonts.check(`12px "${fontFamily}"`);
};

const getFontList = async () => {
    await document.fonts.ready;

    const fontAvailable = new Set();

    for (const font of defaultFontsToCheck.values()) {
        if (checkFont(font)) {
            fontAvailable.add(font);
        }
    }

    return [...fontAvailable.values()];
};

// @ts-ignore
const AutoCompleteItem = forwardRef(({ value, ...rest }, ref) => (
    <div ref={ref} {...rest}>
        <Text style={{ fontFamily: value }}>{value}</Text>
    </div>
));

const FontInput = ({
    value = undefined,
    onChange = undefined,
    data = undefined,
    ...rest
}) => {
    const [fonts, setFonts] = useState(null);
    useEffect(() => {
        const fontList = getFontList();
        fontList.then((fontList) => setFonts(fontList));
    }, []);

    const [fontValue, setFontValue] = useState(value);
    const [debouncedFontValue] = useDebouncedValue(fontValue, 300);

    useDidUpdate(() => {
        onChange && onChange(debouncedFontValue);
    }, [debouncedFontValue]);

    useDidUpdate(() => {
        if (value !== fontValue) {
            setFontValue(value);
        }
    }, [value]);

    return (
        <Autocomplete
            className="fontInput"
            value={fontValue}
            onChange={setFontValue}
            dropdownComponent={({ ...rest }) => <ScrollArea type="auto" {...rest} />}
            limit={1000}
            maxDropdownHeight={280}
            inputContainer={(children) => (
                <span
                    style={{
                        fontFamily: checkFont(fontValue)
                            ? fontValue
                            : "var(--ff-default)",
                    }}>
                    {children}
                </span>
            )}
            placeholder="Comic Sans MS"
            itemComponent={AutoCompleteItem}
            data={fonts ?? []}
            {...rest}
        />
    );
};

export default FontInput;
