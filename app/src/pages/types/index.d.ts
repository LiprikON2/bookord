export {};

// window.api
declare global {
    interface Window {
        api: any;
    }
}

// https://stackoverflow.com/a/55424778
declare global {
    namespace JSX {
        interface IntrinsicElements {
            "book-component": React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement>,
                HTMLElement
            >;
        }
    }
}
