import React, { useRef, useEffect } from "react";

import Button from "components/Button";

import "./Dropdown.css";

const Dropdown = ({ children, className, ...rest }) => {
    const dropdownRef = useRef(null);

    useEffect(() => {
        return function cleanup() {
            document.body.removeEventListener("click", closeDropdown);
        };
    }, []);

    const closeDropdown = (e) => {
        if (dropdownRef.current) {
            const isMenu = dropdownRef.current.contains(e.target);
            if (!isMenu) {
                dropdownRef.current.classList.remove("is-active");
                document.body.removeEventListener("click", closeDropdown);
            }
        }
    };

    const openDropdown = (e) => {
        e.preventDefault();

        dropdownRef.current.classList.toggle("is-active");
        document.body.addEventListener("click", closeDropdown);
    };

    return (
        <>
            <div
                className={className ? className : "dropdown is-up is-right"}
                ref={dropdownRef}
                {...rest}>
                <div className="dropdown-trigger">
                    <Button
                        aria-haspopup="true"
                        aria-controls="dropdown-menu-options"
                        onClick={openDropdown}>
                        <span>☰</span>
                    </Button>
                </div>
                <div
                    className="dropdown-menu"
                    id="dropdown-menu-options"
                    role="menu">
                    <div className="dropdown-content">
                        {children.map((child, index) => {
                            if (!child.props.divider) {
                                return (
                                    <div key={index} className="dropdown-item">
                                        {child}
                                    </div>
                                );
                            } else {
                                return (
                                    <>
                                        <hr
                                            key={"divider" + index}
                                            className="dropdown-divider"
                                        />
                                        <div
                                            key={index}
                                            className="dropdown-item">
                                            {child}
                                        </div>
                                    </>
                                );
                            }
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dropdown;
