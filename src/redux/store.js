import { configureStore } from "@reduxjs/toolkit";
import conversationReducer from "./conversationSlice.js";

export const store = configureStore({
  reducer: {
    conversation: conversationReducer,
  },
});

