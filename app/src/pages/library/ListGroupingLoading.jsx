import React from "react";

import TitleWithIcon from "components/TitleWithIcon";
import LibraryListCard from "./LibraryListCard";
import Spinner from "components/Spinner";
import { Accordion, Group } from "@mantine/core";

export const skeletonFile = {
    isSkeleton: true,
    info: { title: "" },
};

const ListGroupingLoading = ({ skeletontFileCount }) => {
    return (
        <>
            {skeletontFileCount !== 0 && (
                <>
                    <div className="limit-width">
                        <TitleWithIcon mb={null} className="carousel-title" order={2}>
                            <Group>
                                Loading... <Spinner size="2rem" />
                            </Group>
                        </TitleWithIcon>
                    </div>
                    {/* <Accordion defaultValue="customization">
                        <Accordion.Item value="customization">
                            <Accordion.Control>Customization</Accordion.Control>
                            <Accordion.Panel>
                                Colors, fonts, shadows and many other parts are
                                customizable to fit your design needs
                            </Accordion.Panel>
                        </Accordion.Item>

                        <Accordion.Item value="flexibility">
                            <Accordion.Control>Flexibility</Accordion.Control>
                            <Accordion.Panel>
                                Configure components appearance and behavior with vast
                                amount of settings or overwrite any part of component
                                styles
                            </Accordion.Panel>
                        </Accordion.Item>

                        <Accordion.Item value="focus-ring">
                            <Accordion.Control>No annoying focus ring</Accordion.Control>
                            <Accordion.Panel>
                                With new :focus-visible pseudo-class focus ring appears
                                only when user navigates with keyboard
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion> */}

                    <div className="card-list" role="list">
                        {[...Array(skeletontFileCount)].map((e, index) => (
                            <div role="listitem" key={"skeleton" + index}>
                                <LibraryListCard file={skeletonFile} />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </>
    );
};

export default ListGroupingLoading;
