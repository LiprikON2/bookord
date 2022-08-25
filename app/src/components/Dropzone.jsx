import React from "react";

import { Group, Text, UnstyledButton } from "@mantine/core";
import { BookUpload, Book2, X } from "tabler-icons-react";
import { Dropzone as MantineDropzone } from "@mantine/dropzone";

// @ts-ignore
import MIME_TYPES from "Constants/mimeTypes";
import "./Dropzone.css";

const BookUploadIcon = ({ status, ...props }) => {
    if (status.accepted) {
        return <BookUpload {...props} />;
    }

    if (status.rejected) {
        return <X {...props} />;
    }

    return <Book2 {...props} />;
};

const DropzoneChildren = ({ status }) => {
    const getIconColor = (status) => {
        return status.accepted
            ? "var(--clr-accent-000)"
            : status.rejected
            ? "var(--clr-danger)"
            : "var(--clr-primary-100)";
    };

    return (
        <Group position="center" spacing="xl" style={{ minHeight: 220 }}>
            <BookUploadIcon
                status={status}
                style={{ color: getIconColor(status) }}
                size={80}
            />

            <div>
                <Text size="xl" inline>
                    Drag books here
                </Text>
                <Text size="sm" inline mt={7} style={{ color: "var(--clr-primary-200)" }}>
                    Attach as many files as you like
                </Text>
            </div>
        </Group>
    );
};

const DropzoneStatus = () => {
    return (
        <>
            <MantineDropzone.Accept>
                <DropzoneChildren status={{ accepted: true }} />
            </MantineDropzone.Accept>
            <MantineDropzone.Reject>
                <DropzoneChildren status={{ rejected: true }} />
            </MantineDropzone.Reject>
            <MantineDropzone.Idle>
                <DropzoneChildren status={{}} />
            </MantineDropzone.Idle>
        </>
    );
};

const Dropzone = ({
    onDrop,
    onClick = undefined,
    activateOnClick = undefined,
    onReject = undefined,
    accept = undefined,
    multiple = true,
    fullscreen = false,
    ...rest
}) => {
    return (
        <>
            <UnstyledButton onClick={onClick}>
                {!fullscreen ? (
                    <MantineDropzone
                        onDrop={onDrop}
                        onReject={onReject}
                        accept={accept ?? MIME_TYPES.EBOOK_MIME_TYPES}
                        multiple={multiple}
                        activateOnClick={activateOnClick ?? (onClick ? false : true)}
                        {...rest}>
                        <DropzoneStatus />
                    </MantineDropzone>
                ) : (
                    <MantineDropzone.FullScreen
                        onDrop={onDrop}
                        accept={accept ?? MIME_TYPES.EBOOK_MIME_TYPES}
                        multiple={multiple}
                        {...rest}>
                        <DropzoneStatus />
                    </MantineDropzone.FullScreen>
                )}
            </UnstyledButton>
        </>
    );
};

export default Dropzone;
