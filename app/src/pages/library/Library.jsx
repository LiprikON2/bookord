import React from "react";
import { Space, Title } from "@mantine/core";

import LibraryList from "./LibraryList";

const Library = () => {
    return (
        <>
            <section className="section">
                <Title order={1}>Library</Title>
                <Space h="md" />

                <LibraryList />
            </section>
        </>
    );
};

export default Library;
