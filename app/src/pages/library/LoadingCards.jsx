import React, { useContext } from "react";

import LibraryListCard from "./LibraryListCard";
import { AppContext } from "Core/Routes";

export const skeletonFile = {
    isSkeleton: true,
    info: { title: "" },
};

const LoadingCards = ({ active = true }) => {
    const { skeletontFileCount } = useContext(AppContext);

    if (active && skeletontFileCount !== 0) {
        return (
            <>
                {[...Array(skeletontFileCount)].map((e, index) => (
                    <div role="listitem" key={"skeleton" + index}>
                        <LibraryListCard file={skeletonFile} withoutLink />
                    </div>
                ))}
            </>
        );
    } else {
        return null;
    }
};

export default LoadingCards;
