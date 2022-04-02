const { ipcMain } = require("electron");
const path = require("path");
const fs = require("fs-extra");
const os = require("os");
const chokidar = require("chokidar");

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

// local dependencies
const notification = require("./notification");

// get application directory
const appDir = path.resolve(os.homedir(), "Bookord Books");

// get the list of files
exports.getFiles = () => {
    const files = fs.readdirSync(appDir);

    return files.map((filename) => {
        const filePath = path.resolve(appDir, filename);
        const fileStats = fs.statSync(filePath);

        return {
            name: filename,
            path: filePath,
            size: Number(fileStats.size / 1000).toFixed(1), // kb
        };
    });
};

// add files
exports.addFiles = (files = []) => {
    // ensure `appDir` exists
    fs.ensureDirSync(appDir);

    let filesNum = files.length;
    // copy `files` recursively (ignore duplicate file names)
    files.forEach((file) => {
        const filePath = path.resolve(appDir, file.name);

        if (!fs.existsSync(filePath)) {
            fs.copyFileSync(file.path, filePath);
        } else {
            filesNum--;
        }
    });

    // Don't display notification if all files are duplicates
    if (filesNum !== 0) {
        // Display notification
        notification.filesAdded(filesNum);
    }
    return filesNum;
};

// delete a file; triggers chokirar in `watchFiles`
exports.deleteFile = (filename) => {
    const filePath = path.resolve(appDir, filename);

    // remove file from the file system
    if (fs.existsSync(filePath)) {
        fs.removeSync(filePath);
    }
};

// open a file
exports.openFile = (filename) => {
    const filePath = path.resolve(appDir, filename);

    // open a file using default application
    if (fs.existsSync(filePath)) {
        const file = fs.readFileSync(filePath);
        return file;
    }
};

// watch files from the application's storage directory
exports.watchFiles = (win) => {
    const watcher = chokidar.watch(appDir).on("unlink", (filePath) => {
        win.webContents.send("app:file-is-deleted", path.parse(filePath).base);
    });

    ipcMain.on("app:stop-watching-files", () => {
        watcher.close();
    });
};

const parseMetadata = async (filePath) => {
    const parsedEpub = await parseEpub(filePath);
    return parsedEpub.info;
};

const removeDeletedBooks = (files, interactionStates) => {
    if (interactionStates) {
        let newInteractionStates = {};

        files.forEach((file) => {
            if (file.path in interactionStates) {
                newInteractionStates = {
                    ...newInteractionStates,
                    [file.path]: interactionStates[file.path],
                };
            }
        });
        return newInteractionStates;
    } else return interactionStates;
};

exports.getBooks = async (files, interactionStates) => {
    const updatedInteractionStateList = [];

    interactionStates = removeDeletedBooks(files, interactionStates);

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
                const metadata = await parseMetadata(file.path);
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
        4
    );

    const mergedInteractionStates = Object.assign(
        {},
        interactionStates,
        ...updatedInteractionStateList
    );

    return [filesWithMetadata, mergedInteractionStates];
};

exports.parseBook = async (filePath, sectionNum) => {
    const parsedEpub = await parseEpub(filePath);

    const sectionNames = parsedEpub.sections.map((section) => section.id);
    const initBook = {
        info: parsedEpub.info,
        styles: parsedEpub.styles,
        structure: parsedEpub.structure,
        sectionsTotal: parsedEpub.sections.length,
        sectionNames,
        initSectionNum: sectionNum,
        initSection: parsedEpub.sections[sectionNum].toHtmlObjects(),
    };
    return [initBook, parsedEpub];
};

exports.parseSections = async (initBook, parsedEpub) => {
    const sections = await mapInGroups(
        parsedEpub.sections,
        async (section) => section.toHtmlObjects(),
        4
    );
    const book = {
        ...initBook,
        sections,
    };
    return book;
};
