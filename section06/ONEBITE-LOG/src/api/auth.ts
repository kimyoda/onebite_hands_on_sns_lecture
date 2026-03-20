import supabase from "@/lib/supabase";

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
