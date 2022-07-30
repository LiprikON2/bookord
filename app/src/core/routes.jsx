import React, { useState } from "react";
import { Switch, Route, Redirect } from "react-router";

// @ts-ignore
import ROUTES from "Constants/routes";
// @ts-ignore
import DEFAULT_SETTINGS from "Constants/defaultSettings";
import loadable from "@loadable/component";

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

const Routes = ({ initStorage, lastOpenedBookTitle, setLastOpenedBookTitle }) => {
    const toContinueReading = () => {
        const continueReadingSetting = initStorage.settings?.continueReading?.value;

        return lastOpenedBookTitle && continueReadingSetting;
    };

    const getInitSettings = () => {
        const initSettings = initStorage?.settings;
        const mergedSettings = Object.assign({}, DEFAULT_SETTINGS, initSettings);

        return mergedSettings;
    };

    const [settings, setSettings] = useState(getInitSettings());

    const [files, setFiles] = useState([]);
    const [skeletontFileCount, setSkeletontFileCount] = useState(0);
    const [isInitLoad, setIsInitLoad] = useState(true);

    return (
        <main id="main">
            <Switch>
                <Route exact path="/">
                    <Redirect
                        push
                        to={toContinueReading() ? ROUTES.READ : ROUTES.LIBRARY}
                    />
                </Route>
                <Route path={ROUTES.SETTINGS}>
                    <Settings settings={settings} setSettings={setSettings} />
                </Route>
                <Route path={ROUTES.LIBRARY}>
                    <Library
                        files={files}
                        setFiles={setFiles}
                        skeletontFileCount={skeletontFileCount}
                        setSkeletontFileCount={setSkeletontFileCount}
                        isInitLoad={isInitLoad}
                        setIsInitLoad={setIsInitLoad}
                    />
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
    );
};

export default Routes;
