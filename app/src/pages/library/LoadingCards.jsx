import React, { useContext } from "react";

import LibraryListCard from "./LibraryListCard";
import { AppContext } from "Core/Routes";
import AnimateMap from "components/AnimateMap";

export const skeletonFile = {
    isSkeleton: true,
    info: { title: "" },
};

const LoadingCards = ({ active = true, innerRef = undefined }) => {
    const { skeletontFileCount } = useContext(AppContext);

    if (active && skeletontFileCount !== 0) {
        return (
            <>
                {[...Array(skeletontFileCount)].map((e, index) => (
                    <LibraryListCard
                        file={skeletonFile}
                        withoutLink
                        key={"skeleton" + index}
                        innerRef={innerRef}
                    />
                ))}
            </>
        );
    } else {
        return null;
    }
};

export default LoadingCards;
