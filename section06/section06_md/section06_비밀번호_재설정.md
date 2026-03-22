## section06\_비밀번호 재설정

## 비밀번호 재설정

검증과정
사용자(User)
-> 인증 메일 요청
-> 인증 메일 링크 클릭 이후 -> 검증 요청
재설정과정
-> 비밀번호 변경 요청

Supabase
인증 메일 발송
발송 결과 응답

-> 비밀번호 재설정 페이지
-> 토큰 검증
-> redirect_to

Reset Password
-> 수파베이스 인증서버 주소

```
https://SUPABASE_PROJECT_URL/auth/v1/verify?

token = "1회용 인증 토큰"
type="recovery"
redirect_to="한입 로그의 비밀번호 재설정 페이지 주소"
```

인증링크를 클릭하면 로그인 처리가 잘된다.
