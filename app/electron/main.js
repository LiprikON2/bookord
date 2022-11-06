// @ts-nocheck

const {
    app,
    protocol,
    BrowserWindow,
    session,
    ipcMain,
    Menu,
    dialog,
    shell,
} = require("electron");
const {
    default: installExtension,
    REDUX_DEVTOOLS,
    REACT_DEVELOPER_TOOLS,
} = require("electron-devtools-installer");
const SecureElectronLicenseKeys = require("secure-electron-license-keys");
const Protocol = require("./protocol");
const MenuBuilder = require("./menu");
const i18nextBackend = require("i18next-electron-fs-backend");
const i18nextMainBackend = require("../localization/i18n.mainconfig");
const Store = require("secure-electron-store").default;
const ContextMenu = require("secure-electron-context-menu").default;
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const isDev = process.env.NODE_ENV === "development";
const port = 40992; // Hardcoded; needs to match webpack.development.js and package.json
const selfHost = `http://localhost:${port}`;
const productName = "Bookord";

const { fork } = require("child_process");
// local dependencies
const io = require("./io");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let menuBuilder;
let storeData;
let isInitLoad;

async function createWindow() {
    // If you'd like to set up auto-updating for your app,
    // I'd recommend looking at https://github.com/iffy/electron-updater-example
    // to use the method most suitable for you.
    // eg. autoUpdater.checkForUpdatesAndNotify();

    if (!isDev) {
        // Needs to happen before creating/loading the browser window;
        // protocol is only used in prod
        protocol.registerBufferProtocol(
            Protocol.scheme,
            Protocol.requestHandler
        ); /* eng-disable PROTOCOL_HANDLER_JS_CHECK */
    }
    const store = new Store({
        debug: isDev || true, // TODO remove all "|| true"
        reset: isDev,
        path: app.getPath("userData"),
    });

    const RESOURCES_PATH = app.isPackaged
        ? path.join(process.resourcesPath, "resources")
        : path.join(__dirname, "../../resources");

    const getAssetPath = (...paths) => {
        return path.join(RESOURCES_PATH, ...paths);
    };
    // Use saved config values for configuring your
    // BrowserWindow, for instance.
    // NOTE - this config is not passcode protected
    // and stores plaintext values
    //let savedConfig = store.mainInitialStore(fs);

    // Create the browser window.
    win = new BrowserWindow({
        show: false,
        width: 1024,
        height: 728,
        minHeight: 500,
        minWidth: 500,
        backgroundColor: "#202225",
        icon: getAssetPath("icons/256x256.png"), // TODO taskbar icon is tiny; No notification icon
        title: "Bookord is initializing...",
        frame: false,
        webPreferences: {
            devTools: isDev || true, // TODO remove
            nodeIntegration: false,
            nodeIntegrationInWorker: false,
            nodeIntegrationInSubFrames: false,
            contextIsolation: true,
            enableRemoteModule: false,
            additionalArguments: [
                `--storePath=${store.sanitizePath(app.getPath("userData"))}`,
            ],
            preload: path.join(__dirname, "preload.js"),
            /* eng-disable PRELOAD_JS_CHECK */
            disableBlinkFeatures: "Auxclick",
        },
    });

    win.once("ready-to-show", function () {
        win.maximize();
        win.focus();
    });

    // TITLEBAR WINDOW CONTROLS
    win.on("maximize", () => {
        win.webContents.send("app:window-is-maximized");
    });
    win.on("unmaximize", () => {
        win.webContents.send("app:window-is-restored");
    });

    win.webContents.setWindowOpenHandler(({ url }) => {
        // TODO unsecure, add follow link confirmation option
        shell.openExternal(url);
        return { action: "deny" };
    });

    // Sets up main.js bindings for our i18next backend
    i18nextBackend.mainBindings(ipcMain, win, fs);

    // Sets up main.js bindings for our electron store;
    // callback is optional and allows you to use store in main process
    const callback = function (success, currentStore) {
        storeData = currentStore;
    };

    store.mainBindings(ipcMain, win, fs, callback);

    // Sets up bindings for our custom context menu
    ContextMenu.mainBindings(ipcMain, win, Menu, isDev || true, {
        loudAlertTemplate: [
            {
                id: "loudAlert",
                label: "AN ALERT (modified)!",
            },
        ],
        softAlertTemplate: [
            {
                id: "softAlert",
                label: "Soft alert",
            },
        ],
        textSelectionTemplate: [
            {
                id: "textSelection",
                label: "Text Selection",
                submenu: [
                    {
                        role: "undo",
                    },
                    {
                        role: "redo",
                    },
                    {
                        type: "separator",
                    },
                    {
                        role: "cut",
                    },
                    {
                        role: "copy",
                    },
                    {
                        role: "paste",
                    },
                ],
            },
        ],
    });

    // Setup bindings for offline license verification
    SecureElectronLicenseKeys.mainBindings(ipcMain, win, fs, crypto, {
        root: process.cwd(),
        version: app.getVersion(),
    });

    // Load app
    if (isDev) {
        win.loadURL(selfHost);
    } else {
        win.loadURL(`${Protocol.scheme}://rse/index.html`);
    }

    win.webContents.on("did-finish-load", () => {
        win.setTitle(productName);
        io.watchFiles(win);
        isInitLoad = true;
    });
    if (process.platform === "win32") {
        app.setAppUserModelId(productName);
    }

    // Only do these things when in development
    // TODO remove
    if (isDev || true) {
        // Errors are thrown if the dev tools are opened
        // before the DOM is ready
        win.webContents.once("dom-ready", async () => {
            // Enable pinch-to-zoom
            win.webContents.setVisualZoomLevelLimits(1, 3);

            await installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS])
                .then((name) => console.log(`Added Extension: ${name}`))
                .catch((err) => console.log("An error occurred: ", err))
                .finally(() => {
                    require("electron-debug")(); // https://github.com/sindresorhus/electron-debug
                    win.webContents.openDevTools();
                });
        });
    }

    // Emitted when the window is closed.
    win.on("closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });

    // https://electronjs.org/docs/tutorial/security#4-handle-session-permission-requests-from-remote-content
    const ses = session;
    const partition = "default";
    ses.fromPartition(partition) /* eng-disable PERMISSION_REQUEST_HANDLER_JS_CHECK */
        .setPermissionRequestHandler((webContents, permission, permCallback) => {
            const allowedPermissions = []; // Full list here: https://developer.chrome.com/extensions/declare_permissions#manifest

            if (allowedPermissions.includes(permission)) {
                permCallback(true); // Approve permission request
            } else {
                console.error(
                    `The application tried to request permission for '${permission}'. This permission was not whitelisted and has been blocked.`
                );

                permCallback(false); // Deny
            }
        });

    // https://electronjs.org/docs/tutorial/security#1-only-load-secure-content;
    // The below code can only run when a scheme and host are defined, I thought
    // we could use this over _all_ urls
    // ses.fromPartition(partition).webRequest.onBeforeRequest({urls:["http://localhost./*"]}, (listener) => {
    //   if (listener.url.indexOf("http://") >= 0) {
    //     listener.callback({
    //       cancel: true
    //     });
    //   }
    // });

    menuBuilder = MenuBuilder(win, app.name);

    // Set up necessary bindings to update the menu items
    // based on the current language selected
    i18nextMainBackend.on("loaded", (loaded) => {
        i18nextMainBackend.changeLanguage("en");
        i18nextMainBackend.off("loaded");
    });

    i18nextMainBackend.on("languageChanged", (lng) => {
        menuBuilder.buildMenu(i18nextMainBackend);
    });
}

// Needs to be called before app is ready;
// gives our scheme access to load relative files,
// as well as local storage, cookies, etc.
// https://electronjs.org/docs/api/protocol#protocolregisterschemesasprivilegedcustomschemes
protocol.registerSchemesAsPrivileged([
    {
        scheme: Protocol.scheme,
        privileges: {
            standard: true,
            secure: true,
        },
    },
]);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    } else {
        i18nextBackend.clearMainBindings(ipcMain);
        ContextMenu.clearMainBindings(ipcMain);
        SecureElectronLicenseKeys.clearMainBindings(ipcMain);
    }
});

app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

// https://electronjs.org/docs/tutorial/security#12-disable-or-limit-navigation
app.on("web-contents-created", (event, contents) => {
    contents.on("will-navigate", (contentsEvent, navigationUrl) => {
        /* eng-disable LIMIT_NAVIGATION_JS_CHECK  */
        const parsedUrl = new URL(navigationUrl);
        const validOrigins = [selfHost];

        // Log and prevent the app from navigating to a new page if that page's origin is not whitelisted
        if (!validOrigins.includes(parsedUrl.origin)) {
            console.error(
                `The application tried to navigate to the following address: '${parsedUrl}'. This origin is not whitelisted and the attempt to navigate was blocked.`
            );

            contentsEvent.preventDefault();
        }
    });

    contents.on("will-redirect", (contentsEvent, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        const validOrigins = [];

        // Log and prevent the app from redirecting to a new page
        if (!validOrigins.includes(parsedUrl.origin)) {
            console.error(
                `The application tried to redirect to the following address: '${navigationUrl}'. This attempt was blocked.`
            );

            contentsEvent.preventDefault();
        }
    });

    // https://electronjs.org/docs/tutorial/security#11-verify-webview-options-before-creation
    contents.on("will-attach-webview", (contentsEvent, webPreferences, params) => {
        // Strip away preload scripts if unused or verify their location is legitimate
        delete webPreferences.preload;
        delete webPreferences.preloadURL;

        // Disable Node.js integration
        webPreferences.nodeIntegration = false;
    });

    // https://electronjs.org/docs/tutorial/security#13-disable-or-limit-creation-of-new-windows
    // This code replaces the old "new-window" event handling;
    // https://github.com/electron/electron/pull/24517#issue-447670981
    contents.setWindowOpenHandler(({ url }) => {
        const parsedUrl = new URL(url);
        const validOrigins = [];

        // Log and prevent opening up a new window
        if (!validOrigins.includes(parsedUrl.origin)) {
            console.error(
                `The application tried to open a new window at the following address: '${url}'. This attempt was blocked.`
            );

            return {
                action: "deny",
            };
        }

        return {
            action: "allow",
        };
    });
});

// Filter loading any module via remote;
// you shouldn't be using remote at all, though
// https://electronjs.org/docs/tutorial/security#16-filter-the-remote-module
app.on("remote-require", (event, webContents, moduleName) => {
    event.preventDefault();
});

// built-ins are modules such as "app"
app.on("remote-get-builtin", (event, webContents, moduleName) => {
    event.preventDefault();
});

app.on("remote-get-global", (event, webContents, globalName) => {
    event.preventDefault();
});

app.on("remote-get-current-window", (event, webContents) => {
    event.preventDefault();
});

app.on("remote-get-current-web-contents", (event, webContents) => {
    event.preventDefault();
});

// TITLEBAR WINDOW CONTROLS

ipcMain.on("app:minimize-window", () => {
    win.minimize();
});
ipcMain.on("app:restore-window", () => {
    win.restore();
});
ipcMain.on("app:maximize-window", () => {
    win.maximize();
});
ipcMain.on("app:close-window", () => {
    win.close();
});

// FILE HANDLING

// listen to file(s) add event
ipcMain.handle("app:on-file-add", (event, files = []) => {
    const fileCount = io.addFiles(files);
    return fileCount;
});

ipcMain.on("app:stop-watching-files", () => {
    io.watcher.close();
});

// open filesystem dialog to choose files
ipcMain.handle("app:on-fs-dialog-open", (event) => {
    const files =
        dialog.showOpenDialogSync({
            properties: ["openFile", "multiSelections"],
            filters: [
                {
                    name: "All Files",
                    extensions: [
                        "epub",
                        "fb2",
                        "txt",
                        "htm",
                        "html",
                        "xhtml",
                        "xml",
                        "mobi",
                        "azw",
                        "pdf",
                    ],
                },
                { name: "ePub Files", extensions: ["epub"] },
                { name: "FictionBook Files", extensions: ["fb2"] },
                { name: "Text Files", extensions: ["txt"] },
                { name: "HTML Files", extensions: ["htm", "html", "xhtml"] },
                { name: "XML Files", extensions: ["xml"] },
                { name: "Mobipocket eBook Files", extensions: ["mobi"] },
                { name: "Kindle File Format Files", extensions: ["azw"] },
                { name: "Portable Document Format Files", extensions: ["pdf"] },
            ],
        }) ?? [];

    const fileCount = io.addFiles(
        files.map((filepath) => {
            return {
                name: path.parse(filepath).base,
                path: filepath,
            };
        })
    );
    return fileCount;
});

// listen to file delete event
ipcMain.on("app:on-file-delete", (event, file) => {
    io.deleteFile(file.path);
});

// listen to file open event
ipcMain.handle("app:on-file-open", (event, file) => {
    return io.openFile(file.path).buffer;
});

const getChildResponse = async (child) => {
    let promiseResolve;
    const promise = new Promise((resolve, reject) => {
        promiseResolve = resolve;
    });

    child.once("message", (response) => {
        promiseResolve(response);
    });

    return promise;
};

// Forked child process for parsing book file.
// It is needed to offload parsing from main thread and, consequently, not to block UI
const metadataParseChild = fork(path.join(__dirname, "forks/child.js"));

ipcMain.handle("app:get-books", async () => {
    const allBooks = storeData?.["allBooks"];
    const files = io.getFiles();

    // Force show skeletons for already added books on initial app load (or refresh)
    if (isInitLoad) {
        win.webContents.send("app:receive-skeleton-count", files.length);
        isInitLoad = false;
    }
    metadataParseChild.send({
        parseMetadata: {
            files: files,
            allBooks: allBooks,
        },
    });

    const { filesWithMetadata, mergedAllbooks } = await getChildResponse(
        metadataParseChild
    );

    return [filesWithMetadata, mergedAllbooks];
});

let parseChild;

ipcMain.handle("app:get-parsed-book", async (event, [filePath, initSectionIndex]) => {
    // Forked child process for parsing book file.
    // It is needed to offload main thread and not to block UI
    parseChild = fork(path.join(__dirname, "forks/child.js"));

    parseChild.send({
        parse: {
            filePath,
            initSectionIndex,
        },
    });

    // Send book with single section parsed
    const { initBook } = await getChildResponse(parseChild);
    win.webContents.send("app:receive-init-book", initBook);

    // Return the fully parsed book
    const { book } = await getChildResponse(parseChild);

    parseChild.disconnect();
    return book;
});

// Kills parsing child process when user leaves the reading page
ipcMain.on("app:on-stop-parsing", () => {
    if (parseChild) parseChild.kill("SIGKILL");
});
