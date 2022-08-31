import React, { useState, createContext, useLayoutEffect } from "react";
import { Switch, Route, Redirect } from "react-router";
import loadable from "@loadable/component";

// @ts-ignore
import ROUTES from "Constants/routes";
// @ts-ignore
import DEFAULT_SETTINGS from "Constants/defaultSettings";
import { useListState } from "@mantine/hooks";
import { createContrastVersions, updateCssVar } from "Utils/cssColors";

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

export const AppContext = createContext(null);

const reloadTheme = (settings) => {
    Object.values(settings).forEach((setting) => {
        updateCssVar(setting);
        if ("subsettings" in setting) {
            Object.values(setting.subsettings).forEach((subsetting) =>
                updateCssVar(subsetting)
            );
        }
    });
    Object.values(settings).forEach((setting) => {
        if (setting.type === "colorInput") {
            createContrastVersions(setting.value, setting.theme.cssVar);
        }
        if ("subsettings" in setting) {
            Object.values(setting.subsettings).forEach((subsetting) => {
                if (subsetting.type === "colorInput") {
                    createContrastVersions(subsetting.value, subsetting.theme.cssVar);
                }
            });
        }
    });
};

// ref: https://dev.to/romaintrotard/react-context-performance-5832
const AppContextProvider = ({ initStorage, children }) => {
    const getInitSettings = () => {
        const initSettings = initStorage?.settings;
        const mergedSettings = { ...DEFAULT_SETTINGS, ...initSettings };

        return mergedSettings;
    };

    const [settings, setSettings] = useState(getInitSettings());
    useLayoutEffect(() => {
        reloadTheme(settings);
    }, []);

    const [files, setFiles] = useListState([]);
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
            {children}
        </AppContext.Provider>
    );
};

const Routes = ({ initStorage, lastOpenedBookTitle, setLastOpenedBookTitle }) => {
    const toContinueReading = () => {
        const continueReadingSetting = initStorage.settings?.continueReading?.value;

        return lastOpenedBookTitle && continueReadingSetting;
    };

    return (
        <AppContextProvider initStorage={initStorage}>
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
                </Switch>
            </main>
        </AppContextProvider>
    );
};

export default Routes;
