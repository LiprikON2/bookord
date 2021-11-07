import React from "react";
import { Switch, Route, Redirect } from "react-router";
import ROUTES from "Constants/routes";
import loadable from "@loadable/component";

// Load bundles asynchronously so that the initial render happens faster
const Library = loadable(() =>
    import(/* webpackChunkName: "LibraryChunk" */ "Pages/library/Library")
);
const Read = loadable(() =>
    import(/* webpackChunkName: "ReadChunk" */ "Pages/read/Read")
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

const toContinueReading = () => {
    const initStorage = window.api.store.initial();
    const lastOpenedBook = initStorage["lastOpenedBook"];
    // const continueReading = initStorage["settings"]["continueReading"];
    console.log(lastOpenedBook);

    // return continueReading && lastOpenedBook !== undefined;
    return lastOpenedBook !== undefined;
};
class Routes extends React.Component {
    render() {
        return (
            <Switch>
                <Route exact path="/">
                    {!toContinueReading() ? (
                        <Redirect to={ROUTES.LIBRARY} />
                    ) : (
                        <Redirect to={ROUTES.READ} />
                    )}
                </Route>
                <Route path={ROUTES.LIBRARY} component={Library}></Route>
                <Route path={ROUTES.READ} component={Read}></Route>
                <Route path={ROUTES.ABOUT} component={About}></Route>
                <Route path={ROUTES.MOTD} component={Motd}></Route>
                <Route
                    path={ROUTES.LOCALIZATION}
                    component={Localization}></Route>
                <Route path={ROUTES.UNDOREDO} component={UndoRedo}></Route>
                <Route
                    path={ROUTES.CONTEXTMENU}
                    component={ContextMenu}></Route>
            </Switch>
        );
    }
}

export default Routes;
