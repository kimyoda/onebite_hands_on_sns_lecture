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

2. Context, 상태 공유 정상 동작

3. CSS 상속은 적용되지 않는다.
