import { create } from "zustand";

type Store = {
  count: number;
  increase: () => void;
  decrease: () => void;
};

export const useCountStore = create<Store>((set, get) => ({
  count: 0,
  increase: () => {
    // const count = get().count;
    // set({
    //   count: count + 1,
    // });

    // 함수형 업데이트
    set((store) => ({
      count: store.count + 1,
    }));
  },
  decrease: () => {
    set((store) => ({
      count: store.count - 1,
    }));
  },
}));
