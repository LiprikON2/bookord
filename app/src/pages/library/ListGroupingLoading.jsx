import React from "react";
import { Text } from "@mantine/core";
import LibraryListCard from "./LibraryListCard";

export const skeletonFile = {
    isSkeleton: true,
    info: { title: "" },
};

const ListGroupingLoading = ({ skeletontFileCount }) => {
    return (
        <>
            {skeletontFileCount !== 0 && (
                <>
                    <Text size="lg">Loading...</Text>
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
