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
import { groupingReducers } from "Utils/bookGroup";
import "./ListGroupingGroup.css";

const ListGroupingGroup = ({ files, skeletontFileCount, grouping }) => {
    const isAValidGroup = groupingReducers[grouping];
    const canGroup = !!files.length;

    const groupedFiles =
        canGroup && isAValidGroup
            ? Object.entries(files.reduce(groupingReducers[grouping], []))
            : [];

    // Make accordion open by default
    const [groups, setGroups] = useListState([]);
    const allGroups = groupedFiles.map(([group]) => group);
    useEffect(() => {
        if (groupedFiles.length) {
            setGroups.setState(allGroups);
        }
    }, [grouping]);

    return (
        <>
            <ListGroupingLoading skeletontFileCount={skeletontFileCount} />
            <Accordion
                transitionDuration={0}
                value={groups}
                onChange={setGroups.setState}
                className="grouping-accordion"
                chevron={null}
                multiple={true}>
                {groupedFiles.map(([group, files]) => (
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
                                {files.map((file) => {
                                    const toLocation = {
                                        pathname: ROUTES.READ,
                                        state: {
                                            bookFile: {
                                                ...file,
                                            },
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
                ))}
            </Accordion>
        </>
    );
};

export default ListGroupingGroup;
