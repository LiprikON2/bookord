import React from "react";

const LibraryList = ({ files, setFiles }) => {
    const handleDelete = (file) => {
        window.api.send("app:on-file-delete", file);
    };

    return (
        <>
            <section className="section">
                <ul>
                    {files.map((file) => (
                        <li key={file.path}>
                            <p>
                                {file.name} | {file.path}
                            </p>
                            <button
                                role="button"
                                onClick={() => handleDelete(file)}>
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </section>
        </>
    );
};

export default LibraryList;
