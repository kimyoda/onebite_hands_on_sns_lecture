## section07*15*포스트인가\_구현하기

## 포스트인가 구현하기

- 인증된 사용자가 -> 1번 포스트 삭제 -> 웹서버가 권한을 체크해서
- 요청한 동작을 수행하도록 하는걸 인가라고 한다.

**RLS(Row Level Security)**

- 각각의 행에 권한을 부여하는 것
- 포스트 테이블에 author_id 즉 해당 포스트를 직접 작성한 수행자만 할 수 있도록 인가를 설정할 수 있다.

인가(Authorization)란?

> 인증된 사용자가 특정 행위를 할 수 있는 권한이 있는지 확인하는 것

```
인증(Authentication): "이 사람이 누구인가?" -> 로그인
인가(Authorization): "이 사람이 이걸 해도 되는가?" -> 권한 확인

예시:
로그인한 사용자가 1번 포스트 삭제 요청
-> 서버 "이 사람이 1번 포스트 작성자인가?" 확인 -> 맞으면 삭제 -> 아니면 거부
```

---

## 🔒 RLS(Row Level Security)란?

> **"테이블의 각 행(Row)에 대한 접근 권한을 세밀하게 제어하는 PostgreSQL 보안 기능"**

```
RLS 없다면:
누구든 post 테이블 전체에 SELECT, INSERT, UPDATE, DELETE 가능
-> 다른 사람 게시글도 마음대로 수정/삭제 가능

RLS 활성화 후:
각 행마다 "누가 행에 접근할 수 있는가?"를 정책(Policy)으로 설정
-> 내 게시글만 수정/삭제 가능
-> 다른 사람 게시글에 접근 불가
```

---

## RLS 활성화

```
post 테이블: RLS DISABLED
profile 테이블: RLS DISABLED
→ 현재 누구나 모든 행에 접근 가능한 위험한 상태
→ RLS를 활성화하고 정책을 설정해야 한다
```

---

### SELECT 정책 (조회)

```sql
create policy "Anyone can select post"
on "public"."post"
as PERMISSIVE
for SELECT
to public
using (
  true
);
```

> "누구든(비로그인 포함) post 테이블의 모든 행을 조회할 수 있다"

| 항목           | 값               | 의미                 |
| -------------- | ---------------- | -------------------- |
| `for SELECT`   | 조회 작업에 적용 | 데이터 읽기          |
| `to public`    | 모든 역할 대상   | 비로그인 사용자 포함 |
| `using (true)` | 항상 참          | 모든 행 조회 허용    |

SNS 서비스는 게시글을 모든 사람이 볼 수 있어야 한다.
비로그인 사용자도 피드를 볼 수 있어야 하므로 `to public`으로 설정.

---

### INSERT 생성

```sql
create policy "Authenticated users can create post"
on "public"."post"
as PERMISSIVE
for INSERT
to authenticated
with check (
  (select auth.uid()) = author_id
);
```

> 로그인한 사용자가 post를 생성, 반드시 본인의 id를 author_id로 넣어야 한다

| 항목               | 값                | 의미                          |
| ------------------ | ----------------- | ----------------------------- |
| `for INSERT`       | 생성 작업에 적용  | 데이터 추가                   |
| `to authenticated` | 인증된 사용자만   | 비로그인 사용자는 INSERT 불가 |
| `with check (...)` | 삽입 시 조건 검증 | 조건이 false이면 거부         |

**`with check` 조건**

```sql
(select auth.uid()) = author_id
```

```
auth.uid()
-> 현재 로그인한 사용자의 UUID를 가져오는 Supabase 내장 함수


```
