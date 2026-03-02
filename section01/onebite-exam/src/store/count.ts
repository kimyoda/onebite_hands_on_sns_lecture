import { create } from "zustand";
import { combine } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// combine
// store 생성, count state가 첫번째로 포함, actions가 두번째 객체가 보관이 된다.
// 미들웨어를 사용하면 첫번째 객체의 타입이 자동으로 추론되기 때문이다. 별도의 타입을 지정하지 않아도 된다.
// 한 가지 주의해야될 것은 첫번째 값의 state만 반영하기에 주의해야 한다.

// immer - 불변성 관리 (npm i immer)
// 인수로 combine 함수를 감싼다
// 객체에 속성에 접근하여 직접 바꿀 수 있다
export const useCountStore = create(
  immer(
    combine({ count: 0 }, (set, get) => ({
      actions: {
        increaseOne: () => {
          // 객체값들의 타입을 자동으로 추론한다.
          set((state) => {
            state.count += 1;
          });
        },
        decreaseOne: () => {
          set((state) => {
            state.count -= 1;
          });
        },
      },
    })),
  ),
);

// Custom Hook 완성
export const useCount = () => {
  const count = useCountStore((store) => store.count);
  return count;
};

export const useIncreaseCount = () => {
  const increase = useCountStore((store) => store.actions.increaseOne);
  return increase;
};

export const useDecreaseCount = () => {
  const decrease = useCountStore((store) => store.actions.decreaseOne);
  return decrease;
};
