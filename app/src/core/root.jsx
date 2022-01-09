import React, { useState, useEffect } from "react";
import { ConnectedRouter } from "connected-react-router";
import { Provider } from "react-redux";

import Routes from "Core/Routes";
import Titlebar from "./Titlebar";
import ROUTES from "Constants/routes";

import "bulma/css/bulma.css";
import "./Root.css";

const getKeyByValue = (object, value) => {
    return Object.keys(object).find((key) => object[key] === value);
};
const toTitleCase = (str) => {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

const getTitleFromLocation = (location) => {
    const baseTitle = "Bookord app";

    const routeKey =
        getKeyByValue(ROUTES, location.pathname) ||
        getKeyByValue(ROUTES, location.hash.substring(1)) ||
        "";
    const sectionTitle = toTitleCase(routeKey);

    const title = sectionTitle ? `${baseTitle} - ${sectionTitle}` : baseTitle;

    return title;
};

const Root = ({ store, history }) => {
    const [title, setTitle] = useState(getTitleFromLocation(location));

    useEffect(() => {
        // Listen for history change to update titlebar's title accrodingly
        const unlisten = history.listen((location) => {
            const newTitle = getTitleFromLocation(location);
            setTitle(newTitle);
        });
        // Stops the listener when component unmounts
        return unlisten;
    }, []);

    return (
        <>
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    <Titlebar title={title} setTitle={setTitle}></Titlebar>
                    <Routes></Routes>
                </ConnectedRouter>
            </Provider>
        </>
    );
};

export default Root;
