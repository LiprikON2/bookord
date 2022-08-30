import React, { forwardRef, useEffect } from "react";
import { useListState } from "@mantine/hooks";
import { Accordion, Group } from "@mantine/core";
import { ChevronDown } from "tabler-icons-react";

// @ts-ignore
import ROUTES from "Constants/routes";
import Link from "components/Link";
import LibraryListCard from "./LibraryListCard";
import LoadingGroup from "./LoadingGroup";
import { groupingReducers } from "Utils/bookGroup";
import "./LibraryListGroups.css";
import GroupTitle from "./GroupTitle";
import FlipMove from "react-flip-move";
import LoadingCards from "./LoadingCards";

// @ts-ignore
const Card = forwardRef(({ file }, ref) => {
    const toLocation = {
        pathname: ROUTES.READ,
        state: {
            bookFile: {
                ...file,
            },
        },
    };
    return (
        <Link innerRef={ref} key={file.name} to={toLocation} className="" role="listitem">
            <LibraryListCard file={file} to={toLocation} />
        </Link>
    );
});

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
                                {(() => (
                                    // @ts-ignore
                                    <FlipMove typeName={null}>
                                        {files.map((file) => (
                                            // @ts-ignore
                                            <Card key={file.name} file={file} />
                                        ))}
                                    </FlipMove>
                                ))()}
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
