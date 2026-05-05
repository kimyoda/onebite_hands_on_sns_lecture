import { togglePostLike } from "@/api/post";
import { QUERY_KEYS } from "@/lib/constants";
import type { Post, UseMutationCallback } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useTogglePostLike(callbacks?: UseMutationCallback) {
  /*
    useMutation으로 togglePostLike를 감싼다.
    좋아요는 데이터를 변경하는 작업이므로 useMutation을 사용한다.
  */

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: togglePostLike,
    // 낙관적 업데이트 추가
    onMutate: async ({ postId }) => {
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.post.byId(postId),
      });

      const prevPost = queryClient.getQueryData<Post>(
        QUERY_KEYS.post.byId(postId),
      );

      // 캐시데이터 낙관적 업데이트
      queryClient.setQueryData<Post>(QUERY_KEYS.post.byId(postId), (post) => {
        if (!post) {
          throw new Error("포스트가 존재하지 않습니다");
        }
        return {
          ...post,
          isLiked: !post.isLiked,
          like_count: post.isLiked ? post.like_count - 1 : post.like_count + 1,
        };
      });

      return {
        prevPost,
      };
    },
    onSuccess: () => {
      if (callbacks?.onSuccess) {
        callbacks.onSuccess();
      }
    },
    onError: (error, _, context) => {
      if (context && context.prevPost) {
        queryClient.setQueryData(
          QUERY_KEYS.post.byId(context.prevPost.id),
          context.prevPost,
        );
      }
      if (callbacks?.onError) {
        callbacks.onError(error);
      }
    },
  });
}
