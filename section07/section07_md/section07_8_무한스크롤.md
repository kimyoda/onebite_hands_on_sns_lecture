## section07_8\_무한스크롤

## 무한스크롤

### Step 1. 스크롤 하단 감지

- 스크롤이 화면의 최 하단에 닿았을 때 감지하는 기능
- npm i react-intersection-observer 라이브러리 설치

```tsx
import { useInView } from "react-intersection-observer";
// intersection 라이브러리
const { ref, inView } = useInView();

useEffect(() => {
  console.log(inView);
}, [inView]);
{
  /* 관측하고자 하는 div에 세닝 */
}
<div ref={ref}></div>;
```

```bash
post-feed.tsx:15 false
post-feed.tsx:15 true
```

### Step 2. 데이터 추가

- 데이터를 더 불러와서 화면 하단에 추가하는 기능
