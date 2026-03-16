## section05_ai_quiz

### Hanip Log 프로젝트의 백엔드와 배포에 사용되는 클라우드 서비스는 무엇인가요?

- Baas(Backend as a Service)와 배포 플랫폼을 활용

* Supabase란?

- 오픈 소스 기반의 Baas플랫폼이다.
  | 기능 | 설명 |
  |---|---|
  | **PostgreSQL DB** | 관계형 데이터베이스를 클라우드로 제공 |
  | **인증(Auth)** | 이메일/소셜 로그인 등 인증 기능 내장 |
  | **스토리지** | 파일 업로드 및 관리 |
  | **실시간(Realtime)** | 데이터 변경을 실시간으로 구독 가능 |
  | **자동 REST API** | DB 테이블 기반으로 API 자동 생성 |

* Vercel?

- 프론트엔드 애플리케이션 전문 배포 플랫폼이다.
- Next.js를 만든 회사, React 프로젝트 배포에 최적화되어 있다.

| 특징            | 설명                               |
| --------------- | ---------------------------------- |
| **간편한 배포** | GitHub 연동으로 Push 시 자동 배포  |
| **CDN**         | 전 세계 엣지 서버를 통한 빠른 응답 |
| **무료 티어**   | 개인 프로젝트 무료 호스팅 가능     |
| **환경 변수**   | 대시보드에서 손쉽게 환경 변수 관리 |

A. AWS S3 및 CloudFront -> AWS S3는 파일 저장소, CloudFront는 CDN 서비스이다. 정적 웹사이트 배포에 사용할 수 있으나, 백엔드 기능을 별도로 구축해야하여 초기 설정이 복잡하다.
B. Google Cloud Platform 및 Netify - GCP는 구글의 클라우드 서비스, Netlify는 AWS와 유사한 배포 플랫폼이다.
**C. Supabase, Vercel** -> 해당 프로젝트에서 사용하는 플랫폼.
D. Azure Functions 및 Heroku -> Microsoft의 서버리스 함수 서비스와 PaaS 플랫폼이다. 유효한 서비스이나 해당 프로젝트와는 상고ㅓㅏㄴ이 없다.

---

### React 프로젝트에서 전역 상태 관리를 위해 주로 사용되는 라이브러리는 무엇인가요?

- React에서 여러 컴포넌트가 공유해야 하는 데이터를 **전역 상태(Global State)**라고 한다.

* Zustand

- Zustand는 상태를 의미, 가볍고 직관적인 React 전역 상태 관리 라이브러리이다.

```js
// Zustand 스토어 생성 예시
import { create } from "zustand";

const useUserStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

// 컴포넌트에서 사용
function Header() {
  const user = useUserStore((state) => state.user);
  return <div>{user?.name}</div>;
}
```

**주요 전역 상태 관리 라이브러리 비교:**

| 라이브러리        | 특징                                 | 러닝 커브 | 번들 크기 |
| ----------------- | ------------------------------------ | --------- | --------- |
| **Context API**   | React 내장, 별도 설치 불필요         | 낮음      | 없음      |
| **Redux Toolkit** | 강력한 기능, 대규모 앱에 적합        | 높음      | 큼        |
| **Zustand**       | 가볍고 직관적, 보일러플레이트 최소   | 낮음      | 매우 작음 |
| **Recoil**        | 원자(atom) 단위 상태 관리, Meta 개발 | 중간      | 작음      |

A. React Context API -> React에 내장된 상태 공유 방법, 상태가 변경될때 해당 Context를 구독하는 모든 컴포넌트가 리렌더링됨
B. Redux Toolkit -> Redux의 현대화 버전, 슬라이스 , 액션, 리듀서 등 설정해야할 것이 많다.
**C. Zustand** -> 전역 상태 관리 라이브러리. 직관적인 API도입으로 해당 프로젝트 채택
D. Recoil -> Meta에서 만든 라이브러리, atom/selector 개념을 사용, 유효한 라이브러리이나 관리가 이루어지지 않음

---

### React Router에서 일치하지 않는 경로를 다른 페이지로 리다이렉트할 때 사용하는 컴포넌트는 무엇인가요?

- React Router는 SPA(Single Page Application)에서 페이지 이동을 관리하는 라이브러리이다. v6로 업그레이드 되며 일부 컴포넌트가 교체

* `<Navigate>` 컴포넌트?

- React Router v6에 도입된 컴포넌트, 특정 경로로 **프로그래밍적 이동(리다이렉트)**를 담당한다. v5의 `<Redirect>`를 대체한다.

```js
import { Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />

      {/* 존재하지 않는 경로 → 홈으로 리다이렉트 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
```

A. `<Redirect>` -> React Router v5에서 사용하던 리다이렉트 컴포넌트다. 대체되었다.
B. `<Switch>` -> `<Routes>`로 대체되었다.
C. `<Route to='...'>` -> `<Route>` 컴포넌트 경로를 정의하는 역할이다. `path` prop을 사용
**D.`<Navigate>`** -> React Router v6 리다이렉트를 담당하는 컴포넌트. `to` prop으로 이동할 경로를 지정, `replace` prop으로 브라우저 히스토리 처리 방식을 설정할 수 있다.

---

### 전역 레이아웃 내에서 중첩된 자식 라우트의 콘텐츠를 렌더링하는 React Router 컴포넌트는 무엇인가요?

- 모든 페이지에 공통으로 보이는 영역(헤더, 사이드바, 푸터)과 페이지마다 바뀌는 영역이 있다. React Router v6의 `<Outlet>`은 쉽게 구현하게 해준다.

* `<Outlet>` 컴포넌트

- 부모 라우트의 레이아웃 안에서 자식 라우트가 렌더링될 위치를 지정하는 컴포넌트다.

```js
// 1. 전역 레이아웃 컴포넌트
function Layout() {
  return (
    <div>
      <Header /> {/* 모든 페이지에 공통 표시 */}
      <Sidebar /> {/* 모든 페이지에 공통 표시 */}
      <main>
        <Outlet /> {/* 여기에 자식 라우트 컨텐츠가 렌더링됨 */}
      </main>
      <Footer /> {/* 모든 페이지에 공통 표시 */}
    </div>
  );
}

// 2. 라우트 설정
function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {" "}
        {/* 부모: 레이아웃 */}
        <Route index element={<Home />} /> {/* → Outlet 위치에 렌더링 */}
        <Route path="about" element={<About />} />{" "}
        {/* → Outlet 위치에 렌더링 */}
        <Route path="blog" element={<Blog />} /> {/* → Outlet 위치에 렌더링 */}
      </Route>
    </Routes>
  );
}
```

A. `<Children>` -> React에서 `children`은 컴포넌트에 전달되는 자식 요소를 가리키는 props다. 이런 컴포넌트는 존재하지 않는다.
\*\*B. `<Outlet>` -> React Router v6의 컴포넌트, 부모 라우트 레이아웃 안에서 자식 라우트 컨텐츠가 렌더링될 위치를 지정한다.
C. 아래와 동일
D. 존재하지 않는 컴포넌트

---

### Supabase 무료 티어 프로젝트는 어떤 조건에서 자동으로 일시 중지될 수 있나요?

- **A. 데이터베이스 용량 초과 시** — 무료 티어의 DB 용량 한도(500MB)를 초과하면 추가 저장이 제한될 수 있지만, 프로젝트 자체가 **자동 중지**되지는 않습니다. 용량 초과는 별도의 경고와 제한이 적용됩니다.

**B. 7일간 활동이 없을 경우** ->Supabase 무료 티어의 핵심 제약입니다. 7일 이상 DB 접근이 없으면 서버 자원 절약을 위해 프로젝트가 자동으로 일시 중지됩니다.
