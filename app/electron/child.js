// const { parseEpub } = require("@liprikon/epub-parser");
const _ = require("lodash");
const nodeZip = require("node-zip");
const fs = require("fs-extra");

// import nodeZip from "node-zip";
const xml2js = require("xml2js");
// import xml2js from "xml2js";

const xmlParser = new xml2js.Parser();

const xmlToJs = (xml) => {
    return new Promise()((resolve, reject) => {
        xmlParser.parseString(xml, (err, object) => {
            if (err) {
                reject(err);
            } else {
                resolve(object);
            }
        });
    });
};
const send = (str, data) => {
    process.send(str + JSON.stringify(data, null, 2));
};

const parseBookMetadata = async (filePath) => {
    let buffer;
    process.send("filePath:" + JSON.stringify(filePath, null, 2));
    process.send("EXIST?:" + JSON.stringify(fs.existsSync(filePath), null, 2));
    if (fs.existsSync(filePath)) {
        buffer = fs.readFileSync(filePath, "binary");
    }

    process.send("BUFFER:" + JSON.stringify(buffer, null, 2));
    // const parsedEpub = await parseEpub(filePath);
    // return parsedEpub.info;
    zip = new nodeZip(buffer, { binary: true, base64: false, checkCRC32: true });
    process.send("ZIP:" + JSON.stringify(zip, null, 2));
    process.send("FILES:" + JSON.stringify(zip.files, null, 2));

    // const container = await this._resolveXMLAsJsObject("/META-INF/container.xml");
    // const opfPath = container.container.rootfiles[0].rootfile[0]["$"]["full-path"];

    // const xml = this.resolve(path).asText();
    // const container xmlToJs(xml);

    let _path = "/META-INF/container.xml";
    // if (path[0] === "/") {
    //     // use absolute path, root is zip root
    //     _path = path.substr(1);
    // } else {
    //     // _path = _root + path;
    // }
    const file = zip.file(_path);
    process.send('"file":');

    const xml = file.asText();
    const container = xmlToJs(xml);

    const _root = container.container.rootfiles[0].rootfile[0]["$"]["full-path"];

    return _root;
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
                process.send('"metadata":' + metadata);
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
