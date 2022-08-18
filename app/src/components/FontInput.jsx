import { Autocomplete, Avatar, Group, MantineProvider } from "@mantine/core";
import React, { forwardRef, useEffect, useState } from "react";
import { Text } from "@mantine/core";

import "./FontInput.css";

const fontCheck = new Set(
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

// @ts-ignore
const AutoCompleteItem = forwardRef(({ value, ...rest }, ref) => (
    // <div ref={ref} {...rest}>
    //     <Group spacing="xs">
    //         <Avatar size="sm" src={null} color="red">
    //             <span style={{ fontFamily: value }}>{value[0].toUpperCase()}</span>
    //         </Avatar>
    //         <Text style={{ fontFamily: value }}>{value}</Text>
    //     </Group>
    // </div>
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
    const getFontList = async () => {
        await document.fonts.ready;

        const fontAvailable = new Set();

        for (const font of fontCheck.values()) {
            if (document.fonts.check(`12px "${font}"`)) {
                fontAvailable.add(font);
            }
        }

        return [...fontAvailable.values()];
    };

    useEffect(() => {
        const fontList = getFontList();
        fontList.then((fontList) => setFonts(fontList));
    }, []);
    const [fonts, setFonts] = useState(null);

    const [fontValue, setFontValue] = useState("");

    console.log("value", value, "and", value || "unset");

    return (
        <Autocomplete
            value={fontValue}
            // onChange={(value) => {
            //     // onChange && onChange(value);
            //     setFontValue(value);
            // }}
            onChange={setFontValue}
            inputContainer={(children) => (
                <span style={{ fontFamily: fontValue || "var(--ff-default)" }}>
                    {children}
                </span>
            )}
            placeholder="Comic Sans MS"
            itemComponent={AutoCompleteItem}
            style={{ width: "15rem" }}
            data={fonts ?? []}
            {...rest}
        />
    );
};

export default FontInput;
