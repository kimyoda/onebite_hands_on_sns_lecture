import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignInWithPassword } from "@/hooks/mutations/use-sign-in-with-password.";
import { useState } from "react";
import { Link } from "react-router";

import gitHubLogo from "@/assets/github-mark.svg";
import googleLogo from "@/assets/google-logo.svg";
import kakaoLogo from "@/assets/kakao-logo.svg";
import { useSignInWithOAuth } from "@/hooks/mutations/use-sign-in-with-oauth";
import { toast } from "sonner";
import { generateErrorMessage } from "@/lib/error";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /*
    useSignInWithPassword에서 mutate 함수를 꺼내
    signInWithPassword로 이름을 바꿔서 사용한다.

    signUp 페이지와 패턴이 동일하다.
    mutate 함수를 호출해야 실제 API 요청이 시작된다.
    어떤 비동기 요청에 결과에 대해서 UI와 관련된 로직은 컴포넌트, 데이터처리나 에러 로깅등은 커스텀 훅으로 빼서 역할 분리 및 레이어를 나눠서 적용할 수 있다.

  */
  const { mutate: signInWithPassword, isPending: isSignInWithPasswordPending } =
    useSignInWithPassword({
      onError: (error) => {
        const message = generateErrorMessage(error);

        toast.error(message, {
          position: "top-center",
        });

        setPassword("");
      },
    });
  const { mutate: signInWithOAuth, isPending: isSignInWithOAuthPending } =
    useSignInWithOAuth({
      onError: (error) => {
        const message = generateErrorMessage(error);
        toast.error(message, {
          position: "top-center",
        });
      },
    });

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

  const isPending = isSignInWithOAuthPending || isSignInWithPasswordPending;

  // Google 로그인
  // "google"을 넘기면 Google OAuth 흐름이 시작된다.
  // 브라우저가 Google 계정 선택 화면으로 이동한다.
  const handleSignInWithGoogleClick = () => {
    signInWithOAuth("google");
  };
  // Kakao 로그인
  // "kakao"를 넘기면 카카오 OAuth 흐름이 시작된다.
  // 브라우저가 카카오 로그인 화면으로 이동한다.
  const handleSignWithKakaoClick = () => {
    signInWithOAuth("kakao");
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="text-xl font-bold">로그인</div>
      <div className="flex flex-col gap-2">
        <Input
          disabled={isPending}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="py-6"
          type="email"
          placeholder="example@abc.com"
        />
        <Input
          disabled={isPending}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="py-6"
          type="password"
          placeholder="password"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Button
          disabled={isPending}
          onClick={handleSignInWithPasswordClick}
          className="w-full"
        >
          로그인
        </Button>
        <Button
          disabled={isPending}
          onClick={handleSignInWithGithubClick}
          className="w-full"
          variant={"outline"}
        >
          <img src={gitHubLogo} className="h-4 w-4" />
          Github 계정으로 로그인
        </Button>
        <Button
          disabled={isPending}
          onClick={handleSignInWithGoogleClick}
          className="w-full"
          variant={"outline"}
        >
          <img src={googleLogo} className="h-4 w-4" />
          Google 계정으로 로그인
        </Button>
        {/* Kakao 소셜 로그인
            카카오 브랜드 가이드에 따라 배경색은 #FEE500 (카카오 옐로우)를 사용한다.
            variant를 outline 대신 커스텀 스타일로 지정하면 더 자연스럽다. */}
        <Button
          onClick={handleSignWithKakaoClick}
          className="w-full bg-[#FEE500] text-[#3C1E1E] hover:bg-[#F0D900]"
        >
          <img src={kakaoLogo} className="h-4 w-4" />
          카카오 계정으로 로그인
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        <Link className="text-muted-foreground hover:underline" to={"/sign-up"}>
          계정이 없으시다면? 회원가입
        </Link>
        <Link
          className="text-muted-foreground hover:underline"
          to={"/forget-password"}
        >
          비밀번호를 잊으셨나요?
        </Link>
      </div>
    </div>
  );
}
