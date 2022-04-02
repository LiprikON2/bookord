import React, { useState } from "react";

import Link from "components/Link";
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

                <div className="card-list" role="list">
                    {files.length !== 0 || skeletontFileCount !== 0 ? (
                        <>
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
                                    <LibraryListCard
                                        file={skeletonFile}></LibraryListCard>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="no-cards">
                            <img src={dropzoneImg} alt="" />
                            <span>Add some books =)</span>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default LibraryList;
