import React from "react";
import { Text } from "@mantine/core";

// @ts-ignore
import ROUTES from "Constants/routes";
import Link from "components/Link";
import LibraryListCard from "./LibraryListCard";
import ListGroupingLoading from "./ListGroupingLoading";

const ListGroupingAuthor = ({ files, skeletontFileCount }) => {
    return (
        <>
            <ListGroupingLoading skeletontFileCount={skeletontFileCount} />
            {files.length &&
                Object.entries(
                    files.reduce((groups, file) => {
                        const { author } = file.info;
                        if (!groups[author]) groups[author] = [];
                        groups[author].push(file);
                        return groups;
                    }, [])
                ).map(([group, files]) => {
                    return (
                        <React.Fragment key={group}>
                            <Text size="lg">{group}</Text>
                            <div className="card-list" role="list" key={group}>
                                {files.map((file) => {
                                    const toLocation = {
                                        pathname: ROUTES.READ,
                                        state: {
                                            bookFile: file,
                                        },
                                    };
                                    return (
                                        <Link
                                            to={toLocation}
                                            className=""
                                            role="listitem"
                                            key={file.name}>
                                            <LibraryListCard
                                                file={file}
                                                to={toLocation}
                                            />
                                        </Link>
                                    );
                                })}
                            </div>
                        </React.Fragment>
                    );
                })}
        </>
    );
};

export default ListGroupingAuthor;
