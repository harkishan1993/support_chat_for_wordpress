import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedConversation: null,
  messages: [],
  userAndAgantDetail: null
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
    setUserAndAgentDetail:(state, action)=>{
      state.userAndAgantDetail = action.payload;
    }
  },
});

export const { setSelectedConversation, setMessages, setUserAndAgentDetail } = conversationSlice.actions;
export default conversationSlice.reducer;
