## section07*5*포스트작성중*이탈방지*기능추가

## 포스트 작성 중 이탈 방지 기능

### 전체개념

> 작성 중인 내용이 있을 때 모달을 닫으려 하면 경고 다이얼로그를 띄워 실수로 내용이 사라지는 것을 방지한다

```
모달 닫기 버튼 클릭
        │
        ▼
content가 비어있고 images도 없는가?
        │
   ┌────┴────┐
  YES        NO
   │          │
   ▼          ▼
그냥 닫기  AlertModal 표시
           "작성 중인 내용이 사라집니다"
                    │
             ┌──────┴──────┐
           취소            확인
             │              │
             ▼              ▼
         모달 유지       모달 닫기
```

---

### 📊 모달 2개의 관계 이해하기

```
PostEditorModal (게시글 작성 모달)
        │
        │ X 버튼 클릭 + 내용 있음
        ▼
AlertModal (이탈 경고 다이얼로그)
  ┌─────┴─────┐
취소           확인
  │             │
  ▼             ▼
AlertModal    AlertModal 닫힘
닫힘           +
PostEditorModal PostEditorModal
그대로 유지     닫힘 (onPositive 실행)
```

---

### 💡 AlertModal을 범용으로 설계

현재 PostEditorModal이 이탈 방지, `title`,`description`, `onPositive`, `onNegative`를 외부에서 주입받는 구조에 재사용이 가능하다

```tsx
// 게시글 삭제 확인
openAlertModal({
  title: "게시글을 삭제하시겠습니까?",
  description: "삭제된 게시글은 복구할 수 없습니다",
  onPositive: () => deletePost(postId),
});

// 로그아웃 확인
openAlertModal({
  title: "로그아웃 하시겠습니까?",
  description: "로그아웃 후 로그인 페이지로 이동합니다",
  onPositive: () => signOut(),
  onNegative: () => console.log("로그아웃 취소"),
});

// 회원 탈퇴 확인
openAlertModal({
  title: "정말 탈퇴하시겠습니까?",
  description: "탈퇴 시 모든 데이터가 삭제됩니다",
  onPositive: () => deleteAccount(),
});
```

> 잘 만든 AlertModal로 앱 전체의 확인 다이얼로그를 처리할 수 있다.
