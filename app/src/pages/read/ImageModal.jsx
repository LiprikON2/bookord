import React, { useEffect, useRef } from "react";

import Button from "components/Button";
import "./ImageModal.css";

const ImageModal = ({ src, setSrc }) => {
    const modalRef = useRef(null);

    useEffect(() => {
        if (src) {
            modalRef.current.classList.add("is-active");
        }
    }, [src]);
    const closeModal = () => {
        modalRef.current.classList.remove("is-active");
        setSrc(null);
    };
    return (
        <>
            <div ref={modalRef} className="modal">
                <div className="modal-background"></div>
                <div className="modal-content">
                    <p className="image">
                        <img src={src} alt="" />
                    </p>
                </div>
                <Button
                    className="modal-close is-large"
                    aria-label="close"
                    onClick={closeModal}></Button>
            </div>
        </>
    );
};
export default ImageModal;
