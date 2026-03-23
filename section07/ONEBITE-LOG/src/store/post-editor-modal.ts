import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

const iniitalState = {
  isOpen: false,
};

const usePostEditorModalStore = create(
  devtools(
    combine(iniitalState, (set) => ({
      actions: {
        open: () => {
          set({ isOpen: true });
        },
        close: () => {
          set({ isOpen: false });
        },
      },
    })),
    { name: "postEditorModalStore" },
  ),
);

// custom hook
export const useOpenPostEditorModal = () => {
  const open = usePostEditorModalStore((store) => store.actions.open);
  return open;
};

// 한꺼번에 다 불러오느 훅
export const usePostEditorModal = () => {
  const {
    isOpen,
    actions: { open, close },
  } = usePostEditorModalStore();
  return {
    isOpen,
    open,
    close,
  };
};
