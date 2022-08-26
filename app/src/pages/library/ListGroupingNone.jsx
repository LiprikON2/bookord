import React from "react";

// @ts-ignore
import ROUTES from "Constants/routes";
import Link from "components/Link";
import LibraryListCard from "./LibraryListCard";
import { skeletonFile } from "./ListGroupingLoading";
import "./ListGroupingNone.css";

const ListGroupingNone = ({ files, skeletontFileCount }) => {
    return (
        <div className="ungrouped">
            <div className="card-list limit-width" role="list">
                {files.map((file) => {
                    const toLocation = {
                        pathname: ROUTES.READ,
                        state: {
                            bookFile: file,
                        },
                    };
                    return (
                        <Link
                            to={toLocation}
                            className=""
                            role="listitem"
                            key={file.name}>
                            <LibraryListCard file={file} to={toLocation} />
                        </Link>
                    );
                })}
                {[...Array(skeletontFileCount)].map((e, index) => (
                    <div role="listitem" key={"skeleton" + index}>
                        <LibraryListCard file={skeletonFile} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ListGroupingNone;
