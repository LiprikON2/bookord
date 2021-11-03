import React from "react";
import { withTranslation } from "react-i18next";
import "./localization.css";

class Localization extends React.Component {
    render() {
        const { t } = this.props;
        return (
            <>
                <section className="section">
                    <div className="container has-text-centered">
                        <h1 className="title is-1">{t("Hello")}</h1>
                        <div className="subtitle italics">
                            Try changing the language in the menu bar!
                        </div>
                    </div>
                </section>
            </>
        );
    }
}

export default withTranslation()(Localization);
