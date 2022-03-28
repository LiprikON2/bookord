const { parseEpub } = require("@liprikon/epub-parser");
const _ = require("lodash");

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

console.log("ExecPath", process.execPath);

process.on("message", async (file) => {
    try {
        // const filesWithMetadata = mapInGroups(
        //     files,
        //     async (file) => {
        //         const metadata = (await parseEpub(file.path)).info;
        //         return { ...file, info: metadata };
        //     },
        //     4
        // );
        // const filesWithMetadata = Promise.all(
        //     files.map((file) => {
        //         const metadata = (await parseEpub(file.path)).info;

        //         return { ...file, info: metadata };
        //     })
        // );
        process.send(JSON.stringify(file.path, null, 2));
        const parsedEpub = await parseEpub(file.path);
        process.send(`${parsedEpub.metadata}`);
        process.send("hmmm2");
        // const filesWithMetadata = Promise.all(
        //     files.map((file) => {
        //         return { ...file, info: metadata };
        //     })
        // );

        // process.send(filesWithMetadata);
    } catch (err) {
        process.send("error " + err);
    }
});
