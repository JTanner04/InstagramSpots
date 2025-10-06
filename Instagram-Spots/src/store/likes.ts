import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";

type LikeItem = { id: string; title: string };

type LikesState = {
  likes: LikeItem[];
  addLike: (item: LikeItem) => void;
  removeLike: (id: string) => void;
  clearLikes: () => void;
};

export const useLikes = create<LikesState>()(
  persist(
    (set, get) => ({
      likes: [],
      addLike: (item) => {
        const exists = get().likes.some((l) => l.id === item.id);
        if (exists) return;
        set({ likes: [item, ...get().likes] });
      },
      removeLike: (id) =>
        set({ likes: get().likes.filter((l) => l.id !== id) }),
      clearLikes: () => set({ likes: [] }),
    }),
    {
      name: "likes-store-v1",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);
