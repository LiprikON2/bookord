import React, { useEffect } from "react";
import { useListState } from "@mantine/hooks";
import { Accordion } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { ChevronDown } from "tabler-icons-react";

// @ts-ignore
import ROUTES from "Constants/routes";
import Link from "components/Link";
import LibraryListCard from "./LibraryListCard";
import ListGroupingLoading from "./ListGroupingLoading";
import TitleWithIcon from "components/TitleWithIcon";
import "./ListGroupingGroup.css";

const groupingReducers = {
    "Author": (groups, file) => {
        const { author } = file.info;
        if (!groups[author]) groups[author] = [];
        groups[author].push(file);
        return groups;
    },
    "Date Added": (groups, file, index) => {
        const { dateAdded: dateAddedString } = file;

        const diff = Math.abs(new Date().getTime() - new Date(dateAddedString).getTime());
        // new Date().toISOString().slice(0, 10);
        // const diffDays = Math.ceil(diff / (1000 * 3600 * 24)) - 1; // TODO uncomment
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

const ListGroupingGroup = ({ files, skeletontFileCount, grouping, sort }) => {
    const isAValidGroup = groupingReducers[grouping];
    const canGroup = !!files.length;

    const groupedFiles =
        canGroup && isAValidGroup
            ? Object.entries(files.reduce(groupingReducers[grouping], []))
            : [];

    // Make accordio open by default
    const [groups, setGroups] = useListState([]);
    const allGroups = groupedFiles.map(([group]) => group);
    useEffect(() => {
        if (groupedFiles.length) {
            setGroups.setState(allGroups);
        }
    }, [skeletontFileCount]);

    return (
        <>
            <ListGroupingLoading skeletontFileCount={skeletontFileCount} />
            <Accordion
                value={groups}
                onChange={setGroups.setState}
                className="grouping-accordion"
                chevron={null}
                multiple={true}>
                {groupedFiles.map(([group, files]) => {
                    // setGroups.append(group);

                    return (
                        <Accordion.Item key={group} value={group}>
                            <Accordion.Control style={{ paddingInline: 0 }}>
                                <div className="limit-width">
                                    <TitleWithIcon
                                        mb={null}
                                        className="carousel-title"
                                        rightIcon={<ChevronDown size={38} />}
                                        order={2}>
                                        {group}
                                    </TitleWithIcon>
                                </div>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Carousel
                                    slideSize="20%"
                                    slideGap="xl"
                                    align="center"
                                    slidesToScroll={1}>
                                    {files.sort(sort ?? (() => {})).map((file) => {
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
                            </Accordion.Panel>
                        </Accordion.Item>
                    );
                })}
            </Accordion>
        </>
    );
};

export default ListGroupingGroup;
