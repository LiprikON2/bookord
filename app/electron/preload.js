const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");
const i18nextBackend = require("i18next-electron-fs-backend");
const Store = require("secure-electron-store").default;
const ContextMenu = require("secure-electron-context-menu").default;
const SecureElectronLicenseKeys = require("secure-electron-license-keys");

// Create the electron store to be made available in the renderer process
const store = new Store();

// whitelist channels
const validChannels = [
    "app:on-fs-dialog-open",
    "app:on-file-add",
    "app:on-file-open",
    "app:on-file-delete",
    "app:get-files",
    "app:file-is-deleted",

    "app:get-parsed-book",
    "app:receive-parsed-section",
    "app:get-parsed-book-metadata",

    "app:minimize-window",
    "app:maximize-window",
    "app:restore-window",
    "app:close-window",

    "app:window-is-restored",
    "app:window-is-maximized",
];
const list = [];

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
    i18nextElectronBackend: i18nextBackend.preloadBindings(
        ipcRenderer,
        process
    ),
    store: store.preloadBindings(ipcRenderer, fs),
    contextMenu: ContextMenu.preloadBindings(ipcRenderer),
    licenseKeys: SecureElectronLicenseKeys.preloadBindings(ipcRenderer),

    send: (channel, data) => {
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel, func) => {
        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender`
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    },

    invoke: (channel, func) => {
        if (validChannels.includes(channel)) {
            list.push(channel);
            console.log("list!!", list);
            const promise = ipcRenderer.invoke(channel, func);
            return promise;
        }
    },
});
