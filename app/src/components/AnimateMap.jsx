import React, { forwardRef } from "react";
import FlipMove from "react-flip-move";

// https://github.com/joshwcomeau/react-flip-move
const AnimateMap = ({ typeName = null, children, ...rest }) => {
    return (
        <>
            {(() => (
                // @ts-ignore
                <FlipMove typeName={typeName} {...rest}>
                    {children}
                </FlipMove>
            ))()}
        </>
    );
};
// @ts-ignore
const ItemWithRef = forwardRef(({ component: Component, ...rest }, ref) => {
    return <Component ref={ref} {...rest} />;
});
// @ts-ignore
const ItemWithInnerRef = forwardRef(({ component: Component, ...rest }, ref) => {
    return <Component innerRef={ref} {...rest} />;
});

AnimateMap.ItemWithRef = ItemWithRef;
AnimateMap.ItemWithInnerRef = ItemWithInnerRef;

export default AnimateMap;
