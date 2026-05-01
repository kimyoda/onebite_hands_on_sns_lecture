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

**A. 외래 키(Foregin Key)**

```
외래 키는 한 테이블의 칼럼이 다른 테이블의 기본 키를 참조한다
이를 통해 참조 무결성(Referential Integrity)을 보장한다.

post 테이블              profile 테이블
author_id (FK) ────────► id (PK)

외래 키 덕분에:
- 존재하지 않는 profile을 author_id로 넣을 수 없음
- Cascade 설정으로 profile 삭제 시 연관 post도 함께 처리 가능
```

B. 기본 키(Primary Key)
: 한 테이블 내에 각 행을 고유하게 시별하는 키, 테이블 간 관계 설정은 외래 키 역할
C. 인덱스(Index)
: 검색 속도를 높이기 위해 데이터 구조, 무결성 보장과 무관
D. 뷰(View)
: 쿼리 결과를 가상 테이블로 저장하는 기능, 관계설정이나 무결성 보장 기능이 없다

---

### 7. 무한 스크롤 데이터 가져오기 구현에 특화된 React Query 훅

**A. `useInfiniteQuery`**

```
`useInfiniteQuery`는 페이지 단위로 데이터를 누적해서 관리한다
`pageParam`으로 현재 페이지를 추적,
`getNextPageParam`으로 다음 페이지 여부를 판단한다.
```

```tsx
useInfiniteQuery({
  queryFn: ({ pageParam}) => fetchPosts({ from: pageParam * 5, to: pageParam * 5 + 4}),
  initialPageParram: 0,
  getNextPageParam: (lastpage, allPage) => {
    if (lastPage.length < 5) {
      // 마지막 페이지
      return undefined;
    }
    // 다음 페이지 번호
    return allPages.length;
  }
});

// 반환 구조
data.pages = [[id1, id2, id3, id4, id5], [id6, id7, id8, id9, id10], ...]
```

B. `useQuery`
: 일반적인 단건 데이터 조회, 페이지 누적 기능 없음, 한 번에 하나의 데이터만 관리
C. `useMutation`
: 데이터 생성/수정/삭제(CUD) 작업을 위한 훅, 데이터 조회와 무관
D. `useClientQuery`
: 존재하지 않는 훅

---

### Q8. 이미지가 포함된 게시물 삭제 시 누락된 이미지를 방지하는 핵심 단계

**A. 스토리지에서 관련 이미지 삭제**

```
DB에서 post를 삭제, Storage의 이미지 파일은 자동으로 삭제되지 않는다.
`onSuccess`에서 DB 삭제 성공 후 Storage 이미지도 함께 삭제해야하고 파일(orphan files)가 쌓이는 것을 방지할 수 있다.
```

```ts
onSuccess: async (deletedPost) => {
  // 1. DB 삭제 완료
  // 2. Storage 이미지도 삭제
  if (deletedPost.image_urls?.length > 0) {
    await deleteImagesInPath(`${deletedPost.author_id}/${deletedPost.id}`);
  }
};
```

B. 데이터베이스 이미지 URL 제거
: DB에서 post 행을 삭제하면 image_url도 함꼐 사라짐, 이미 DB 삭제로 처리, Storage 파일이 남는게 문제
C. 캐시에서 게시물 데이터 무효화
: 캐시 처리는 UX를 위한 것이고 이미지 누락과 무관, `resetQueries`는 화면 갱신용
D. 게시물 ID를 이용한 재확인
: 삭제 전 확인단계는 AlertModal로 이미 처리, 단계가 아님

---

### Q9. 무한 스크롤 데이터의 `staleTime`을 `Infinity`로 설정하는 이유

**A. 불필요한 재요청 방지.**

```
무한 스크롤은 여러 페이지의 데이터를 누적해서 들고 있다.
`staleTime: 0`이면 전환, 마운트 등 조건마다 리패칭이 발생, 쌓아놓은 페이지 데이터가 모두 초기화 될 수 있다.
`staleTime: Infinity`로 설정, 명시적으로 `resetQueries`를 호출하지 않으면 자동 리페칭이 발생하지 않아 누적된 데이터를 안정적으로 유지할 수 있다.
```

```ts
// 무한 스크롤 쿼리에 적합한 설정
useInfiniteQuery({
  staleTime: Infinity, // 자동으로 stale되지 않음
  // 생성/삭제 후에는 명시적으로 resetQueries 호출
});
```

B. 데이터 즉시 최신화
: `staleTime: Infinity`는 오히려 자동 최신화를 막는다, 반대 개념
C. 메모리 사용량 감소
: staleTime은 메모리가 아닌 네트워크 요청 타이밍을 제어, 무관한
D. 서버 부하 증가
: `staleTime: Infinity`는 오히려 서버 요청을 줄인다, 반대 개념

---

### Q10. 데이터 행별 접근 제어를 가능하게 하는 Supabase 기능

**A. 행수준보안(RLS, Row Level Security)**

```
RLS는 PostgresSQL의 보안 기능, 테이블의 각 행(Row)에 대한 접근 권한을 정책(Policy)로 세밀하게 설정
클라이언트 코드가 아닌 **DB레벨**에서 강제되어 우회가 불가능하다
```

```sql
-- 본인 게시글만 수정 가능
create policy "Authenticated users can update own post"
on "public"."post"
for UPDATE
to authenticated
using ((select auth.uid()) = author_id)
with check ((select auth.uid()) = author_id);
```

B. 인증 규칙(Auth Rules)
: Supabase Auth의 로그인, 회원가입 설정, 접근 권한이 아닌 인증 방식을 관리
C. 함수 트리거(Function Triggers)
: DB이벤트 발생 시 자동으로 실행되는 함수, 권한 제어가 아닌 자동화 로직에 사용
D. 스토리지 정책(Storage Policies)
: Storage 버킷의 파일 접근 권한 설정, DB 테이블 행이 아닌 Storage 파일에 적용되는 정책
