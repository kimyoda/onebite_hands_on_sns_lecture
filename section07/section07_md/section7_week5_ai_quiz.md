## section07_4weeks_ai_quiz

### 1. Q1. 모달의 CSS/Z-index 충돌을 방지하는 React 기능은?

```
`createPortal`은 컴포넌트를 React 트리상의 위치는 유지, 실제 DOM에서 다른 위치에 렌더링하는 기능이다.
`document.body` 또는 별도의 `#modal-root`에 렌더링하면 부모의 `overflow:hidden`, `z-index`, `transform`등 CSS에 전혀 영향받지 않는다.
```

```tsx
// index.html
<div id="root"></div>
<div id="modal-root"></div>  ← 모달이 여기에 렌더링됨

// ModalProvider.tsx
createPortal(<Modal />, document.getElementById("modal-root")!)
```

**A. `ReactDOM.createPortal`**

B. `React.Context`
: 여러 요소를 하나로 묶는 래퍼, DOM구조를 바꾸지 않으므로 Z-index 문제 해결 불가
C. `React.Context`
: 컴포넌트 트리 전체에 데이터를 전달하는 전역상태 도구, 데이터 공유 기능
D. `useImpreativeHandle`.
: `ref`를 통해 자식 컴포넌트의 메서드를 부모에 호출할 수 있게 하는 훅, DOM 위치와 전혀 관련없음

---

### 2. 모달 상태 관리에 지역 상태보다 Zustand를 사용하는 주된 이유

- `useState`로 관리하는 지역 상태와 Zustand 전역 상태와 차이점을 이해하는 지 묻는 것

```
모달을 `useState`로 관리하는 해당 컴포넌트에서 열고 닫을 수 있다.
Zustand로 전역 관리하면 앱의 어떤 컴포넌트에서 모달을 열 수 있고, `AlertModal`처럼 게시글 삭제, 로그아웃, 회원 탈퇴 등 여러 곳에서 재사용 할 수 있다.
```

```tsx
// 어디서든 호출 가능
const openAlertModal = useOpenAlertModal();
openAlertModal({ title: "삭제하시겠습니까?", onPositive: () => deletePost() });
```

**A. 서버에서 사용자 상태를 실시간으로 관리하기 용이하다.**

B. 렌더링 성능 향상
: 성능 최적화는 Zustand의 부수적 장점이자 주된 이유가 아님. 모달에 선택하는 핵심 이유가 아니다
C. 토큰 도난 시 보안 위험이 전혀 없다.
: 스토어 파일이 추가되어 코드량은 늘어날 수 있다, 작은 단일 컴포넌트에서 `useState`가 코드량이 더 적다
D. 구현 복잡도가 훨씬 낮다.
: Zustand는 별도 설치가 필요한 서드파티 라이브러리, React에 내장된 기능이 아니다

---

### 3. 이미지 파일을 데이터베이스에 직접 저장하지 않는 주된 이유

- 이미지를 DB에 저장하지 않고 Storage 서비스를 따로 이유

```
DB는 텍스트, 숫자, 날짜 등 구조화된 데이터를 관리하도록 최적화되어 있다.
대용량 이미지/동영상을 직접 저잗 DB 용량이 빠르게 차고 쿼리 성능이 크게 떨어진다.
Supabase Storage철머 펼도 파일 저장소를 사용, DB에는 이미지 URL(짧은 문자열)만 저장, 실제 파일은 CDN으로 제공할 수 있다.

DB (post 테이블):
image_urls: ["https://...supabase.co/storage/v1/object/public/uploads/..."]
                ↑ URL만 저장 (짧은 문자열)

Storage (uploads 버킷):
실제 이미지 파일 저장 → CDN으로 빠른 전송
```

**A. 파일 크기가 크기 때문**
B. 보안문제
: 보안도 고려 사항, 주된 이유는 아니다. RLS 정책으로 보안 설정이 가능
C. 접근 속도 저하
: DB에서 이미지를 불러오고 느리긴 하나 파일 크기 문제의 결과, 근본 원인은 대용량 파일이 DB에 부적합
D. 관리 복잡성
: Storage를 따로 관리하는 것이 더 복잡, 주된 이유가 아님

---

### 4. 이미지 삭제 용이성을 위해 권장되는 스토리지 경로 구조

**A. userId/postId/imageName** -> 계층 구조로 경로를 설계해 폴더 단위 일괄 삭제가 가능하다

```
uploads/
└── user-uuid-abc/           ← 유저 탈퇴 시 이 폴더 전체 삭제
    └── post-1/              ← 게시글 삭제 시 이 폴더 전체 삭제
        ├── 1745000000-uuid1.jpg
        └── 1745000000-uuid2.png

// 게시글 삭제 시
deleteImagesInPath(`${userId}/${postId}`)

// 유저 탈퇴 시
deleteImagesInPath(`${userId}`)
```

B. postType/date/ImageName
: 날짜나 타입 기준은 특정유저/게시글이미지를찾기 어렵다, 삭제 시 연관 이미지를 한 번에 찾을 수 없다
C. bucketName/ImageName
: 계층 구조 없이 평면적으로 저장, 이미지가 뒤섞이다 -> 게시글/유저별 구분이 불가능
D. category/userId/ImageName
: postId가 없으며 게시글 단위 삭제가 불가능, 특정 게시글이 이미지만 삭제하기 어렵다

---

### 5. `URL.createObjectURL`로 할당된 브라우저 메모리를 해제하는 함수

**A. `URL.revokeObjectURL`**

```
`URL.createObjectURL(file)`은 파일을 서버에 업로드 하지 않고
브라우저 메모리에 임시 URL(`blob:http://...`)을 생성한다
이 URL은 수동으로 해제하지 않고 탭을 닫을때까지 메모리에 남는다. 를 호출하면 해당 blob URL이 즉시 해제된다.
```

```tsx
// 이미지 삭제 시 메모리도 함께 해제
const handleDeleteImage = (image: Image) => {
  setImages((prev) =>
    prev.filter((item) => item.previewUrl !== image.previewUrl),
  );
  URL.revokeObjectURL(image.previewUrl); // 메모리 해제
};
```

B. URL.deleteObjectURL
: 존재하지 않는 메서드
C. URL.releaseObjectURL
: 존재하지 않는 메서드
D. URL.clearObjectURL
: whswogkwl dksgsms aptjem

---

### 6. 두 데이터베이스 테이블의 관계와 무결성을 보장하는 기능

A. API 요청을 강제로 시도하기 위해
B. 기본 키(Primary Key)
: 존재하지 않는 메서드
C. 인덱스(Index)
: 존재하지 않는 메서드
D. 뷰(View)
: whswogkwl dksgsms aptjem

---

### 7. Supabase의 `AuthError` 객체 중 에러 메시지 현지화에 도움이 되는 속성은 무엇인가?

A. `message`
B. `status`
**C. `code`** -> `AuthError` 객체의 `code` 속성은 특정 오류 유형(`invaild_credentials`)을 나타낸다. 이 코드를 사용하여 상황에 맞는 현지화된 메시지를 사용자에게 제공할 수 있다.
D. `name`

---

### 8. Zustand에서 세션 스토어를 Supabase 인증 상태와 동기화하기 위해 어떤 이벤트가 사용되었는지?

A. `onSignin`
B. `onSignUp`
**C. `onAuthStateChange`** -> Supabase 클라이언트의 `onAuthStateChange` 이벤트 핸들러는 인증 상태가 변경될 때마다 트리거 된다. 활용하여 Zustand 스토어의 세션 데이터를 실시간으로 업데이트 할 수 있다.
D. `onTokenRefresh`

---

### 9. 웹 애플리케이션 `게스트 전용` 라우트 가드(Guest-Only Route Guard)의 목적은 무엇인가?

**A. 로그인하지 않은 사용자만 접근을 허용한다.** -> '게스트 전용 가드'는 회원가입이나 로그인 페이지 처럼, 이미 로그인한 사용자가 접근해서는 안 되는 페이지에 적용된다. 로그인한 사용자는 다른 페이지로 리다이렉트된다.
B. 로그인한 사용자만 접근을 허용한다.
C. 모든 사용자의 접근을 차단한다.
D. 특정 역할의 사용자만 접근을 허용한다.

---

### 10. 회원가입 시 프로필 자동 생성에 데이터베이스 트리거 대신 애플리케이션 로직이 선호되는 이유는 무엇인지?

A. 데이터베이스 트리거는 성능 오버헤드가 더 큰다.
**B. 애플리케이션 로직이 에러 처리에 더 유연한다.** -> 데이터베이스 트리거는 에러 처리나 복잡한 로직 구현에 제약이 많다. 반면 애플리케이션 로직은 에러를 상세하게 다루고 유연하게 후속 조치를 취할 수 있어 더 선호된다.
C. 데이터베이스 트리거는 Supabase에서 지원되지 않는다.
D. 애플리케이션 로직이 구현하기 더 간단하다.

```

```
