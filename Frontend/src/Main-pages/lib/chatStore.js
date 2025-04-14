import { create } from "zustand";

export const useChatStore = create((set) => ({
  chatId: null,

  changeChat: (chatId) => {
    set({ chatId });
  },

  resetChat: () => {
    set({ chatId: null });
  },
}));
