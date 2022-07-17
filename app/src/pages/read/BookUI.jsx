import React from "react";

import TextElem from "./TextElem";
import PageElem from "./PageElem";

import "./BookUI.css";

const BookUI = ({ UIState, children }) => {
    return (
        <div className="ui">
            <ul className="ui-block">
                <TextElem className="ui-elem">{UIState.bookTitle}</TextElem>
            </ul>
            {children}
            <ul className="ui-block">
                <TextElem className="ui-elem">{UIState.currentSectionTitle}</TextElem>
                <PageElem
                    className="ui-elem"
                    count={UIState.currentSectionPage}
                    total={UIState.totalSectionPages}
                    title="Section page"></PageElem>

                <PageElem
                    className="ui-elem"
                    count={UIState.currentBookPage}
                    total={UIState.totalBookPages}
                    title="Book page"></PageElem>
            </ul>
        </div>
    );
};

export default BookUI;
