import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import i18n from "I18n/i18n.config";
import { I18nextProvider } from "react-i18next";
import Root from "Core/Root";
import store, { history } from "Redux/store/store";

const root = createRoot(document.getElementById("root"));
root.render(
    <I18nextProvider i18n={i18n}>
        <Suspense fallback="loading">
            <Root store={store} history={history}></Root>
        </Suspense>
    </I18nextProvider>
);
