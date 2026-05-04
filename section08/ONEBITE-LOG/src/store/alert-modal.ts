import { create } from "zustand";
import { combine, devtools } from "zustand/middleware";

/**
 * OpenSatat의 CloseState를 분리하는 이유:
 * isOpen이 true일 때만 title, description 등이 의미 있다.
 * isOpen이 false일 때 값들이 필요 없으므로 타입을 분리한다
 * TypeScript가 isOpen 상태에 따라 다른 타입을 적용하는 타입 좁히기가 가능하다.
 */
type OpenState = {
  isOpen: true;
  title: string;
  description: string;
  // 확인 버튼 클릭 시 실행할 콜백
  onPositive?: () => void;
  // 취소 버튼 클릭 시 실행할 콜백
  onNegative?: () => void;
};

type CloseState = {
  // isOpen이 false일 때 다른 값들이 없다
  isOpen: false;
};

/*
  State = CloseState | OpenState
  유니온 타입으로 두 가지 상태 중 하나가 된다.

  isOpen이 fasle -> CloseState(title, description 등 없음)
  isOpen이 true -> OpenState(title, description 등 있음)
*/
type State = CloseState | OpenState;

const initialState = {
  isOpen: false,
} as State;

const useAlertModalStore = create(
  devtools(
    combine(initialState, (set) => ({
      actions: {
        /**
         * open: AlertModal을 여는 액션
         * params: OpenState에서 isOpen을 제외한 나머지 값들
         *
         * @param params title, description, onPositive, onNegative 중 요소가 있어야 한다.
         * IsOpen은 open() 내부에서 true로 고정, 외부에서 전달받을 필요가 없다.
         */
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
// open 액션만 꺼내는 커스텀 훅, 컴포넌트에서 useOpenAlertModal()로 Alert 모달을 열 수 있다
export const useOpenAlertModal = () => {
  const open = useAlertModalStore((store) => store.actions.open);
  return open;
};

// 타입은을 단언 시키는 이유이다.
/**
 * useAlertModal: store 전체를 반환하는 커스텀 훅
 * as typeof store & State 타입 단언을 하는 이유:
 * combine 미들웨어를 사용하면 TypeScript가 state와 actions를 합친 타입을 정확히 추로한지 못하는 경우가 많다
 * 유니온 타입(CloseState | OpenState)에서 isOpen이 true일 때 title, description 등에 접근하려 하면 타입 오류가 발생할 수 있다
 *
 * 타입 단언(as)으로 store는 State 타입도 가진다고 명시하고 store.title, store.description 등에 안전하게 접근할 수 있다.
 * @returns AlertModalStore의 State를 반환
 */
export const useAlertModal = () => {
  const store = useAlertModalStore();
  return store as typeof store & State;
};
