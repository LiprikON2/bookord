import React from "react";

const PageElem = ({ count, total, title, className }) => {
    return (
        <>
            <li className={className} title={title}>
                {count && total ? (
                    <>
                        <span>{count}</span>/<span>{total}</span>
                    </>
                ) : (
                    <>
                        <span />
                        <span />
                    </>
                )}
            </li>
        </>
    );
};

export default PageElem;
