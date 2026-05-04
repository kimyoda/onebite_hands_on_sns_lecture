## section08*2*좋아요\_기능추가

## 🧠 왜 일반 API 대신 RPC(Database Function)를 사용하는가?

좋아요 기능은 단순히 `like` 테이블에 행을 추가/삭제하는 것만으로는 부족하다.
`post` 테이블의 `like_count`도 함께 업데이트해야 한다.

---

### RPC 방식의 장점

```
클라이언트에서 1번의 요청으로 처리:
toggle_post_like(postId, userId) 호출
→ DB 서버에서 모든 작업을 하나의 트랜잭션으로 처리
→ 부분 실패 없음
→ FOR UPDATE로 행 잠금 → 동시성 문제 해결
```

---

## 🗄️ like 테이블 설계

### 컬럼 구성

```
like 테이블
├── id          int8     PK (자동 증가)
├── created_at  timestamptz  Default: now()
├── post_id     int8     FK → public.post.id
└── user_id     uuid     Default: auth.uid()
```

### 외래 키 설정

```
like.post_id → public.post.id

Action if referenced row is updated: Cascade
→ post.id가 바뀌면 like.post_id도 자동으로 바뀜

Action if referenced row is removed: Cascade
→ post가 삭제되면 해당 post의 like 기록도 모두 자동 삭제
```

**Cascade 삭제가 중요한 이유:**
게시글이 삭제될 때 해당 게시글의 좋아요 기록을 별도로 삭제하지 않아도
DB가 자동으로 정리해준다.

---

## 💻 SQL 함수 상세 해설

```sql
-- 원래 함수가 있다면 먼저 삭제 (재생성을 위해)
DROP FUNCTION IF EXISTS toggle_post_like(bigint, uuid);

-- RPC로 호출할 새로운 함수 생성
CREATE OR REPLACE FUNCTION toggle_post_like(
  p_post_id BIGINT,  -- 좋아요할 게시글 id (p_ 접두사는 parameter를 의미)
  p_user_id UUID     -- 좋아요를 누른 사용자 id
)
RETURNS BOOLEAN      -- true: 좋아요 추가, false: 좋아요 취소
SECURITY DEFINER     -- 함수를 호출한 사용자가 아닌 함수 소유자의 권한으로 실행
                     -- RLS를 우회해서 like/post 테이블을 자유롭게 조작할 수 있음
AS $$                -- 함수 본문 시작 ($$는 PostgreSQL의 문자열 구분자)
BEGIN
  /*
    1단계: 게시글 존재 확인 + 행 잠금 (FOR UPDATE)

    FOR UPDATE:
    이 행에 대해 배타적 잠금(Exclusive Lock)을 건다.
    다른 트랜잭션이 동시에 같은 게시글의 like_count를 변경하려 하면
    이 트랜잭션이 완료될 때까지 대기시킨다.
    → Race Condition 방지 (동시에 여러 명이 좋아요를 눌러도 count가 정확함)
  */
  IF NOT EXISTS (
    SELECT 1 FROM post
    WHERE id = p_post_id
    FOR UPDATE
  ) THEN
    /*
      존재하지 않는 게시글이면 에러 발생
      RAISE EXCEPTION: PostgreSQL의 에러 발생 구문
      USING ERRCODE = 'P0001': 사용자 정의 에러 코드
      클라이언트에서 이 에러를 잡아 처리할 수 있음
    */
    RAISE EXCEPTION '존재하지 않는 게시글입니다' USING ERRCODE = 'P0001';
  END IF;

  /*
    2단계: 이미 좋아요를 눌렀는지 확인
    like 테이블에서 해당 post_id와 user_id 조합이 있는지 조회
  */
  IF NOT EXISTS (
    SELECT 1 FROM "like"
    WHERE post_id = p_post_id AND user_id = p_user_id
  ) THEN
    /*
      좋아요 기록이 없는 경우 → 좋아요 추가

      1. like 테이블에 새 행 INSERT
      2. post 테이블의 like_count +1 업데이트
      3. TRUE 반환 (좋아요 추가됨을 클라이언트에 알림)
    */
    INSERT INTO "like" (post_id, user_id)
    VALUES (p_post_id, p_user_id);

    UPDATE post
    SET like_count = like_count + 1
    WHERE id = p_post_id;

    RETURN TRUE;
  ELSE
    /*
      좋아요 기록이 있는 경우 → 좋아요 취소

      1. like 테이블에서 해당 행 DELETE
      2. post 테이블의 like_count -1 업데이트
      3. FALSE 반환 (좋아요 취소됨을 클라이언트에 알림)
    */
    DELETE FROM "like"
    WHERE post_id = p_post_id AND user_id = p_user_id;

    UPDATE post
    SET like_count = like_count - 1
    WHERE id = p_post_id;

    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;  -- PostgreSQL의 절차적 언어(PL/pgSQL) 사용
```

### SQL 핵심 키워드 정리

| 키워드                       | 의미                                 |
| ---------------------------- | ------------------------------------ |
| `CREATE OR REPLACE FUNCTION` | 함수가 없으면 생성, 있으면 덮어씀    |
| `RETURNS BOOLEAN`            | 함수의 반환 타입 (true/false)        |
| `SECURITY DEFINER`           | 함수 소유자 권한으로 실행 (RLS 우회) |
| `FOR UPDATE`                 | 조회한 행에 배타적 잠금 설정         |
| `RAISE EXCEPTION`            | 에러 발생 및 트랜잭션 롤백           |
| `LANGUAGE plpgsql`           | PostgreSQL 절차적 언어 사용 선언     |

---

## 🔄 toggle_post_like 함수 동작 흐름

```
toggle_post_like(postId=1, userId="abc") 호출
        │
        ▼
1. post 테이블에서 id=1 확인 + 행 잠금
   존재하지 않으면 에러 throw
        │
        ▼
2. like 테이블에서 (post_id=1, user_id="abc") 확인
        │
   ┌────┴────┐
 없음(첫 좋아요)  있음(이미 좋아요)
   │                │
   ▼                ▼
like INSERT       like DELETE
like_count +1     like_count -1
RETURN TRUE       RETURN FALSE
```

---
