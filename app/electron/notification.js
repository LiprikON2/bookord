const { Notification } = require("electron");

// display files added notification
exports.filesAdded = (size) => {
    const notif = new Notification({
        title: "Adding books",
        body:
            size == 1 ? `${size} book is being added.` : `${size} books are being added.`,
    });

    notif.show();
};
