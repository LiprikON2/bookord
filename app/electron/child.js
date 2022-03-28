const { parseEpub } = require("@liprikon/epub-parser");
const _ = require("lodash");

const parseBookMetadata = async (filePath) => {
    const parsedEpub = await parseEpub(filePath);
    return parsedEpub.info;
};

const mapInGroups = (arr, iteratee, groupSize) => {
    const groups = _.groupBy(arr, (_v, i) => Math.floor(i / groupSize));

    return Object.values(groups).reduce(
        async (memo, group) => [
            ...(await memo),
            ...(await Promise.all(group.map(iteratee))),
        ],
        []
    );
};

const getBooks = async (files, interactionStates) => {
    const updatedInteractionStateList = [];

    const filesWithMetadata = await mapInGroups(
        files,
        async (file) => {
            const savedMetadata = interactionStates?.[file.path]?.info;
            // If books were already parsed, retrive saved results
            if (savedMetadata) {
                return {
                    ...file,
                    info: savedMetadata,
                };
            }
            // Otherwise parse books for metadata & then save results
            else {
                const metadata = await parseBookMetadata(file.path);
                // TODO change object key to file.name instead?
                const updatedInteractionState = {
                    [file.path]: {
                        file,
                        state: {
                            section: 0,
                            sectionPage: 0,
                        },
                        ...interactionStates?.[file.path],
                        info: metadata,
                    },
                };
                updatedInteractionStateList.push(updatedInteractionState);

                return {
                    ...file,
                    info: metadata,
                };
            }
        },
        5
    );
    const mergedInteractionStates = Object.assign(
        {},
        interactionStates,
        ...updatedInteractionStateList
    );

    return [filesWithMetadata, mergedInteractionStates];
};

process.on("message", (message) => {
    if (message === "start") {
        process.send(process.env.files[0].name + "HMM");
        const promise = getBooks(process.env.files, process.env.interactionStates);

        promise.then(([filesWithMetadata, mergedInteractionStates]) => {
            process.send(filesWithMetadata[0].name);
        });
    }
});
