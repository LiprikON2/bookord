import React from "react";

const LibraryList = ({ files, setFiles }) => {
    const fileNames = files.map((file) => file.name);
    return (
        <>
            <section className="section">
                <ul>
                    {files.map((file) => (
                        <li key={file.path}>
                            {file.name} | {file.path}
                        </li>
                    ))}
                </ul>
            </section>
        </>
    );
};

export default LibraryList;
