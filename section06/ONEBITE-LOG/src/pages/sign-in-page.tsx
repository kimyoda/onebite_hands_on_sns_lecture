import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignInWithPassword } from "@/hooks/mutations/use-sign-in-with-password.";
import { useState } from "react";
import { Link } from "react-router";

import gitHubLogo from "@/assets/github-mark.svg";
import { useSignInWithOAuth } from "@/hooks/mutations/use-sign-in-with-oauth";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /*
    useSignInWithPassword에서 mutate 함수를 꺼내
    signInWithPassword로 이름을 바꿔서 사용한다.

    signUp 페이지와 패턴이 동일하다.
    mutate 함수를 호출해야 실제 API 요청이 시작된다.
  */
  const { mutate: signInWithPassword } = useSignInWithPassword();
  const { mutate: signInWithOAuth } = useSignInWithOAuth();

  const handleSignInWithPasswordClick = () => {
    if (email.trim() === "") {
      return;
    }

    if (password.trim() === "") {
      return;
    }
    /*
      signInWithPassword mutate 호출:
      내부적으로 supabase.auth.signInWithPassword()가 실행된다.

      성공하면:
      - Supabase가 access_token을 localStorage에 자동 저장
      - 크롬 개발자 도구 → 애플리케이션 → 로컬 스토리지에서 확인 가능
        키: "sb-{프로젝트ID}-auth-token"
      - 이후 모든 supabase DB 요청에 토큰이 자동으로 포함됨

      실패하면:
      - 아이디/비밀번호 불일치 등의 에러가 throw됨
    */

    signInWithPassword({
      email,
      password,
    });
  };

  const handleSignInWithGithubClick = () => {
    signInWithOAuth("github");
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="text-xl font-bold">로그인</div>
      <div className="flex flex-col gap-2">
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="py-6"
          type="email"
          placeholder="example@abc.com"
        />
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="py-6"
          type="password"
          placeholder="password"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Button onClick={handleSignInWithPasswordClick} className="w-full">
          로그인
        </Button>
        <Button
          onClick={handleSignInWithGithubClick}
          className="w-full"
          variant={"outline"}
        >
          <img src={gitHubLogo} className="h-4 w-4" />
          Github 계정으로 로그인
        </Button>
      </div>
      <div>
        <Link className="text-muted-foreground hover:underline" to={"/sign-up"}>
          계정이 없으시다면? 회원가입
        </Link>
      </div>
    </div>
  );
}
