import React, { useEffect, useRef } from "react";
import { useHotkeys } from "@mantine/hooks";

import Button from "components/Button";
import "./ImageModal.css";
import { downloadImage } from "Utils/downloadImage";

const ImageModal = ({ src, setSrc, toggle = true, showButton = true, name = "" }) => {
    const modalRef = useRef(null);

    useEffect(() => {
        if (src && toggle) {
            openModal();
        } else {
            closeModal();
        }
    }, [src, toggle]);
    const openModal = () => {
        modalRef.current.classList.add("is-active");
    };
    const closeModal = () => {
        modalRef.current.classList.remove("is-active");
        if (setSrc) setSrc(null);
    };

    const imageName = name && name.length ? name + " ― illustration" : "Illustration";
    const handleSaveImage = () => {
        downloadImage(src, imageName);
    };

    useHotkeys([
        ["Escape", closeModal],
        ["Ctrl + s", handleSaveImage],
    ]);
    return (
        <>
            <div ref={modalRef} className="modal">
                <div className="modal-background" />
                <div className="modal-content">
                    <p className="modal-image">
                        <img src={src} alt={imageName} />
                        <Button
                            className="modal-save"
                            compact
                            isGhost={true}
                            onClick={handleSaveImage}>
                            Save image
                        </Button>
                    </p>
                </div>
                {showButton && (
                    <Button
                        className="modal-close is-large"
                        aria-label="close"
                        isGhost={true}
                        style={{ padding: 0 }}
                        onClick={closeModal}></Button>
                )}
            </div>
        </>
    );
};
export default ImageModal;
