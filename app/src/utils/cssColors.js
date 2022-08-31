import tinycolor from "tinycolor2";

const toColorsObj = {
    "accent": ["--clr-accent-000", "--clr-accent-100"],
    "000": ["--clr-primary-000", "--clr-secondary-000"],
    "100": ["--clr-primary-100", "--clr-secondary-100"],
    "200": ["--clr-primary-200", "--clr-secondary-200"],
    "300": ["--clr-primary-300", "--clr-secondary-300"],
};

export const createContrastVersions = (setting, toColors = toColorsObj) => {
    const fromColor = setting.value;
    const cssVar = setting.theme.cssVar;
    // Contast color generation
    Object.entries(toColors).forEach(([key, colors]) => {
        const contrastColors = colors.map((color) =>
            document.documentElement.style.getPropertyValue(color)
        );

        const contrastColor = tinycolor.mostReadable(fromColor, contrastColors);

        document.documentElement.style.setProperty(
            cssVar + `-contrast-${key}`,
            contrastColor.toString()
        );
        //  Contast color hsl version
        const { h, s, l } = contrastColor.toHsl();
        const contrastHslString = `${h} ${s * 100}% ${l * 100}%`;
        document.documentElement.style.setProperty(
            cssVar + `-contrast-${key}-hsl`,
            contrastHslString
        );
    });
};

export const updateCssVar = (setting) => {
    if ("theme" in setting) {
        if (!setting.disabled) {
            if (setting.type === "colorInput") {
                document.documentElement.style.setProperty(
                    setting.theme.cssVar,
                    setting.value
                );
                // Generates hsl variable version for color
                const color = tinycolor(setting.value);
                const { h, s, l } = color.toHsl();
                const hslString = `${h} ${s * 100}% ${l * 100}%`;

                document.documentElement.style.setProperty(
                    setting.theme.cssVar + "-hsl",
                    hslString
                );
            } else if (setting.type === "fontSizeInput") {
                document.documentElement.style.setProperty(
                    setting.theme.cssVar,
                    parseInt(setting.value) / 16 + "rem"
                );
            } else {
                document.documentElement.style.setProperty(
                    setting.theme.cssVar,
                    setting.value
                );
            }
        } else {
            document.documentElement.style.removeProperty(setting.theme.cssVar);
            document.documentElement.style.removeProperty(setting.theme.cssVar + "-hsl");
            Object.keys(toColorsObj).forEach((key) => {
                document.documentElement.style.removeProperty(
                    setting.theme.cssVar + `-contrast-${key}`
                );
                document.documentElement.style.removeProperty(
                    setting.theme.cssVar + `-contrast-${key}-hsl`
                );
            });
        }
    }
};
