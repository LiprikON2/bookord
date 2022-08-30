import React, { useContext, useEffect } from "react";
import { useListState } from "@mantine/hooks";
import { Accordion, Group } from "@mantine/core";
import { ChevronDown } from "tabler-icons-react";

import LibraryListCard from "./LibraryListCard";
import { groupingReducers } from "Utils/bookGroup";
import GroupTitle from "./GroupTitle";
import LoadingCards from "./LoadingCards";
import AnimateMap from "components/AnimateMap";
import "./LibraryListGroups.css";
import Spinner from "components/Spinner";
import { AppContext } from "Core/Routes";

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

    const { skeletontFileCount } = useContext(AppContext);

    return (
        <>
            <Accordion
                value={groups}
                onChange={setGroups.setState}
                className="grouping-accordion"
                transitionDuration={100}
                chevron={null}
                multiple>
                <AnimateMap>
                    {grouping !== "None" && skeletontFileCount !== 0 && (
                        // @ts-ignore
                        <AnimateMap.ItemWithRef
                            component={Accordion.Item}
                            key={"Loading"}
                            value={"Loading"}>
                            <>
                                <Accordion.Control style={{ paddingInline: 0 }}>
                                    <GroupTitle icon={<Spinner size="2rem" />}>
                                        Loading...
                                    </GroupTitle>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <div className="card-list limit-width" role="list">
                                        <LoadingCards />
                                    </div>
                                </Accordion.Panel>
                            </>
                        </AnimateMap.ItemWithRef>
                    )}

                    {groupedFiles.map(([group, files]) => (
                        // @ts-ignore
                        <AnimateMap.ItemWithRef
                            component={Accordion.Item}
                            key={group}
                            value={group}>
                            <>
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
                                                <AnimateMap.ItemWithInnerRef
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
                            </>
                        </AnimateMap.ItemWithRef>
                    ))}
                </AnimateMap>
            </Accordion>
        </>
    );
};

export default LibraryListGroups;
