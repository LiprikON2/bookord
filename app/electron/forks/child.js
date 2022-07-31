// @ts-nocheck

const io = require("../io");

// const send = (str, data) => {
//     process.send(str + JSON.stringify(data, null, 2));
// };

process.on("message", (message) => {
    if ("parseMetadata" in message) {
        const { files, allBooks } = message.parseMetadata;
        const promise = io.getBooks(files, allBooks);

        promise.then(([filesWithMetadata, mergedAllbooks]) => {
            process.send({ filesWithMetadata, mergedAllbooks });
        });
    } else if ("parse" in message) {
        const { filePath, initSectionIndex } = message.parse;
        const promise = io.parseBook(filePath, initSectionIndex);

        promise.then(([initBook, parsedEpub]) => {
            // Sending init book
            process.send({ initBook });

            const promise2 = io.parseSections(initBook, parsedEpub);

            // Sending fully parsed book
            promise2.then((book) => {
                process.send({ book });
            });
        });
    }
});
