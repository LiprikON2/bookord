import React from "react";
import { Link, useParams } from "react-router-dom";

import ROUTES from "Constants/routes";

const Read = () => {
    const { id = 0 } = useParams();

    return (
        <>
            <h1>Lorem ipsum dolor sit amet.</h1>
            <div>{id}</div>
            <p>
                Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                Corporis omnis rem fugiat totam nesciunt accusamus amet minus?
                Sed, sapiente placeat soluta odit optio non at ipsam repellendus
                quaerat nostrum autem aperiam voluptatem vitae repellat labore
                impedit ea! Quod eum, unde aperiam quia, aliquam atque nam
                exercitationem enim sapiente velit ratione.
            </p>
            <Link to={ROUTES.LIBRARY}>Home</Link>
        </>
    );
};

export default Read;
