import React from "react";
import { Text } from "@mantine/core";
import { Carousel } from "@mantine/carousel";

// @ts-ignore
import ROUTES from "Constants/routes";
import Link from "components/Link";
import LibraryListCard from "./LibraryListCard";
import ListGroupingLoading from "./ListGroupingLoading";
import "./ListGroupingGroup.css";

const groupingReducers = {
    "Author": (groups, file) => {
        const { author } = file.info;
        if (!groups[author]) groups[author] = [];
        groups[author].push(file);
        return groups;
    },
    "Date Added": (groups, file) => {
        const { dateAdded } = file;
        if (!groups[dateAdded]) groups[dateAdded] = [];
        groups[dateAdded].push(file);
        return groups;
    },
};

const ListGroupingGroup = ({ groupBy, files, skeletontFileCount }) => {
    return (
        <>
            <ListGroupingLoading skeletontFileCount={skeletontFileCount} />
            {files.length &&
                groupingReducers[groupBy] &&
                Object.entries(files.reduce(groupingReducers[groupBy], [])).map(
                    ([group, files]) => {
                        return (
                            <React.Fragment key={group}>
                                <Text size="lg">{group}</Text>
                                <Carousel
                                    slideSize="20%"
                                    slideGap="xl"
                                    loop
                                    align="center"
                                    slidesToScroll={1}>
                                    {files.map((file) => {
                                        const toLocation = {
                                            pathname: ROUTES.READ,
                                            state: {
                                                bookFile: file,
                                            },
                                        };
                                        return (
                                            <Carousel.Slide key={file.name}>
                                                <Link
                                                    to={toLocation}
                                                    className=""
                                                    role="listitem">
                                                    <LibraryListCard
                                                        file={file}
                                                        to={toLocation}
                                                    />
                                                </Link>
                                            </Carousel.Slide>
                                        );
                                    })}
                                </Carousel>
                                {/* <div className="card-list" role="list">
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
                            </div> */}
                            </React.Fragment>
                        );
                    }
                )}
        </>
    );
};

export default ListGroupingGroup;
