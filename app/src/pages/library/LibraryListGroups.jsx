import React, { useEffect } from "react";
import { useListState } from "@mantine/hooks";
import { Accordion, Group } from "@mantine/core";
import { ChevronDown, Number1 } from "tabler-icons-react";

// @ts-ignore
import ROUTES from "Constants/routes";
import Link from "components/Link";
import LibraryListCard from "./LibraryListCard";
import LoadingGroup from "./LoadingGroup";
import { groupingReducers } from "Utils/bookGroup";
import "./LibraryListGroups.css";
import GroupTitle from "./GroupTitle";

const LibraryListGroups = ({ files, grouping }) => {
    const isAValidGroup = groupingReducers[grouping];
    const canGroup = !!files.length;

    const groupedFiles =
        canGroup && isAValidGroup
            ? Object.entries(files.reduce(groupingReducers[grouping], []))
            : [];

    // Make accordion open by default
    const [groups, setGroups] = useListState(["Loading"]);
    const allGroups = groupedFiles.map(([group]) => group);
    useEffect(() => {
        if (groupedFiles.length) {
            setGroups.setState(allGroups);
        }
    }, [grouping]);

    return (
        <>
            <Accordion
                value={groups}
                onChange={setGroups.setState}
                className="grouping-accordion"
                transitionDuration={100}
                multiple={true}
                chevron={null}>
                <LoadingGroup />
                {groupedFiles.map(([group, files]) => (
                    <Accordion.Item key={group} value={group}>
                        <Accordion.Control style={{ paddingInline: 0 }}>
                            <GroupTitle
                                icon={
                                    <ChevronDown
                                        className="accordion-chevron"
                                        size={32}
                                    />
                                }>
                                <Group>{`${group} - (${files.length})`}</Group>
                            </GroupTitle>
                        </Accordion.Control>
                        <Accordion.Panel>
                            <div
                                className="card-list card-group-list limit-width"
                                role="list">
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
                                        <Link
                                            key={file.name}
                                            to={toLocation}
                                            className=""
                                            role="listitem">
                                            <LibraryListCard
                                                file={file}
                                                to={toLocation}
                                            />
                                        </Link>
                                    );
                                })}
                            </div>
                        </Accordion.Panel>
                    </Accordion.Item>
                ))}
            </Accordion>
        </>
    );
};

export default LibraryListGroups;
