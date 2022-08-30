import React, { forwardRef } from "react";
import FlipMove from "react-flip-move";

const AnimateMap = ({ typeName = null, children }) => {
    return (
        <>
            {(() => (
                // @ts-ignore
                <FlipMove typeName={typeName}>{children}</FlipMove>
            ))()}
        </>
    );
};
// @ts-ignore
const ItemWithRef = forwardRef(({ component: Component, ...rest }, ref) => {
    return <Component innerRef={ref} {...rest} />;
});

AnimateMap.Item = ItemWithRef;

export default AnimateMap;
