import React, { useEffect } from "react";
import { Switch, Route, Redirect } from "react-router";
import { writeConfigRequest } from "secure-electron-store";

import ROUTES from "Constants/routes";
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
const About = loadable(() =>
    import(/* webpackChunkName: "AboutChunk" */ "Pages/about/about")
);
const Motd = loadable(() =>
    import(/* webpackChunkName: "MotdChunk" */ "Pages/motd/motd")
);
const Localization = loadable(() =>
    import(
        /* webpackChunkName: "LocalizationChunk" */ "Pages/localization/localization"
    )
);
const UndoRedo = loadable(() =>
    import(/* webpackChunkName: "UndoRedoChunk" */ "Pages/undoredo/undoredo")
);
const ContextMenu = loadable(() =>
    import(
        /* webpackChunkName: "ContextMenuChunk" */ "Pages/contextmenu/contextmenu"
    )
);

const Routes = () => {
    const initStorage = window.api.store.initial();

    const createDefaultAppSettings = () => {
        // Providing default values to settings without overriding existing ones
        const mergedSettings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            initStorage?.settings
        );

        window.api.store.send(writeConfigRequest, "settings", mergedSettings);
    };

    const toContinueReading = () => {
        const lastOpenedBook = initStorage.lastOpenedBook;
        const continueReading = initStorage?.settings?.toContinueReading;

        // return continueReading && lastOpenedBook !== undefined;
        return lastOpenedBook !== undefined && continueReading;
    };

    useEffect(() => {
        createDefaultAppSettings();
    }, []);

    return (
        <Switch>
            <Route exact path="/">
                {toContinueReading() ? (
                    <Redirect to={ROUTES.READ} />
                ) : (
                    <Redirect to={ROUTES.LIBRARY} />
                )}
            </Route>
            <Route path={ROUTES.SETTINGS} component={Settings}></Route>
            <Route path={ROUTES.LIBRARY} component={Library}></Route>
            <Route path={ROUTES.READ} component={Read}></Route>
            <Route path={ROUTES.ABOUT} component={About}></Route>
            <Route path={ROUTES.MOTD} component={Motd}></Route>
            <Route path={ROUTES.LOCALIZATION} component={Localization}></Route>
            <Route path={ROUTES.UNDOREDO} component={UndoRedo}></Route>
            <Route path={ROUTES.CONTEXTMENU} component={ContextMenu}></Route>
        </Switch>
    );
};

export default Routes;
