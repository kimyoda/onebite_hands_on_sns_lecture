## section07\_포스트 추가

## 포스트 추가

---

## React createPortal

> 컴포넌트를 부모의 DOM 바깥, 다른 DOM 노드에 렌더링하는 기능

일반적으로 React 컴포넌트는 부모 컴포넌트 안에 렌더링된다.

```jsx
<div id="root">
  <App>
    <Header />
    <Main>
      <Modal /> ← 일반 방식: 부모 안에 갇혀서 렌더링됨
    </Main>
  </App>
</div>
```

createPortal을 사용, 선언은 부모 안에서 하지만 실제 DOM 렌더링은 완전히 다른 위치에서 이뤄진다.

```jsx
<div id="root">
  <App>
    <Header />
    <Main>
      {/* Modal은 여기서 선언 */}
    </Main>
  </App>
</div>

<div id="modal-root">
  <Modal />   ← Portal: 실제로는 여기에 렌더링됨
</div>
```

- 부모 컴포넌트에 `overflow: hidden`이나 `z-index` 스타일이 적용되었다면 자식 컴포넌트가 아무리 `z-index`를 높여도 부모 밖으로 나갈 수 없다.

```jsx
문제 상황:
<div style={{ overflow: hidden, position: relative }}>
  <Modal />   ← z-index를 높여도 이 div 안에 갇혀버림
</div>

해결:
createPortal로 Modal을 document.body에 렌더링
→ overflow, z-index 제약에서 완전히 탈출
```

- 모달, 툴팁, 드롭다운처럼 화면 위에 올라와야 하는 UI에 필수적인 기능이다.

---

### 기본문법

```ts
import { createPortal } from 'react-dom';

createPortal(children, domNode, key?)
```

| 인자       | 타입          | 설명                             |
| ---------- | ------------- | -------------------------------- |
| `children` | ReactNode     | 렌더링할 React 컴포넌트 또는 JSX |
| `domNode`  | DOM Element   | 실제로 렌더링될 대상 DOM 노드    |
| `key`      | string (선택) | 포털의 고유 키                   |

### 기본 사용 예시

index.html - modal 전용 DOM 노드 준비

```html
<body>
  <div id="root"></div>
  <!-- React 앱 루트 -->
  <div id="modal-root"></div>
  <!-- Modal 전용 노드 -->
</body>
```

Modal.tsx

```tsx
import { createPortal } from "react-dom";

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return createPortal(
    // 1번째 인자: 렌더링할 JSX
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{ background: "white", padding: "20px", borderRadius: "8px" }}
      >
        {children}
        <button onClick={onClose}>닫기</button>
      </div>
    </div>,

    // 2번째 인자: 렌더링될 DOM 노드
    document.getElementById("modal-root")!,
  );
}
```

App.tsx

```tsx
import { useState } from "react";

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <h1>내 앱</h1>
      <button onClick={() => setIsOpen(true)}>모달 열기</button>

      {/*
        Modal은 App 안에서 선언됐지만
        실제 DOM에서는 #modal-root 안에 렌더링된다.
        부모의 overflow, z-index 제약을 완전히 벗어난다.
      */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2>모달 내용</h2>
        <p>이 내용은 #modal-root 안에 렌더링됩니다!</p>
      </Modal>
    </div>
  );
}
```

---

### 주요 특징

1. DOM 위치는 달라도 이벤트는 React 트리를 따른다

- Portal에서 발생한 이벤트는 DOM 트리가 아닌 React트리를 따라 전파된다.
- Portal이 `<div onClick>` 안에 선언되어 있으면, 포털 내부를 부모의 onClick이 실행된다.

```tsx
<div onClick={() => console.log("부모 클릭!")}>
  {" "}
  // ← 이것도 실행됨
  {createPortal(
    <button>클릭</button>, // 다른 DOM 위치에 있지만
    document.body, // 이벤트는 React 트리를 따라 위로 전파
  )}
</div>
```

2. Context, 상태 공유 정상 동작

- Portal은 React 트리 내에 그대로 존재, Context, props 상태 등이 DOM 위치와 무관하게 정상 작동한다.

```tsx
<ThemeContext.Provider value="dark">
  {createPortal(
    <Modal />, // ThemeContext를 정상적으로 사용 가능
    document.body,
  )}
</ThemeContext.Provider>
```

3. CSS 상속은 적용되지 않는다.

- Portal은 다른 DOM 위치에 렌더링되어 부모의 CSS 속성을 상속받지 않는다.

```tsx
<div style={{ color: "red" }}>
  <p>이건 빨간색</p>
  {createPortal(<p>이건 빨간색 아님 (CSS 상속 안 됨)</p>, document.body)}
</div>
```

---

### 📊 일반 렌더링 vs createPortal 비교

```
일반 렌더링:
React 트리          DOM 트리
App                 #root
└── Main             └── div.main
    └── Modal            └── div.modal  ← 부모 안에 갇힘

────────────────────────────────────────────────

createPortal:
React 트리          DOM 트리
App                 #root
└── Main             └── div.main
    └── Modal            (모달 없음)

                    #modal-root
                     └── div.modal  ← 부모 밖으로 탈출

React 트리상: Main의 자식 (Context, 이벤트 등 정상 동작)
DOM 트리상: #modal-root의 자식 (CSS 제약에서 자유)
```

---

### 🎯 주요 사용 사례

| 사용 사례          | 이유                                       |
| ------------------ | ------------------------------------------ |
| **모달 (Modal)**   | 전체 화면을 덮는 오버레이가 필요           |
| **툴팁 (Tooltip)** | overflow: hidden에 갇히지 않아야 함        |
| **드롭다운 메뉴**  | 다른 요소 위에 올라와야 함                 |
| **토스트 알림**    | 항상 화면 최상단에 표시해야 함             |
| **팝업**           | z-index 제약 없이 전체 화면 기준 위치 필요 |

---

### 주의사항

**domNode는 이미 존재하는 노드를 사용해야 한다**

```tsx
// 잘못된 방식 - 렌더링 중에 새로 만들면 안 됨
createPortal(<Modal />, document.createElement("div"));

// 올바른 방식 - 이미 존재하는 DOM 노드 사용
createPortal(<Modal />, document.getElementById("modal-root")!);
createPortal(<Modal />, document.body);
```

**접근성(Accessibility) 관리 필요**

모달철머 포커스가 필요한 UI에서 키보드 포커스 관리가 중요하다.

- 모달이 열리면 포커스를 모달 안으로 이동
- 모달이 닫히면 원래 요소로 포커스 복귀
- Tab 키가 모달 밖으로 나가지 않도록 처리

**domNode가 업데이트 시 바뀌면 포탈 컨텐츠가 재생성된다**

---

> createPortal은 React 16부터 지원되는 기능,
> "부모 DOM의 제약을 벗어나야 하지만 React 트리는 유지하고 싶을 때" 사용하는 것이 중요하다
> 모달, 툴팁, 드롭다운, 토스트 등 UI에서 거의 필수적으로 활용한다.
