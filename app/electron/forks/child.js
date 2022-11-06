const io = require("../io");

// Setup file logging
const log = require("electron-log");
log.transports.file.level = "info";
log.transports.file.resolvePath = () => __dirname + "/log.log";

// Log a message
log.info("log message");

try {
    process.on("message", async (/**@type any*/ message) => {
        if ("parseMetadata" in message) {
            const { files, allBooks } = message.parseMetadata;
            const [filesWithMetadata, mergedAllbooks] = await io.getBooks(
                files,
                allBooks
            );

            process.send({ filesWithMetadata, mergedAllbooks });
        } else if ("parse" in message) {
            const { filePath, initSectionIndex } = message.parse;
            const [initBook, parsedEpub] = await io.parseBook(filePath, initSectionIndex);

            // Sending init book
            process.send({ initBook });

            const book = await io.parseSections(initBook, parsedEpub);

            // Sending fully parsed book
            process.send({ book });
        }
    });
} catch (error) {
    log.info("ERROR:", error);
}
log.info("log message complete");
