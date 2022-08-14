import React from "react";
import { Title } from "@mantine/core";

import LibraryList from "./LibraryList";
import "./Library.css";

const Library = () => {
    return (
        <>
            <section className="section">
                <Title order={1}>Library</Title>

                <LibraryList />
            </section>
        </>
    );
};

export default Library;
