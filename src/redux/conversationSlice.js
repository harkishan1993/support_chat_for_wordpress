// conversationSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedConversation: null,
  messages: [],
  userAndAgantDetail: null,
  conversations: [],
  userChatboxOpen: false,
  topScrollUnseenCount: 0
};

const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },   
    removeLastMessage: (state) => {
      state.messages.pop(); 
    },
    addUserChatboxOpen: (state, action) => {
      state.userChatboxOpen = action.payload;
    },
    upsertMessage: (state, action) => {
      const newMsg = action.payload;
      const index = state.messages.findIndex((m) => m.id === newMsg.id);

      if (index !== -1) {
        // If found, replace
        state.messages[index] = newMsg;
      } else {
        // If not found, push
        state.messages.push(newMsg);
      }
    },
    setUserAndAgentDetail: (state, action) => {
      state.userAndAgantDetail = action.payload;
    },
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    updateConversation: (state, action) => {
      const updated = action.payload;
      state.conversations = state.conversations.map((c) =>
        c.id === updated.id ? { ...c, ...updated } : c
      );
    },
    incrementTopScrollUnseenCount: (state) => {
      state.topScrollUnseenCount += 1;
    },
    resetTopScrollUnseenCount: (state) => {
      state.topScrollUnseenCount = 0;
    },
  },
});

export const {
  setSelectedConversation,
  setMessages,
  setUserAndAgentDetail,
  setConversations,
  updateConversation,
  addMessage,
  upsertMessage,
  addUserChatboxOpen,
  incrementTopScrollUnseenCount,
  resetTopScrollUnseenCount,
  removeLastMessage

} = conversationSlice.actions;

export default conversationSlice.reducer;
