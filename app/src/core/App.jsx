import React, { useState } from "react";

// @ts-ignore
// import Routes from "Core/Routes";
// import Titlebar from "./Titlebar";
// import Navbar from "./Navbar";

import "bulma/css/bulma.css";
import "./Root.css";
import { getInitStore } from "Utils/getInitialStore";
import loadable from "@loadable/component";

// Load bundles asynchronously so that the initial render happens faster
const Routes = loadable(() =>
    import(/* webpackChunkName: "RoutesChunk" */ "Core/Routes")
);
const Titlebar = loadable(() =>
    import(/* webpackChunkName: "TitlebarChunk" */ "Core/Titlebar")
);
const Navbar = loadable(() =>
    import(/* webpackChunkName: "NavbarChunk" */ "Core/Navbar")
);

const initStorage = getInitStore();

const getInitBookTitle = () => {
    const recentBooks = initStorage.recentBooks;
    // The last book in the list of recent books is the last opened book
    const lastOpenedBook = recentBooks?.[recentBooks?.length - 1];
    const lastOpenedBookTitle = lastOpenedBook?.info?.title;
    return lastOpenedBookTitle;
};

const App = ({ history }) => {
    const [lastOpenedBookTitle, setLastOpenedBookTitle] = useState(getInitBookTitle());

    return (
        <>
            <Titlebar history={history} />
            <Navbar lastOpenedBookTitle={lastOpenedBookTitle} />
            <Routes
                initStorage={initStorage}
                lastOpenedBookTitle={lastOpenedBookTitle}
                setLastOpenedBookTitle={setLastOpenedBookTitle}
            />
        </>
    );
};

export default App;
