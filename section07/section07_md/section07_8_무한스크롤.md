## section07_8\_무한스크롤

## 무한스크롤

### Step 1. 스크롤 하단 감지

- 스크롤이 화면의 최 하단에 닿았을 때 감지하는 기능
- npm i react-intersection-observer 라이브러리 설치

### Intersection Observer API?

> **특정 요소가 뷰포트(화면)에 보이는지 감지하는 브라우저 내장 API**

### 기존 방식의 문제

스크롤 이벤트(`window.addEventListener('scroll', ...)`)로 스크롤 위치를 감지하는 방법은 스크롤할 때마다 수백 번 함수가 호출되어 **성능 문제**가 발생한다.

```
기존 scroll 이벤트 방식:
스크롤 1px -> 이벤트 발생
스크롤 2px -> 이벤트 발생
스크롤 3px -> 이벤트 발생
... 수백번 반복 -> 성능 저하 X
```

### Intersection Observer의 장점

```
Intersection Observer 방식:
요소가 화면에 들어올 때 -> 콜백 1번 실행
요소가 화면에서 나갈 때 -> 콜백 1번 실행
그 외에는 아무것도 하지 않는다 -> 성능이 최적화
```

### 동작 원리

```
[뷰포트 (현재 화면)]
┌─────────────────────┐
│  게시글 1           │
│  게시글 2           │
│  게시글 3           │
│  게시글 4           │
│  게시글 5           │
└─────────────────────┘
         │ 스크롤
         ▼
┌─────────────────────┐
│  게시글 4           │
│  게시글 5           │
│                     │
│  [관찰 대상 div] ◀──┼── Intersection Observer가 감시
│                     │    화면에 들어오는 순간 콜백 실행
└─────────────────────┘

```

---

## 📖 Intersection Observer API

### 핵심 개념 3가지

**1. 뷰포트(Viewport)**
현재 화면에 보이는 영역이다.
스크롤하면 뷰포트는 그대로, 콘텐츠가 이동한다.

**2. 타겟 요소(Target Element)**
관찰할 DOM요소다. 이 요소가 뷰포트에 들어오거나 나갈 때 콜백이 실행된다.

**교차(Intersection)**
타겟 요소와 뷰포트가 겹치는 것을 의미한다. `threshold` 값으로 얼마나 겹쳐야 콜백을 실행할 지 설정할 수 있다.

```js
// 바닐라 JS로 Intersection Observer 사용하는 방법
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // 요소가 화면에 들어왔을 때
        console.log("화면에 들어옴!");
      } else {
        // 요소가 화면에서 나갔을 때
        console.log("화면에서 나감!");
      }
    });
  },
  {
    threshold: 0.1, // 10%만 보여도 콜백 실행
  },
);

// 관찰할 요소 등록
const target = document.querySelector("#target");
observer.observe(target);

// 관찰 중지
observer.unobserve(target);
```

**2단계 - react.intersection-observer 라이브러리**
바닐라 JS API를 React hooks 형태로 쉽게 사용할 수 있도록 래핑한 라이브러리다.

```bash
npm i react-intersection-observer
```

```tsx
import { useInView } from "react-intersection-observer";

function Component() {
  const { ref, inView } = useInView();
  // ref: 관찰할 요소에 붙일 ref
  // inView: 현재 화면에 보이면 true, 아니면 false
  useEffect(() => {
    if (inView) {
      console.log("화면에 들어옴!");
    }
  }, [inView]);

  return <div ref={ref}>이 요소를 관찰한다</div>;
}
```

---

**무한스크롤 패턴 이해**

```
[목록 끝에 빈 div 배치]
          ↓
[Intersection Observer로 이 div를 관찰]
          ↓
[스크롤해서 div가 화면에 들어오면 inView = true]
          ↓
[fetchNextPage() 호출 → 다음 페이지 데이터 로드]
          ↓
[새 데이터가 추가되면 div는 다시 화면 밖으로 밀려남]
          ↓
[다시 스크롤하면 반복]
```

---

- 코드 설명

---

## 📚 참고 자료

- [MDN - Intersection Observer API](https://developer.mozilla.org/ko/docs/Web/API/Intersection_Observer_API)
- [Heropy - Intersection Observer](https://www.heropy.dev/p/ydKoQO)
- [Velog - intersection observer란 feat. 무한스크롤](https://velog.io/@khy226/intersection-observer%EB%9E%80-feat-%EB%AC%B4%ED%95%9C-%EC%8A%A4%ED%81%AC%EB%A1%A4-%EB%A7%8C%EB%93%A4%EA%B8%B0)
