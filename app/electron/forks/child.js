const io = require("../io");

// const send = (str, data) => {
//     process.send(str + JSON.stringify(data, null, 2));
// };

process.on("message", (message) => {
    if ("parseMetadata" in message) {
        const { interactionStates, files } = message.parseMetadata;
        const promise = io.getBooks(files, interactionStates);

        promise.then(([filesWithMetadata, mergedInteractionStates]) => {
            process.send({ mergedInteractionStates, filesWithMetadata });
        });
    } else if ("parse" in message) {
        const { filePath, sectionNum } = message.parse;
        const promise = io.parseBook(filePath, sectionNum);

        promise.then(([initBook, parsedEpub]) => {
            process.send({ initBook: initBook });

            const promise2 = io.parseSections(initBook, parsedEpub);

            promise2.then((book) => {
                process.send({ book: book });
            });
        });
    }
});
