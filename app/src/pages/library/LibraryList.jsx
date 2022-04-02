import React from "react";

import Link from "components/Link";
import LibraryListCard from "./LibraryListCard";
import LibraryListUpload from "./LibraryListUpload";
import ROUTES from "Constants/routes";
import "./LibraryList.css";

import Spinner from "components/Spinner";

const LibraryList = ({
    files,
    setFiles,
    skeletontFileCount,
    setSkeletontFileCount,
    loading,
    setLoading,
}) => {
    const skeletonFile = {
        isSkeleton: true,
        info: { title: "" },
    };
    // TODO handle clicking on deleted books
    // TODO add drag and drop overlay
    return (
        <>
            <section className="section library-list" id="uploader">
                <LibraryListUpload
                    setFiles={setFiles}
                    setLoading={setLoading}
                    setSkeletontFileCount={setSkeletontFileCount}
                />

                {!loading ? (
                    <div className="card-list" role="list">
                        {files.map((file, index) => (
                            <Link
                                to={{
                                    pathname: ROUTES.READ,
                                    state: {
                                        book: file,
                                    },
                                }}
                                className=""
                                role="listitem"
                                key={file.path}>
                                <LibraryListCard file={file}></LibraryListCard>
                            </Link>
                        ))}
                        {[...Array(skeletontFileCount)].map((e, index) => (
                            <div role="listitem" key={"skeleton" + index}>
                                <LibraryListCard file={skeletonFile}></LibraryListCard>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Spinner></Spinner>
                )}
            </section>
        </>
    );
};

export default LibraryList;
