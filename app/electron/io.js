const { ipcMain } = require("electron");
const path = require("path");
const fs = require("fs-extra");
const os = require("os");
const open = require("open");
const chokidar = require("chokidar");
// local dependencies
const notification = require("./notification");
const _ = require("lodash");
// get application directory
const appDir = path.resolve(os.homedir(), "electron-app-files");

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

// get the list of files
exports.getFiles = async () => {
    const files = await fs.readdir(appDir);

    return await mapInGroups(
        files,
        async (filename) => {
            const filePath = path.resolve(appDir, filename);
            const fileStats = await fs.stat(filePath);

            return {
                name: filename,
                path: filePath,
                size: Number(fileStats.size / 1000).toFixed(1), // kb
            };
        },
        2
    );
};

// add files
exports.addFiles = (files = []) => {
    // ensure `appDir` exists
    fs.ensureDirSync(appDir);

    let addedCount = files.length;
    // copy `files` recursively (ignore duplicate file names)
    files.forEach((file) => {
        const filePath = path.resolve(appDir, file.name);

        if (!fs.existsSync(filePath)) {
            fs.copyFileSync(file.path, filePath);
        } else {
            addedCount--;
        }
    });

    // Don't display notification if all files are duplicates
    if (addedCount === 0) {
        return;
    }
    // display notification
    notification.filesAdded(addedCount);
};

// delete a file
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
        const file = require("fs").readFileSync(filePath);
        return file;
    }
};

// watch files from the application's storage directory
exports.watchFiles = (win) => {
    const watcher = chokidar.watch(appDir).on("unlink", (filepath) => {
        win.webContents.send("app:file-is-deleted", path.parse(filepath).base);
    });

    ipcMain.on("app:stop-watching-files", () => {
        watcher.close();
    });
};
