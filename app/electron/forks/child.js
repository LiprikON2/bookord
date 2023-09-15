const io = require("../io");
process.parentPort.on("message", async (/**@type any*/ { data, ports }) => {
    console.log("message recieved", "parseMetadata" in data, "parse" in data);
    if ("parseMetadata" in data) {
        const { files, allBooks } = data.parseMetadata;
        const [filesWithMetadata, mergedAllbooks] = await io.getBooks(files, allBooks);

        process.parentPort.postMessage({
            filesWithMetadata,
            mergedAllbooks,
            messageType: "parseMetadata",
        });
        console.log("parseMetadata");
    } else if ("parse" in data) {
        const { filePath, initSectionIndex } = data.parse;
        const [initBook, parsedEpub] = await io.parseBook(filePath, initSectionIndex);

        // Sending init book
        process.parentPort.postMessage({ initBook, messageType: "parse-init" });

        const book = await io.parseSections(initBook, parsedEpub);

        // Sending fully parsed book
        process.parentPort.postMessage({ book, messageType: "parse" });
        console.log("parse");
    }
});
