import React from "react";

import TitleWithIcon from "components/TitleWithIcon";
import LibraryListCard from "./LibraryListCard";
import Spinner from "components/Spinner";
import { Group } from "@mantine/core";

export const skeletonFile = {
    isSkeleton: true,
    info: { title: "" },
};

const ListGroupingLoading = ({ skeletontFileCount }) => {
    return (
        <>
            {skeletontFileCount !== 0 && (
                <>
                    <div className="limit-width">
                        <TitleWithIcon mb={null} className="carousel-title" order={2}>
                            <Group>
                                Loading... <Spinner size="2rem" />
                            </Group>
                        </TitleWithIcon>
                    </div>

                    <div className="card-list" role="list">
                        {[...Array(skeletontFileCount)].map((e, index) => (
                            <div role="listitem" key={"skeleton" + index}>
                                <LibraryListCard file={skeletonFile} />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </>
    );
};

export default ListGroupingLoading;
