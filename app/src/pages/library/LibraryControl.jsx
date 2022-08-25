import React from "react";
import { Group, Stack, Text } from "@mantine/core";

import SegmentedControl from "components/SegmentedControl";

const GroupingControl = ({
    label,
    labelIcon: LabelIcon,
    data,
    value,
    onChange,
    right = undefined,
    subRight = undefined,
}) => {
    return (
        <Group
            className="card-control"
            position="apart"
            style={{ alignItems: "flex-end" }}
            mb="lg">
            <Stack style={{ gap: "0.5rem" }}>
                <Group style={{ gap: "0.25rem", color: "var(--clr-primary-150)" }}>
                    <LabelIcon size={24} />

                    <Text size="md" weight={500}>
                        {label}
                    </Text>
                </Group>

                <Group spacing="xs">
                    <SegmentedControl value={value} onChange={onChange} data={data} />
                    {subRight && subRight}
                </Group>
            </Stack>
            {right && right}
        </Group>
    );
};

export default GroupingControl;
