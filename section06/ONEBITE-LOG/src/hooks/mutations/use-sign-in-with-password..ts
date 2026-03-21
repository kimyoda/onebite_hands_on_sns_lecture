import { signInWithPassword } from "@/api/auth";
import type { UseMutationCallback } from "@/types";
import { useMutation } from "@tanstack/react-query";

// 어떤 비동기 요청에 결과에 대해서 UI와 관련된 로직은 컴포넌트, 데이터처리나 에러 로깅등은 커스텀 훅으로 빼서 역할 분리 및 레이어를 나눠서 적용할 수 있다.

export function useSignInWithPassword(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: signInWithPassword,
    onError: (error) => {
      console.error(error);

      if (callbacks?.onError) {
        callbacks.onError(error);
      }
    },
  });
}
