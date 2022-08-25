import React from "react";
import { Box, Center, Group, Stack, Text } from "@mantine/core";
import {
    AlphabetLatin,
    Calendar,
    CalendarStats,
    Category,
    Clock,
    FilePlus,
    MasksTheater,
    SortAscending2,
    User,
    X,
} from "tabler-icons-react";

import SegmentedControl from "components/SegmentedControl";
import Button from "components/Button";

const GroupingControl = ({ handleUpload, grouping, setGrouping }) => {
    return (
        <Group
            className="card-control"
            position="apart"
            style={{ alignItems: "flex-end" }}>
            <Stack style={{ gap: "0.5rem" }}>
                <Group style={{ gap: "0.25rem", color: "var(--clr-primary-150)" }}>
                    <Category size={24} />

                    <Text size="md" weight={500}>
                        Group by
                    </Text>
                </Group>

                <Group spacing="xs">
                    <SegmentedControl
                        value={grouping}
                        onChange={setGrouping}
                        data={[
                            {
                                value: "None",
                                label: (
                                    <Center>
                                        <X size={16} />
                                        <Box ml={10}>None</Box>
                                    </Center>
                                ),
                            },
                            {
                                value: "Recent",
                                label: (
                                    <Center>
                                        <Clock size={16} />
                                        <Box ml={10}>Recent</Box>
                                    </Center>
                                ),
                            },
                            {
                                value: "Date Added",
                                label: (
                                    <Center>
                                        <CalendarStats size={16} />
                                        <Box ml={10}>Date Added</Box>
                                    </Center>
                                ),
                            },
                            // {
                            //     value: "Date Published",
                            //     label: (
                            //         <Center>
                            //             <Calendar size={16} />
                            //             <Box ml={10}>Date Published</Box>
                            //         </Center>
                            //     ),
                            // },
                            {
                                value: "Author",
                                label: (
                                    <Center>
                                        <User size={16} />
                                        <Box ml={10}>Author</Box>
                                    </Center>
                                ),
                            },
                            // {
                            //     value: "Alphabet",
                            //     label: (
                            //         <Center>
                            //             <AlphabetLatin size={16} />
                            //             <Box ml={10}>Alphabet</Box>
                            //         </Center>
                            //     ),
                            // },
                            {
                                value: "Genre",
                                label: (
                                    <Center>
                                        <MasksTheater size={16} />
                                        <Box ml={10}>Genre</Box>
                                    </Center>
                                ),
                            },
                        ]}
                    />
                    {/* TODO */}
                    <Button isIconOnly={true} isGhost={true}>
                        <SortAscending2 />
                    </Button>
                </Group>
            </Stack>
            <Button
                leftIcon={<FilePlus />}
                onClick={handleUpload}
                style={{ height: "2.625rem" }}>
                Add
            </Button>
        </Group>
    );
};

export default GroupingControl;
