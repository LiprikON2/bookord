import React from "react";

import { Group, Text, useMantineTheme } from "@mantine/core";
import { BookUpload, Book2, X } from "tabler-icons-react";
import { Dropzone as MantineDropzone } from "@mantine/dropzone";

import MIME_TYPES from "Constants/mimeTypes";

const BookUploadIcon = ({ status, ...props }) => {
    if (status.accepted) {
        return <BookUpload {...props} />;
    }

    if (status.rejected) {
        return <X {...props} />;
    }

    return <Book2 {...props} />;
};

const DropzoneChildren = ({ status, theme }) => {
    const getIconColor = (status, theme) => {
        return status.accepted
            ? theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 4 : 6]
            : status.rejected
            ? theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]
            : theme.colorScheme === "dark"
            ? theme.colors.dark[0]
            : theme.colors.gray[7];
    };

    return (
        <Group
            position="center"
            spacing="xl"
            style={{ minHeight: 220, pointerEvents: "none" }}>
            <BookUploadIcon
                status={status}
                style={{ color: getIconColor(status, theme) }}
                size={80}
            />

            <div>
                <Text size="xl" inline>
                    Drag books here or click to select files
                </Text>
                <Text size="sm" color="dimmed" inline mt={7}>
                    Attach as many files as you like
                </Text>
            </div>
        </Group>
    );
};

const Dropzone = ({
    onDrop,
    onReject,
    accept,
    multiple,
    fullscreen = false,
    ...rest
}) => {
    const theme = useMantineTheme();

    return (
        <>
            {!fullscreen ? (
                <MantineDropzone
                    onDrop={onDrop ?? (() => {})}
                    onReject={onReject ?? (() => {})}
                    accept={accept ?? MIME_TYPES.EBOOK_MIME_TYPES}
                    multiple={multiple ?? true}
                    {...rest}>
                    <DropzoneChildren status={status} theme={theme} />
                </MantineDropzone>
            ) : (
                <MantineDropzone.FullScreen
                    onDrop={onDrop ?? (() => {})}
                    accept={accept ?? MIME_TYPES.EBOOK_MIME_TYPES}
                    multiple={multiple ?? true}
                    {...rest}>
                    <DropzoneChildren status={status} theme={theme} />
                </MantineDropzone.FullScreen>
            )}
        </>
    );
};

export default Dropzone;
