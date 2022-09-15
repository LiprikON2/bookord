import { createSlice } from "@reduxjs/toolkit";
import { getInitStore } from "Utils/getInitialStore";

const initStorage = getInitStore();
const homeSlice = createSlice({
    name: "home",
    initialState: {
        message:
            typeof initStorage["motd"] !== "undefined"
                ? initStorage["motd"]
                : "Hello and welcome to the template!",
    },
    reducers: {
        changeMessage(state, action) {
            state.message = action.payload;
        },
    },
});

// Export actions
export const { changeMessage } = homeSlice.actions;

// Export reducer
export default homeSlice.reducer;
