import React from "react";
import { ConnectedRouter } from "connected-react-router";
import { Provider } from "react-redux";
import Routes from "Core/routes";
import Nav from "./nav";
import "./root.css";

class Root extends React.Component {
    render() {
        const { store, history } = this.props;

        return (
            <>
                <Provider store={store}>
                    <ConnectedRouter history={history}>
                        <Nav history={history}></Nav>
                        <Routes></Routes>
                    </ConnectedRouter>
                </Provider>
            </>
        );
    }
}

export default Root;
