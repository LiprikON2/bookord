export const style = /*css*/ `
    :host {
        --book-component-width: 400px;
        --book-component-height: 600px;
        // --column-gap: 100px;
        --column-gap: 0px;

    }

    :any-link {
        color: var(--clr-link) !important;
    }
    :host {
        font-size: var(--fs-book-global) !important;
        font-family: var(--ff-book) !important;
    }
    p {
        font-size: var(--fs-book-paragraph) !important;
    }
    h1 {
        font-size: var(--fs-book-h1) !important;
    }
    h2 {
        font-size: var(--fs-book-h2) !important;
    }
    h3 {
        font-size: var(--fs-book-h3) !important;
    }
    h4 {
        font-size: var(--fs-book-h4) !important;
    }
    h5 {
        font-size: var(--fs-book-h5) !important;
    }
    h6 {
        font-size: var(--fs-book-h6) !important;
    }

    p, h1, h2, h3, h4, h5, h6 { 
        line-height: 1.2 !important;
    }

    .book-container {
        max-width: 30rem;
        height: 85vh;
        height: 80vh;
        height: 100%;

        margin: auto;
        overflow: hidden;
    }
    .book-container > #book-content {
        width: 100%;
        height: 100%;

        columns: 1;
        column-gap: var(--column-gap);
    }

    .book-container img {
        display: block !important;
        padding: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
        object-fit: contain;
        cursor: zoom-in;
    }
`;

export const template = document.createElement("template");
template.innerHTML = /*html*/ `
    <section id="root" class="book-container">
        <style id="book-style"></style>
        <style id="component-style">
            ${style}
        </style>
      
        <div id="book-content"></div>
        
    </section>
`;
