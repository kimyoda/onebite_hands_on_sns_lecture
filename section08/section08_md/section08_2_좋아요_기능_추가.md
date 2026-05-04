## section08*2*좋아요\_기능추가

## 좋아요 기능이란?

좋아요 기능은 대부분의 SNS에서 제공하는 기능과 동일하다.

사용자가 좋아요 버튼을 누르면 다음과 같은 동작이 발생한다.

- 좋아요 아이콘 채우기
- 현재 사용자가 좋아요를 눌렀는지 체크
- 좋아요 카운트 증가
- 누가 어떤 게시글에 좋아요를 눌렀는지 기록

---

## 기본 좋아요 처리 흐름

먼저 `Post` 테이블에서 게시글 데이터를 조회한다.

```sql
SELECT * FROM Post WHERE id = 3;
```

만약 `Post` 테이블에 저장된 `likeCount` 값이 `0`이라면,  
좋아요 버튼을 눌렀을 때 이 값을 1 증가시켜야 한다.

```txt
likeCount = 0
```

좋아요 수를 증가시키는 업데이트는 다음과 같이 처리할 수 있다.

```sql
UPDATE Post
SET likeCount = likeCount + 1
WHERE id = 3;
```

결과적으로 `likeCount`는 다음과 같이 변경된다.

```txt
likeCount = 1
```

---

## Like 테이블 추가

게시글의 좋아요 수만 증가시키면  
어떤 사용자가 좋아요를 눌렀는지 알 수 없다.

따라서 좋아요 기록을 보관하는 `Like` 테이블을 추가한다.

예를 들어 다음과 같은 데이터가 저장될 수 있다.

```txt
user_id: aaa
post_id: 3
```

좋아요 버튼을 누르면 `Like` 테이블에 좋아요 기록을 추가한다.

```sql
INSERT INTO Like (user_id, post_id)
VALUES ('aaa', 3);
```

이를 통해 다음 정보를 관리할 수 있다.

- 어떤 사용자가 좋아요를 눌렀는지
- 어떤 게시글에 좋아요를 눌렀는지
- 이미 좋아요를 누른 게시글인지

---

## 동시성 이슈

두 명의 사용자가 같은 시간에 동시에 좋아요 버튼을 누르면  
좋아요 수가 제대로 업데이트되지 않을 수 있다.

예를 들어 현재 게시글의 좋아요 수가 `0`이라고 가정한다.

```txt
likeCount = 0
```

두 명의 사용자가 거의 동시에 게시글 데이터를 조회하면  
두 사용자 모두 같은 값을 응답받을 수 있다.

```txt
사용자 A -> likeCount = 0
사용자 B -> likeCount = 0
```

이후 두 사용자가 각각 좋아요 수를 증가시키면  
둘 다 다음과 같은 계산을 하게 된다.

```txt
0 + 1 = 1
```

즉, 좋아요 버튼은 두 번 눌렸지만  
`Post` 테이블에는 `likeCount`가 `2`가 아니라 `1`로만 업데이트될 수 있다.

```txt
기대 결과: likeCount = 2
실제 결과: likeCount = 1
```

이런 문제를 **동시성 이슈**라고 한다.

---

## 동시성 이슈란?

동시성 이슈란 하나의 데이터에 여러 사용자가 동시에 접근할 때 발생할 수 있는 문제이다.

대표적인 예시는 다음과 같다.

- 은행의 송금 시스템
- 쇼핑몰의 재고 관리 시스템
- 식당 및 장소 예약 관리 시스템
- SNS 좋아요 기능

---

## 동시성 이슈 해결 방법

동시성 이슈를 해결하기 위해서는  
데이터를 업데이트하기 전에 해당 행을 잠그는 방식이 필요하다.

SQL에서는 `SELECT ... FOR UPDATE`를 사용할 수 있다.

```sql
SELECT * FROM Post
WHERE id = 3
FOR UPDATE;
```

이 SQL은 해당 게시글 행을 잠근다.

행이 잠긴 상태에서는 다른 요청이 같은 데이터를 수정하려고 해도  
먼저 실행 중인 요청이 끝날 때까지 대기하게 된다.

---

## 행 잠금을 사용한 처리 흐름

현재 좋아요 수가 `0`이라고 가정한다.

```txt
likeCount = 0
```

사용자 A가 먼저 좋아요 요청을 보낸다.

```sql
SELECT * FROM Post
WHERE id = 3
FOR UPDATE;
```

이때 해당 게시글 행이 잠긴다.

사용자 B가 동시에 같은 게시글에 좋아요 요청을 보내도  
사용자 A의 작업이 끝날 때까지 대기한다.

사용자 A는 좋아요 수를 증가시킨다.

```sql
UPDATE Post
SET likeCount = likeCount + 1
WHERE id = 3;
```

사용자 A의 작업 결과는 다음과 같다.

```txt
likeCount = 1
```

사용자 A의 작업이 끝나면 잠금이 풀린다.

그 후 대기 중이던 사용자 B의 요청이 실행된다.

사용자 B는 증가된 좋아요 수를 기준으로 다시 처리한다.

```txt
likeCount = 1
```

사용자 B도 좋아요 수를 증가시킨다.

```sql
UPDATE Post
SET likeCount = likeCount + 1
WHERE id = 3;
```

최종 결과는 다음과 같다.

```txt
likeCount = 2
```

이렇게 행 잠금을 사용하면  
여러 사용자가 동시에 좋아요를 눌러도 순서대로 처리되기 때문에  
동시성 이슈를 해결할 수 있다.

---

## Supabase Client의 한계

Supabase Client는 기본적으로 데이터를 조회하거나 추가, 수정, 삭제하는 기능을 제공한다.

하지만 `SELECT ... FOR UPDATE`처럼  
행을 잠그는 세부적인 SQL 옵션을 직접 실행하는 기능은 제공하지 않는다.

즉, React App에서 Supabase Client만 사용해서는  
행 잠금과 같은 복잡한 데이터베이스 처리를 직접 구현하기 어렵다.

---

## Supabase RPC

Supabase에서는 이런 문제를 해결하기 위해 `RPC` 기능을 제공한다.

`RPC`는 **Remote Procedure Call**의 약자이다.

한국어로는 원격 프로시저 호출이라고 볼 수 있다.

즉, 데이터베이스에 전용 함수를 만들어 저장해두고,  
React App에서 그 함수를 원격으로 호출하는 방식이다.

---

## RPC를 사용하는 이유

좋아요 기능에서는 다음 작업들이 하나의 흐름으로 안전하게 처리되어야 한다.

1. 게시글 데이터 조회
2. 해당 게시글 행 잠금
3. `Like` 테이블에 좋아요 기록 추가
4. `Post` 테이블의 `likeCount` 증가

이 작업들을 React App에서 각각 따로 실행하면  
중간에 동시성 문제가 발생할 수 있다.

따라서 데이터베이스 내부에 좋아요 처리 함수를 만들고,  
React App에서는 그 함수를 호출만 하도록 구성한다.

---

## RPC 함수 예시

Supabase의 PostgreSQL 함수로 좋아요 처리 로직을 만들 수 있다.

```sql
CREATE OR REPLACE FUNCTION like_post(
  target_post_id bigint,
  target_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  SELECT *
  FROM Post
  WHERE id = target_post_id
  FOR UPDATE;

  INSERT INTO Like (user_id, post_id)
  VALUES (target_user_id, target_post_id);

  UPDATE Post
  SET likeCount = likeCount + 1
  WHERE id = target_post_id;
END;
$$;
```

이 함수는 다음 작업을 순서대로 처리한다.

- 좋아요를 누른 게시글을 조회한다.
- 해당 게시글 행을 잠근다.
- `Like` 테이블에 좋아요 기록을 추가한다.
- `Post` 테이블의 `likeCount`를 1 증가시킨다.

---

## toggle_post_like SQL문 설명

현재 프로젝트에서는 React App에서 다음 RPC 함수를 호출한다.

```ts
const { data, error } = await supabase.rpc("toggle_post_like", {
  p_post_id: postId,
  p_user_id: userId,
});
```

따라서 Supabase SQL Editor에는 `toggle_post_like`라는 데이터베이스 함수를 만들어야 한다.

```sql
CREATE OR REPLACE FUNCTION toggle_post_like(
  p_post_id bigint,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  is_liked boolean;
BEGIN
  SELECT *
  FROM post
  WHERE id = p_post_id
  FOR UPDATE;

  SELECT EXISTS (
    SELECT 1
    FROM "like"
    WHERE post_id = p_post_id
      AND user_id = p_user_id
  )
  INTO is_liked;

  IF is_liked THEN
    DELETE FROM "like"
    WHERE post_id = p_post_id
      AND user_id = p_user_id;

    UPDATE post
    SET like_count = like_count - 1
    WHERE id = p_post_id;

    RETURN false;
  ELSE
    INSERT INTO "like" (post_id, user_id)
    VALUES (p_post_id, p_user_id);

    UPDATE post
    SET like_count = like_count + 1
    WHERE id = p_post_id;

    RETURN true;
  END IF;
END;
$$;
```

위 SQL문은 좋아요 버튼을 토글하기 위한 함수이다.

- `CREATE OR REPLACE FUNCTION`은 새로운 함수를 만들거나 기존 함수를 교체한다.
- `toggle_post_like`는 React App에서 `supabase.rpc("toggle_post_like")`로 호출할 함수 이름이다.
- `p_post_id`는 좋아요를 누른 게시글의 id이다.
- `p_user_id`는 좋아요를 누른 사용자의 id이다.
- `RETURNS boolean`은 함수가 `true` 또는 `false` 값을 반환한다는 뜻이다.
- `LANGUAGE plpgsql`은 PostgreSQL의 절차형 SQL 문법을 사용한다는 뜻이다.
- `DECLARE` 영역에서는 함수 안에서 사용할 변수 `is_liked`를 선언한다.
- `SELECT ... FOR UPDATE`는 해당 게시글 행을 잠가서 동시에 여러 요청이 수정하지 못하게 한다.
- `SELECT EXISTS`는 현재 사용자가 이미 이 게시글에 좋아요를 눌렀는지 확인한다.
- 이미 좋아요를 눌렀다면 `"like"` 테이블에서 기록을 삭제하고 `like_count`를 1 감소시킨다.
- 아직 좋아요를 누르지 않았다면 `"like"` 테이블에 기록을 추가하고 `like_count`를 1 증가시킨다.
- `RETURN true`는 좋아요가 추가되었다는 뜻이다.
- `RETURN false`는 좋아요가 취소되었다는 뜻이다.

`"like"`처럼 따옴표를 사용하는 이유는 `like`가 SQL에서 사용되는 키워드이기 때문이다.  
테이블 이름이 `like`라면 안전하게 `"like"`처럼 감싸서 사용하는 것이 좋다.

---

## React App에서 RPC 호출하기

React App에서는 Supabase Client를 사용해  
데이터베이스 함수를 원격으로 호출할 수 있다.

```ts
const { error } = await supabase.rpc("like_post", {
  target_post_id: 3,
  target_user_id: user.id,
});
```

이렇게 하면 React App에서 직접 복잡한 SQL을 작성하지 않고도  
데이터베이스 내부의 좋아요 처리 로직을 실행할 수 있다.

---

## 정리

좋아요 기능은 단순히 좋아요 수만 증가시키는 기능이 아니다.

다음 두 가지 작업이 함께 이루어져야 한다.

1. `Post` 테이블의 `likeCount` 증가
2. `Like` 테이블에 좋아요 기록 추가

하지만 여러 사용자가 동시에 좋아요를 누르면  
같은 `likeCount` 값을 기준으로 업데이트가 발생하여  
좋아요 수가 정상적으로 증가하지 않을 수 있다.

이 문제를 **동시성 이슈**라고 한다.

동시성 이슈를 해결하기 위해서는  
업데이트가 끝날 때까지 해당 행을 잠그는 방식이 필요하다.

SQL에서는 `SELECT ... FOR UPDATE`를 사용할 수 있다.

하지만 Supabase Client는 이런 세부적인 행 잠금 옵션을 직접 제공하지 않는다.

따라서 Supabase의 `RPC` 기능을 사용한다.

`RPC`를 사용하면 데이터베이스에 전용 함수를 만들어두고,  
React App에서는 해당 함수를 원격으로 호출할 수 있다.

결과적으로 좋아요 기능을 더 안전하고 정확하게 처리할 수 있다.
