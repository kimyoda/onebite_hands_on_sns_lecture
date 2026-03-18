import {
  useCountStore,
  useDecreaseCount,
  useIncreaseCount,
} from "@/store/count";
import { Button } from "../ui/button";

export default function Controller() {
  // selector 함수, count를 아예 안씀
  //   const increase = useCountStore((store) => store.increase);
  //   const decrease = useCountStore((store) => store.decrease);
  //   const { increase, decrease } = useCountStore((store) => store.actions);
  // custom hook 적용
  const increase = useIncreaseCount();
  const decrease = useDecreaseCount();
  return (
    <div>
      <Button onClick={decrease}>-</Button>
      <Button onClick={increase}>+</Button>
    </div>
  );
}
