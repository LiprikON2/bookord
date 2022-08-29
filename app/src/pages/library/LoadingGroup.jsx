import React, { useContext } from "react";

import LibraryListCard from "./LibraryListCard";
import Spinner from "components/Spinner";
import { Accordion } from "@mantine/core";
import { AppContext } from "Core/Routes";
import GroupTitle from "./GroupTitle";

export const skeletonFile = {
    isSkeleton: true,
    info: { title: "" },
};

const LoadingGroup = () => {
    const { skeletontFileCount } = useContext(AppContext);

    if (skeletontFileCount !== 0) {
        return (
            <Accordion.Item value={"Loading"}>
                <Accordion.Control style={{ paddingInline: 0 }}>
                    <GroupTitle icon={<Spinner size="2rem" />}>Loading...</GroupTitle>
                </Accordion.Control>
                <Accordion.Panel>
                    <div className="card-list limit-width" role="list">
                        {[...Array(skeletontFileCount)].map((e, index) => (
                            <div role="listitem" key={"skeleton" + index}>
                                <LibraryListCard file={skeletonFile} />
                            </div>
                        ))}
                    </div>
                </Accordion.Panel>
            </Accordion.Item>
        );
    } else {
        return null;
    }
};

export default LoadingGroup;
