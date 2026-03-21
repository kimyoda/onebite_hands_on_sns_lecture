## section06\_소셜로그인 이해하기

## 소셜 로그인

> **직접 회원가입 없이, 이미 가입된 다른 서비스 계정으로 로그인하는 방식**

- 구글, 카카오, 깃허브 등 기존에 사용하던 계정으로 새 서비스에 바로 로그인할 수 있게 해준다.
- 사용자 입장에서 편하고, 개발자 입장에서 비밀번호 관리, 이메일 인증 등의 복잡한 인증 로직을 외부에 위임할 수 있다.

---

## OAuth란?

> **Open Authorization - 열린 인가, 공개된 인가**

원래는 인가(Authorization)를 목적으로 만들어진 프로토콜이다. 사용자의 권한을 제3자 서비스에 안전하게 위임하는 것이 핵심이다.
-> 구글 캘린더 앱이 내 구글 계정의 일정에 접근할 수 있도록 허락

현재는 인가뿐만 아니라 인증(Authentication)목적으로 폭넓게 사용된다. 소셜 로그인이 대표적인 예다.

---

## OAuth 활용

예시

| 주체                       | 역할                                                          |
| -------------------------- | ------------------------------------------------------------- |
| **User (사용자)**          | 소셜 로그인을 시도하는 브라우저                               |
| **GitHub (외부 서버)**     | 사용자의 신원을 대신 검증해주는 소셜 서비스                   |
| **Supabase (백엔드 서버)** | 우리 앱의 백엔드. GitHub에서 인증 정보를 받아 사용자에게 전달 |

## OAuth 동작 흐름(GitHub 소셜로그인)

```
[1단계] 사용자가 소셜 로그인 버튼 클릭
─────────────────────────────────────────────────────
User  →  Supabase
GitHub으로 로그인
```

```
[2단계] Supabase가 GitHub 로그인 페이지 주소를 전달
─────────────────────────────────────────────────────
Supabase  →  User (브라우저)

GitHub 로그인 URL을 돌려준다:
https://github.com/login/oauth/authorize
  ?client_id=abc123        ← 앱을 GitHub에 등록하면 발급받는 ID
  &redirect_uri=https://...supabase.co/auth/v1/callback
                           ← 로그인 성공 후 돌아올 주소 (Supabase 서버)

client_id의 역할:
GitHub에게 "이 로그인 요청이 어떤 앱에서 온 건지" 알려주는 식별자.
```

```
[3단계] 브라우저가 GitHub 로그인 페이지로 이동
─────────────────────────────────────────────────────
User (브라우저)  →  GitHub

브라우저가 위 URL로 리디렉션된다.
사용자는 GitHub 로그인 화면을 보게 된다.
GitHub 아이디/비밀번호 입력 또는 이미 로그인된 상태라면 자동 처리.
```

```
[4단계] GitHub이 1회용 코드 발급 후 리디렉션
─────────────────────────────────────────────────────
GitHub  →  User (브라우저)

사용자가 GitHub 로그인에 성공하면
GitHub이 브라우저를 redirect_uri로 리디렉션시킨다:

https://...supabase.co/auth/v1/callback?code=XXXXXX

code=XXXXXX:
1회용 권한 코드 (Authorization Code).
이 코드는 단 한 번만 사용 가능하며 유효 시간이 매우 짧다.
이 코드 자체로는 아무것도 할 수 없고,
Supabase 서버가 이걸 GitHub에 제출해야 진짜 토큰을 받을 수 있다.
```

```
[5단계] Supabase가 code로 실제 인증 정보 요청
─────────────────────────────────────────────────────
Supabase  →  GitHub

브라우저에서 code를 받은 Supabase 서버가
GitHub 서버에 직접 code를 제출한다:

"이 code를 Access Token으로 교환"
```

```
[6단계] GitHub이 실제 인증 정보를 Supabase에 전달
─────────────────────────────────────────────────────
GitHub  →  Supabase

GitHub이 code를 검증하고 아래 정보를 돌려준다:
- Access Token  ← GitHub API를 사용할 수 있는 토큰
- Refresh Token ← Access Token 재발급용 토큰
- 사용자 정보    ← 이메일, 닉네임 등
```

```
[7단계] Supabase가 최종 인증 정보를 사용자에게 전달
─────────────────────────────────────────────────────
Supabase  →  User (브라우저)

Supabase가 받은 인증 정보를 기반으로
Supabase 자체 JWT (access_token, refresh_token)를 발급해서
브라우저 localStorage에 자동 저장한다.

이후부터는 이메일 로그인과 동일하게 동작한다.
```

```
[8단계] 이후 API 요청 시 토큰 검증
─────────────────────────────────────────────────────
User  →  Supabase  →  GitHub (필요 시)

Supabase 서버는 요청에 포함된 Access Token의
유효성을 검증한다.
필요한 경우 GitHub 서버에 직접 검증을 요청하기도 한다.
검증이 완료되면 브라우저에 응답을 돌려준다.
```

---

## 전체 흐름 보기

```
User                    Supabase                  GitHub
 │                          │                        │
 │  ① 소셜 로그인 요청       │                        │
 │ ─────────────────────▶  │                        │
 │                          │                        │
 │  ② GitHub 로그인 URL 응답 │                        │
 │ ◀─────────────────────  │                        │
 │                          │                        │
 │  ③ GitHub 로그인 페이지 이동                       │
 │ ────────────────────────────────────────────────▶ │
 │                          │                        │
 │  ④ 로그인 성공 → 1회용 code 발급 후 리디렉션        │
 │ ◀──────────────────────────────────────────────── │
 │                          │                        │
 │  ⑤ code를 Supabase로 전달 │                        │
 │ ─────────────────────▶  │                        │
 │                          │  ⑥ code → Token 교환   │
 │                          │ ──────────────────────▶│
 │                          │  ⑦ Access/Refresh Token│
 │                          │ ◀──────────────────────│
 │  ⑧ Supabase JWT 발급     │                        │
 │    localStorage 자동 저장 │                        │
 │ ◀─────────────────────  │                        │
```

---

## 💡 왜 1회용 code를 쓰는가?

> **브라우저에 토큰을 직접 노출하지 않기 위해서**

- Access Token을 URL에 바로 담아서 전달하면, 브라우저 히스토리, 서버 로그, 중간 프록시 등에 토큰이 노출될 수 있다.

1회용 code를 중간에 끼우면:

- 브라우저 URL 내에 잠깐 code만 노출된다.
- 실제 토큰은 **서버 간 통신(Supabase - Github)** 으로만 전달된다.
- code는 1회 사용 후 즉시 만료되어 탈취해도 의미가 없다.

---

## 소셜 로그인 설정 순서

```
1. GitHub에서 OAuth App 등록 → Client ID, Client Secret 발급
2. Supabase에 Client ID, Client Secret 입력
3. GitHub OAuth App에 Supabase Callback URL 등록
4. 코드 작성
```

---

### GitHub → Settings → Developer Settings → OAuth Apps

이미지 1처럼 처음엔 등록된 OAuth App이 없다.
`New OAuth app` 버튼을 클릭해서 새로 등록한다.

### 등록 시 입력 항목 (이미지 3)

| 항목                           | 설명                                    | 예시                    |
| ------------------------------ | --------------------------------------- | ----------------------- |
| **Application name**           | OAuth App 이름 (사용자에게 표시됨)      | `onebite-log`           |
| **Homepage URL**               | 앱의 홈페이지 URL                       | `http://localhost:5173` |
| **Application description**    | 앱 설명 (선택)                          | 생략 가능               |
| **Authorization callback URL** | 로그인 성공 후 GitHub이 리디렉션할 주소 | Supabase Callback URL   |

**Authorization callback URL이 핵심이다.**
여기에 Supabase가 제공하는 Callback URL을 입력해야
GitHub 로그인 성공 후 Supabase 서버로 code가 전달된다.

### 등록 완료 후 발급되는 값

```
Client ID:      0v23liyvF6UeqhPo0LYT   ← GitHub이 우리 앱에게 발급한 식별자
Client secrets: (별도로 Generate 필요)  ← 서버 간 통신에 사용하는 비밀 키
```

**Client ID** — 공개되어도 되는 값. OAuth 요청 시 URL에 포함된다.
**Client Secret** — 절대 공개하면 안 되는 값. Supabase 서버가 GitHub에 토큰 교환 요청 시 사용한다.

### GitHub 권한 허가 화면

설정이 완료된 후 GitHub 로그인 버튼을 클릭하면
이미지 7처럼 GitHub의 권한 허가 화면이 나타난다.

```
URL: github.com/login/oauth/authorize
  ?client_id=0v23liyvF6UeqhPo0LYT   ← 우리 앱의 Client ID
  &redirect_uri=...supabase.co/...   ← 성공 시 돌아올 주소
```

화면에 표시되는 내용:

- **Authorize onebite-log** — 우리 앱 이름 (GitHub에 등록한 Application name)
- **Personal user data / Email addresses (read-only)** — 요청하는 권한 목록
- **Authorizing will redirect to ...supabase.co** — 허가 후 이동할 주소

`Authorize kimyoda` 버튼을 클릭하면 OAuth 흐름이 진행된다.

---

### 서버 응답 - 유저 정보

```
user: {
  id:                "e7c78145-..."
  app_metadata:      { provider: "github", providers: ["github"] }  ← 소셜 로그인 출처
  email:             "rladygks1210@naver.com"   ← GitHub 계정 이메일
  email_confirmed_at: "2026-03-20T18:15:07..."
  is_anonymous:      false
  role:              "authenticated"
  user_metadata:     { avatar_url: "https://avatars.githubusercontent.com/..." }
}
```

## Google OAuth 연동 완성 정리

#### Google 권한 허가 화면

Google Cloud Console에서 Client ID / Secret 발급 경로
Google Cloud Console(console.cloud.google.com)에 접속해서 프로젝트가 선택된 상태에서 진행해요.

2026-03-21 기준 Google Cloud Console UI에서는 예전의 `API 및 서비스 > OAuth 동의 화면` 대신
`Google 인증 플랫폼 > 브랜딩` 메뉴로 표시될 수 있어요.

#### 순서

- 1단계 OAuth 동의 화면 설정

```
좌측 햄버거 메뉴(≡)
→ Google 인증 플랫폼
→ 브랜딩
→ 앱 정보, 대상, 연락처 정보 입력
→ 만들기
→ 필요한 항목 저장 후 계속

```

<img
  src="/Users/kimyohan/개발-프론트(js, ts)/onebite_hands_on_sns_lecture/section06/section06_md/image.png"
  alt="Google 인증 플랫폼 브랜딩 만들기 화면"
/>

- 위 화면에서 앱 이름, 사용자 지원 이메일, 개발자 연락처 이메일 등을 입력한다.
- 테스트 단계에서는 대상(User Type)을 외부로 두고 진행하면 된다.

- 2단계 - 사용자 인증 정보 만들기

```
좌측 메뉴
→ Google 인증 플랫폼 또는 사용자 인증 정보
→ 상단 [+ 사용자 인증 정보 만들기] 클릭
→ OAuth 클라이언트 ID 선택
→ 애플리케이션 유형: 웹 애플리케이션
→ 이름: onebite-log (자유)
→ 승인된 리디렉션 URI 추가:
   https://tpiglvcgkhxeltxqqhmd.supabase.co/auth/v1/callback
   (이미지 2의 Callback URL 그대로 복사해서 붙여넣기)
→ 만들기
```

<img
  src="/Users/kimyohan/개발-프론트(js, ts)/onebite_hands_on_sns_lecture/section06/section06_md/image-2.png"
  alt="Google Cloud 사용자 인증 정보 화면"
/>

`+ 사용자 인증 정보 만들기` 버튼을 누르면 아래처럼 드롭다운이 열리고,
여기서 `OAuth 클라이언트 ID`를 선택하면 된다.

<img
  src="/Users/kimyohan/개발-프론트(js, ts)/onebite_hands_on_sns_lecture/section06/section06_md/image-3.png"
  alt="OAuth 클라이언트 ID 선택 화면"
/>

- 3단계 - Client ID / Secret 복사

```
만들기 완료 후 팝업에서
Client ID, Client Secret이 바로 표시됨
→ 이 값을 이미지 2의 Supabase Google 설정에 붙여넣기
```

<img
  src="/Users/kimyohan/개발-프론트(js, ts)/onebite_hands_on_sns_lecture/section06/section06_md/image-4.png"
  alt="OAuth 클라이언트 생성 완료 화면"
/>

- 생성된 `Client ID`와 `Client Secret`을 복사해서 Supabase의 `Authentication > Providers > Google`에 붙여넣는다.
- Supabase Google Provider 설정 화면의 `Callback URL`은 Google Cloud의 `승인된 리디렉션 URI`에 반드시 동일하게 등록한다.
