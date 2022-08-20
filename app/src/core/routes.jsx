import React, { useState, createContext, useLayoutEffect } from "react";
import { Switch, Route, Redirect } from "react-router";
import tinycolor from "tinycolor2";
import loadable from "@loadable/component";

// @ts-ignore
import ROUTES from "Constants/routes";
// @ts-ignore
import DEFAULT_SETTINGS from "Constants/defaultSettings";

// Load bundles asynchronously so that the initial render happens faster
const Library = loadable(() =>
    import(/* webpackChunkName: "LibraryChunk" */ "Pages/library/Library")
);
const Read = loadable(() =>
    import(/* webpackChunkName: "ReadChunk" */ "Pages/read/Read")
);
const Settings = loadable(() =>
    import(/* webpackChunkName: "SettingsChunk" */ "Pages/settings/Settings")
);
// TODO remove
const About = loadable(() =>
    import(/* webpackChunkName: "AboutChunk" */ "Pages/about/about")
);
const Motd = loadable(() =>
    import(/* webpackChunkName: "MotdChunk" */ "Pages/motd/motd")
);
const Localization = loadable(() =>
    import(/* webpackChunkName: "LocalizationChunk" */ "Pages/localization/localization")
);
const UndoRedo = loadable(() =>
    import(/* webpackChunkName: "UndoRedoChunk" */ "Pages/undoredo/undoredo")
);
const ContextMenu = loadable(() =>
    import(/* webpackChunkName: "ContextMenuChunk" */ "Pages/contextmenu/contextmenu")
);

export const AppContext = createContext(null);

const updateCssVar = (setting) => {
    if ("theme" in setting) {
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
    }
};

const reloadTheme = (settings) => {
    Object.values(settings).forEach((setting) => {
        updateCssVar(setting);
        if ("subsettings" in setting) {
            Object.values(setting.subsettings).forEach((subsetting) =>
                updateCssVar(subsetting)
            );
        }
    });
};

const Routes = ({ initStorage, lastOpenedBookTitle, setLastOpenedBookTitle }) => {
    const toContinueReading = () => {
        const continueReadingSetting = initStorage.settings?.continueReading?.value;

        return lastOpenedBookTitle && continueReadingSetting;
    };

    const getInitSettings = () => {
        const initSettings = initStorage?.settings;
        const mergedSettings = { ...DEFAULT_SETTINGS, ...initSettings };

        return mergedSettings;
    };

    const [settings, setSettings] = useState(getInitSettings());
    useLayoutEffect(() => {
        reloadTheme(settings);
    }, []);

    const [files, setFiles] = useState([]);
    const [skeletontFileCount, setSkeletontFileCount] = useState(0);
    const [isInitLoad, setIsInitLoad] = useState(true);

    return (
        <AppContext.Provider
            value={{
                files,
                setFiles,
                settings,
                setSettings,
                skeletontFileCount,
                setSkeletontFileCount,
                isInitLoad,
                setIsInitLoad,
                reloadTheme,
            }}>
            <main id="main">
                <Switch>
                    <Route exact path="/">
                        <Redirect
                            push
                            to={toContinueReading() ? ROUTES.READ : ROUTES.LIBRARY}
                        />
                    </Route>
                    <Route path={ROUTES.SETTINGS}>
                        <Settings />
                    </Route>
                    <Route path={ROUTES.LIBRARY}>
                        <Library />
                    </Route>
                    <Route path={ROUTES.READ}>
                        <Read setLastOpenedBookTitle={setLastOpenedBookTitle} />
                    </Route>
                    <Route path={ROUTES.ABOUT} component={About}></Route>
                    <Route path={ROUTES.MOTD} component={Motd}></Route>
                    <Route path={ROUTES.LOCALIZATION} component={Localization}></Route>
                    <Route path={ROUTES.UNDOREDO} component={UndoRedo}></Route>
                    <Route path={ROUTES.CONTEXTMENU} component={ContextMenu}></Route>
                </Switch>
            </main>
        </AppContext.Provider>
    );
};

export default Routes;
