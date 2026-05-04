import { createPost, createPostWithImages } from "@/api/post";
import { QUERY_KEYS } from "@/lib/constants";
import type { UseMutationCallback } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreatePost(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPostWithImages,
    onSuccess: () => {
      if (callbacks?.onSuccess) {
        callbacks.onSuccess();
      }
      // 1. 캐시를 아예 초기화(브라우저에서 추가하는 동작은 버튼을 누를 떄 추가되기에, 피드 자체를 지운 다음에 새롭게 불러오는게 적절하다고 판단)
      // resetQueries를 통해 초기화 하고 다시 받아온다
      queryClient.resetQueries({
        queryKey: QUERY_KEYS.post.list,
      });
      // 2. 캐시 데이터에 오나성된 포스트만 추가
      // 3. 낙관적 업데이트 방식(onMutate)
    },
    onError: (error) => {
      if (callbacks?.onError) {
        callbacks.onError(error);
      }
    },
  });
}
