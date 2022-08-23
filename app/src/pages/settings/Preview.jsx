import React from "react";

import LibraryListCard from "Pages/library/LibraryListCard";
import { Stack, Text } from "@mantine/core";
import "./Preview.css";

const PreviewComponents = {
    LibraryListCard: (
        <LibraryListCard
            style={{
                maxWidth: "9rem",
                pointerEvents: "none",
                marginInline: "auto",
            }}
            file={{
                isSkeleton: false,
                info: { title: "Sample Book" },
            }}
        />
    ),
};

const Preview = ({ style = undefined, component }) => {
    const PreviewComponent = PreviewComponents[component];
    return (
        <>
            <Stack className="preview-container" style={style}>
                <Text weight={500} size="sm">
                    Preview:
                </Text>

                {PreviewComponent}
            </Stack>
        </>
    );
};

export default Preview;
