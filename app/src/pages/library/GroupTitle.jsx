import { Center, UnstyledButton } from "@mantine/core";
import TitleWithIcon from "components/TitleWithIcon";
import React from "react";

const GroupTitle = ({ children, icon: Icon, ...rest }) => {
    return (
        <div className="limit-width">
            <TitleWithIcon
                mb={null}
                className="accordion-item-title"
                style={{
                    alignItems: "center",
                }}
                rightIcon={
                    <UnstyledButton>
                        <Center>{Icon}</Center>
                    </UnstyledButton>
                }
                order={2}
                {...rest}>
                {children}
            </TitleWithIcon>
        </div>
    );
};

export default GroupTitle;
