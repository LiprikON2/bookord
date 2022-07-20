import React from "react";
import { ConnectedRouter } from "connected-react-router";
import { Provider } from "react-redux";
import { MantineProvider } from "@mantine/core";

import App from "./App";

class Root extends React.Component {
    render() {
        const { store, history } = this.props;

        return (
            <>
                <Provider store={store}>
                    <ConnectedRouter history={history}>
                        <MantineProvider theme={{ colorScheme: "dark" }}>
                            <App history={history} />
                        </MantineProvider>
                    </ConnectedRouter>
                </Provider>
            </>
        );
    }
}

export default Root;
