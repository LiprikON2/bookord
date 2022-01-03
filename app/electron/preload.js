const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");
const i18nextBackend = require("i18next-electron-fs-backend");
const Store = require("secure-electron-store").default;
const ContextMenu = require("secure-electron-context-menu").default;
const SecureElectronLicenseKeys = require("secure-electron-license-keys");

// Create the electron store to be made available in the renderer process
const store = new Store();

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
        // whitelist channels
        const validChannels = [
            "app:on-fs-dialog-open",
            "app:get-files",
            "app:delete-file",
            "app:on-file-add",
            "app:on-file-open",
            "app:on-file-delete",
            "app:on-book-import",
            "app:on-book-section-import",
            "app:on-book-metadata-import",
        ];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel, func) => {
        const validChannels = [
            "app:on-fs-dialog-open",
            "app:get-files",
            "app:delete-file",
            "app:on-file-add",
            "app:on-file-open",
            "app:on-file-delete",
            "app:on-book-import",
            "app:on-book-section-import",
            "app:on-book-metadata-import",
        ];
        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender`
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    },

    invoke: (channel, func) => {
        const validChannels = [
            "app:on-fs-dialog-open",
            "app:get-files",
            "app:delete-file",
            "app:on-file-add",
            "app:on-file-open",
            "app:on-file-delete",
            "app:on-book-import",
            "app:on-book-section-import",
            "app:on-book-metadata-import",
        ];
        if (validChannels.includes(channel)) {
            const promise = ipcRenderer.invoke(channel, func);
            return promise;
        }
    },

    on(channel, func) {
        const validChannels = [
            "app:on-fs-dialog-open",
            "app:get-files",
            "app:delete-file",
            "app:on-file-add",
            "app:on-file-open",
            "app:on-file-delete",
            "app:on-book-import",
            "app:on-book-section-import",
            "app:on-book-metadata-import",
        ];
        if (validChannels.includes(channel)) {
            // Deliberately strip event as it includes `sender`
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    },
});
