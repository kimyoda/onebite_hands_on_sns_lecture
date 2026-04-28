import { updatePost } from "@/api/post";
import { QUERY_KEYS } from "@/lib/constants";
import { type Post, type UseMutationCallback } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdatePost(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePost,
    onSuccess: (updatePost) => {
      if (callbacks?.onSuccess) {
        callbacks.onSuccess();
      }
      queryClient.setQueryData<Post>(
        QUERY_KEYS.post.byId(updatePost.id),
        (prevPost) => {
          if (!prevPost) {
            throw new Error(
              `${updatePost.id}에 해당하는 포스트를 캐시 데이테에서 찾을 수 없습니다`,
            );
          }
          return { ...prevPost, ...updatePost };
        },
      );
    },
    onError: (error) => {
      if (callbacks?.onError) {
        callbacks.onError(error);
      }
    },
  });
}
