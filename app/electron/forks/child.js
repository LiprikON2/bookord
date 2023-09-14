const io = require("../io");

process.on("message", async (/**@type any*/ message) => {
    if ("parseMetadata" in message) {
        const { files, allBooks } = message.parseMetadata;
        const [filesWithMetadata, mergedAllbooks] = await io.getBooks(files, allBooks);

        process.send({ filesWithMetadata, mergedAllbooks });
        console.log("parseMetadata: done");
    } else if ("parse" in message) {
        const { filePath, initSectionIndex } = message.parse;
        const [initBook, parsedEpub] = await io.parseBook(filePath, initSectionIndex);

        // Sending init book
        process.send({ initBook });

        const book = await io.parseSections(initBook, parsedEpub);

        // Sending fully parsed book
        process.send({ book });
        console.log("parse: done");
    }
});
