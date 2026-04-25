## section07\_이미지 추가하기

### storage

Storage = 저장소

- 이미지, 동영상 등의 용량이 큰 파일을 보관한다
- 일종의 파일 보관소

흐름 정리하기

User
-> 업로드(폴더별로 나눠서 보관)
-> post_id가 삭제되었을떄는 날리면되고
-> user_id를 날려 user가 탈퇴했을떄를 대비한다
-> 먼저 Post를 Database에 생성한다
-> 이후 Storage에 업로드를 한다{user_id}/{post_id}/image.png
DataBase
-> Post 생성
-> Post 업데이트
Storage
-> 이미지 URL을 다시 유저에게 보냄

---

## 🗄️ Supabase Storage란?

> **이미지, 동영상 등 용량이 큰 파일을 보관하는 파일 저장소**

DB 테이블에 텍스트나 숫자 같은 데이터만 저장, 이미지나 동영상 같은 대용량 파일은 Storage에 따로 보관한다
Storage에 업로드하면 URL이 생성, 그 URL를 DB에 저장해 이미지를 불러온다.

```
DB (post 테이블)
└── image_urls: ["https://...supabase.co/storage/.../image.png"]
                         ↑
                   이 URL이 Storage를 가리킴

Storage
└── {user_id}/{post_id}/image.png  ← 실제 파일이 여기 저장됨

---

## 📁 Storage 폴더 구조 설계

```

Storage (Bucket: post-images)
└── {user_id}/ ← 유저 탈퇴 시 해당 폴더 전체 삭제
└── {post_id}/ ← 게시글 삭제 시 해당 폴더 전체 삭제
├── image1.png
├── image2.jpg
└── image3.webp

---

user_id로 나누는 이유: 유저가 탈퇴할 때 `{user_id}/` 폴더 전체를 삭제하면 해당 유저의 모든 이미지를 한 번에 정리할 수 있다.
post_id로 나누는 이유: 게시글이 삭제될 때 `{user_id}/{post_id}/` 폴더 전체를 삭제해 해당 게실글의 모든 이미지를 한 번에 정리할 수 있다.

---

## 🔄 이미지 업로드 전체 흐름

```
[1] 사용자가 이미지 선택
    input[type="file"]로 파일 선택
        │
        ▼
[2] 브라우저 메모리에 미리보기 생성
    URL.createObjectURL(file)로 임시 URL 생성
    → 화면에 미리보기 이미지 즉시 표시
        │
        ▼
[3] 저장 버튼 클릭
        │
        ▼
[4] DB에 Post 먼저 생성
    supabase.from("post").insert(...)
    → post_id 발급
        │
        ▼
[5] Storage에 이미지 업로드
    경로: {user_id}/{post_id}/{파일명}
    supabase.storage.from("post-images").upload(...)
        │
        ▼
[6] Storage URL 반환
    supabase.storage.from("post-images").getPublicUrl(...)
        │
        ▼
[7] DB의 Post에 image_urls 업데이트
    supabase.from("post").update({ image_urls: [...urls] })
        │
        ▼
[8] 완료
```

Post를 먼저 생성하는 이유: 이미지 경로에 `post_id` 가 필요하기 때문이다. Storage에 업로드하면 먼저 post_id를 알아야 한다.

---

## 📊 이미지 관련 핵심 개념 정리

### URL.createObjectURL vs 서버 URL

|               | `URL.createObjectURL`            | Storage URL                          |
| ------------- | -------------------------------- | ------------------------------------ |
| **생성 시점** | 파일 선택 즉시                   | Storage 업로드 후                    |
| **형태**      | `blob:http://localhost:5173/xxx` | `https://...supabase.co/storage/...` |
| **용도**      | 브라우저 메모리 미리보기         | 실제 서비스에서 이미지 표시          |
| **지속성**    | 탭/브라우저 닫으면 사라짐        | 영구 저장                            |

**fileInputRef로 파일 선택 창 여는 이유**

```
기본 input[type="file"] 버튼:
┌──────────────────────┐
│  파일 선택  선택 없음  │  ← 스타일링 불가, 디자인 통일 어려움
└──────────────────────┘

커스텀 버튼 + hidden input:
┌──────────────────────┐
│  🖼️  이미지 추가      │  ← 원하는 디자인으로 자유롭게 스타일링 가능
└──────────────────────┘
버튼 클릭 → fileInputRef.current?.click() → 파일 선택 창 열림
```

**e.target.value = ""가 필요한 이유**

```
초기화 없이:
image.png 선택 → onChange 발생 ✅
image.png 다시 선택 → onChange 발생 안 함 ❌
(같은 값이므로 change 이벤트가 발생하지 않음)

초기화 후:
image.png 선택 → onChange 발생 ✅
e.target.value = "" (초기화)
image.png 다시 선택 → onChange 발생 ✅
```

> 현재 코드는 이미지 선택 UI까지 구현된 상태다. 실제 Storage 업로드 로직은 `createPost` 함수에서 Post 생성 후 이미지를 업로드하고 URL을 업데이트하는 방식으로 추가된다.
