import React from "react";
import { ConnectedRouter } from "connected-react-router";
import { Provider } from "react-redux";
import { MantineProvider } from "@mantine/core";

import Routes from "Core/Routes";
import Titlebar from "./Titlebar";

import "bulma/css/bulma.css";
import "./Root.css";

const Root = ({ store, history }) => {
    return (
        <>
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    <MantineProvider theme={{ colorScheme: "dark" }}>
                        <Titlebar history={history}></Titlebar>
                        <Routes></Routes>
                    </MantineProvider>
                </ConnectedRouter>
            </Provider>
        </>
    );
};

export default Root;
