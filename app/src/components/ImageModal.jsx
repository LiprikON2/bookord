import React, { useEffect, useRef } from "react";
import { useHotkeys } from "@mantine/hooks";

import Button from "components/Button";
import "./ImageModal.css";

const ImageModal = ({ src, setSrc, toggle = true, showButton = true }) => {
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

    useHotkeys([["Escape", closeModal]]);
    return (
        <>
            <div ref={modalRef} className="modal">
                <div className="modal-background" />
                <div className="modal-content">
                    <p className="image">
                        <img src={src} alt="" />
                    </p>
                </div>
                {showButton && (
                    <Button
                        className="modal-close is-large"
                        aria-label="close"
                        style={{ padding: 0 }}
                        onClick={closeModal}></Button>
                )}
            </div>
        </>
    );
};
export default ImageModal;
