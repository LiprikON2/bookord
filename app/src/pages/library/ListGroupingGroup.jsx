import React from "react";
import { Carousel } from "@mantine/carousel";

// @ts-ignore
import ROUTES from "Constants/routes";
import Link from "components/Link";
import LibraryListCard from "./LibraryListCard";
import ListGroupingLoading from "./ListGroupingLoading";
import "./ListGroupingGroup.css";
import TitleWithIcon from "components/TitleWithIcon";

const groupingReducers = {
    "Author": (groups, file) => {
        const { author } = file.info;
        if (!groups[author]) groups[author] = [];
        groups[author].push(file);
        return groups;
    },
    "Date Added": (groups, file, index) => {
        // new Date().toISOString().slice(0, 10);

        const { dateAdded: dateAddedString } = file;

        const diff = Math.abs(new Date().getTime() - new Date(dateAddedString).getTime());
        // const diffDays = Math.ceil(diff / (1000 * 3600 * 24)) - 1;
        const diffDays = index;

        let daysAgoString;
        if (diffDays <= 1) {
            daysAgoString = "Today";
        } else if (diffDays <= 7) {
            daysAgoString = "Last week";
        } else if (diffDays <= 30) {
            daysAgoString = "Earlier this month";
        } else if (diffDays <= 60) {
            daysAgoString = "Last month";
        } else if (diffDays <= 365) {
            daysAgoString = "Earlier this year";
        } else {
            daysAgoString = "A long time ago";
        }

        if (!groups[daysAgoString]) groups[daysAgoString] = [];
        groups[daysAgoString].push(file);
        return groups;
    },
};

const ListGroupingGroup = ({ groupBy, files, skeletontFileCount }) => {
    return (
        <>
            <ListGroupingLoading skeletontFileCount={skeletontFileCount} />
            {!!files.length &&
                groupingReducers[groupBy] &&
                Object.entries(files.reduce(groupingReducers[groupBy], [])).map(
                    ([group, files]) => {
                        return (
                            <React.Fragment key={group}>
                                <div className="limit-width">
                                    <TitleWithIcon
                                        mb={null}
                                        className="carousel-title"
                                        order={2}>
                                        {group}
                                    </TitleWithIcon>
                                </div>

                                <Carousel
                                    slideSize="20%"
                                    slideGap="xl"
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
                            </React.Fragment>
                        );
                    }
                )}
        </>
    );
};

export default ListGroupingGroup;
