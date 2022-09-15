let initStorage;

export const getInitStore = () => {
    if (!initStorage) {
        try {
            initStorage = window.api.store.initial();
        } catch (e) {
            console.log("Error trying to retrive data...\n", e);
        }
    }
    return initStorage;
};
