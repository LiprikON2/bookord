import React, { useEffect } from "react";
import { useListState } from "@mantine/hooks";
import { Accordion, Group } from "@mantine/core";
import { ChevronDown } from "tabler-icons-react";

import LibraryListCard from "./LibraryListCard";
import LoadingGroup from "./LoadingGroup";
import { groupingReducers } from "Utils/bookGroup";
import GroupTitle from "./GroupTitle";
import LoadingCards from "./LoadingCards";
import AnimateMap from "components/AnimateMap";
import "./LibraryListGroups.css";

const LibraryListGroups = ({ files, grouping }) => {
    const isAValidGroup = groupingReducers[grouping];
    const canGroup = !!files.length;

    const groupedFiles =
        canGroup && isAValidGroup
            ? Object.entries(files.reduce(groupingReducers[grouping], [])).sort(
                  ([a], [b]) => a.localeCompare(b)
              )
            : [];

    // Make accordion open by default
    const [groups, setGroups] = useListState(["Loading", "None"]);
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
                <LoadingGroup active={grouping !== "None"} />
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
                                <Group>{`${group} – (${files.length})`}</Group>
                            </GroupTitle>
                        </Accordion.Control>
                        <Accordion.Panel>
                            <div
                                className="card-list card-group-list limit-width"
                                role="list">
                                <AnimateMap>
                                    {files.map((file) => (
                                        <AnimateMap.Item
                                            key={file.name}
                                            // @ts-ignore
                                            file={file}
                                            component={LibraryListCard}
                                        />
                                    ))}
                                </AnimateMap>
                                <LoadingCards active={grouping === "None"} />
                            </div>
                        </Accordion.Panel>
                    </Accordion.Item>
                ))}
            </Accordion>
        </>
    );
};

export default LibraryListGroups;
