import supabase from "@/lib/supabase";
import type { Provider } from "@supabase/supabase-js";

export async function signUp({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  /*
    supabase.auth.signUp
    Supabase Auth에서 제공하는 회원가입 메서드.
    내부적으로 아래 과정이 자동으로 처리된다:
    1. 이메일 + 비밀번호로 새 유저 생성
    2. access_token, refresh_token 발급
    3. 발급된 토큰을 브라우저 localStorage에 자동 저장
       (개발자가 직접 저장할 필요 없음)

    반환값 구조: { data, error }
    - data: Session과 동일한 구조 (access_token, user 등 포함)
    - error: 실패 시 AuthError 객체, 성공 시 null
  */
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signInWithPassword({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signInWithOAuth(provider: Provider) {
  /*
    supabase.auth.signInWithOAuth
    소셜 로그인을 시작하는 Supabase Auth 메서드.

    provider 인자:
    "github", "google", "kakao" 등 소셜 서비스 이름을 문자열로 전달한다.

    이 메서드가 실행되면:
    1. Supabase 서버에서 GitHub 로그인 URL을 생성한다.
       (client_id, redirect_uri 등이 포함된 URL)
    2. 브라우저가 해당 URL로 자동 리디렉션된다.
    3. 사용자가 GitHub에서 권한을 허가하면
       code와 함께 Supabase Callback URL로 돌아온다.
    4. Supabase가 code로 토큰을 교환하고 localStorage에 저장한다.

  */
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
  });

  if (error) {
    throw error;
  }

  return data;
}
