const io = require("../io");

// const send = (str, data) => {
//     process.send(str + JSON.stringify(data, null, 2));
// };

process.on("message", (message) => {
    const { interactionStates, files } = message;
    const promise = io.getBooks(files, interactionStates);

    promise.then(([filesWithMetadata, mergedInteractionStates]) => {
        process.send({ mergedInteractionStates, filesWithMetadata });
    });
});
