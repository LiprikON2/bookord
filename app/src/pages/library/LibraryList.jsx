import React, { useState } from "react";

import Link from "components/Link";
import Spinner from "components/Spinner";
import ImageModal from "components/ImageModal";

import LibraryListCard from "./LibraryListCard";
import LibraryListUpload from "./LibraryListUpload";
import ROUTES from "Constants/routes";
import "./LibraryList.css";

import dropzoneImg from "resources/upload-accent.svg";

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
    const [showDropzone, setShowDropzone] = useState(false);

    // TODO handle clicking on deleted books
    return (
        <>
            <section className="section library-list" id="uploader">
                <ImageModal
                    toggle={showDropzone}
                    src={dropzoneImg}
                    showButton={false}></ImageModal>

                <LibraryListUpload
                    setFiles={setFiles}
                    setLoading={setLoading}
                    setSkeletontFileCount={setSkeletontFileCount}
                    setShowDropzone={setShowDropzone}
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
