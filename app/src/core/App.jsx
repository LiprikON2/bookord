import React, { useState } from "react";

import Routes from "Core/Routes";
import Titlebar from "./Titlebar";
import Navbar from "./Navbar";

import "bulma/css/bulma.css";
import "./Root.css";

const initStorage = window.api.store.initial();

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
            <Titlebar history={history}></Titlebar>
            <Navbar lastOpenedBookTitle={lastOpenedBookTitle}></Navbar>
            <Routes
                initStorage={initStorage}
                lastOpenedBookTitle={lastOpenedBookTitle}
                setLastOpenedBookTitle={setLastOpenedBookTitle}></Routes>
        </>
    );
};

export default App;
