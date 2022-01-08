import React, { useState } from "react";
import { ConnectedRouter } from "connected-react-router";
import { Provider } from "react-redux";
import Routes from "Core/Routes";
import Titlebar from "./Titlebar";
import "bulma/css/bulma.css";
import "./Root.css";

const Root = ({ store, history }) => {
    const [title, setTitle] = useState("Bookord app");

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
