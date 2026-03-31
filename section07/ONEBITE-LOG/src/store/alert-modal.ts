import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

type OpenState = {
  isOpen: true;
  title: string;
  description: string;
  onPositive?: () => void;
  onNegative?: () => void;
};

type CloseState = {
  isOpen: false;
};

type State = CloseState | OpenState;

const initialState = {
  isOpen: false,
} as State;

const useAlertModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        open: (params: Omit<OpenState, "isOpen">) => {
          set({ ...params, isOpen: true });
        },
        close: () => {
          set({ isOpen: false });
        },
      },
    })),
    { name: "AlertModalStore" },
  ),
);

// 커스텀 훅 작성
export const useOpenAlertModal = () => {
  const open = useAlertModalStore((store) => store.actions.open);
  return open;
};

// 타입은을 단언 시키는 이유이다.
export const useAlertModal = () => {
  const store = useAlertModalStore();
  return store as typeof store & State;
};
