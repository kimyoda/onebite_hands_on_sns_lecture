import { create } from "zustand";
import {
  combine,
  subscribeWithSelector,
  persist,
  createJSONStorage,
  devtools,
} from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// combine
// store 생성, count state가 첫번째로 포함, actions가 두번째 객체가 보관이 된다.
// 미들웨어를 사용하면 첫번째 객체의 타입이 자동으로 추론되기 때문이다. 별도의 타입을 지정하지 않아도 된다.
// 한 가지 주의해야될 것은 첫번째 값의 state만 반영하기에 주의해야 한다.

// immer - 불변성 관리 (npm i immer)
// 인수로 combine 함수를 감싼다
// 객체에 속성에 접근하여 직접 바꿀 수 있다

// subscribeWithSelector
// selector 함수를 통해 해당 값이 변경될 때 마다 기능을 수행하는 - useEffect와 비슷한 기능
export const useCountStore = create(
  devtools(
    persist(
      subscribeWithSelector(
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
      ),
      // persist 두번째 인수로 객체형태 를 넣어야한다
      {
        name: "countStore",
        // 따로 보관하도록 하는 객체
        partialize: (store) => ({
          count: store.count,
        }),
        // sessionStorage 데이터를 보관하도록 설정
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
    // devtools 두번째 옵션 객체
    {
      name: "countStore",
    },
  ),
);

useCountStore.subscribe(
  (store) => store.count,
  (count, prevCount) => {
    // Listner 콜백함수(이전 값)
    console.log(count, prevCount);

    // 현재 스토어를 반환
    const store = useCountStore.getState();
    // 업데이트
    // useCountStore.setState((store) => ({}));
  },
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
