import React, { useContext } from "react";

import Spinner from "components/Spinner";
import { Accordion } from "@mantine/core";
import { AppContext } from "Core/Routes";
import GroupTitle from "./GroupTitle";
import LoadingCards from "./LoadingCards";

const LoadingGroup = ({ active = true }) => {
    const { skeletontFileCount } = useContext(AppContext);

    if (active && skeletontFileCount !== 0) {
        return (
            <Accordion.Item value={"Loading"}>
                <Accordion.Control style={{ paddingInline: 0 }}>
                    <GroupTitle icon={<Spinner size="2rem" />}>Loading...</GroupTitle>
                </Accordion.Control>
                <Accordion.Panel>
                    <div className="card-list limit-width" role="list">
                        <LoadingCards />
                    </div>
                </Accordion.Panel>
            </Accordion.Item>
        );
    } else {
        return null;
    }
};

export default LoadingGroup;
