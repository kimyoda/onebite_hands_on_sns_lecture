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
    /*
      ─── 낙관적 업데이트 (Optimistic Update) ───

      일반 업데이트 흐름:
      하트 클릭 → 서버 요청 → 응답 대기 → UI 업데이트
      → 네트워크가 느리면 하트가 즉시 반응하지 않음

      낙관적 업데이트 흐름:
      하트 클릭 → 캐시 즉시 업데이트 (UI 즉시 반응) → 서버 요청 (백그라운드)
      → 성공: 그대로 유지
      → 실패: 이전 상태로 롤백
      → 사용자는 즉각적인 피드백을 받음

      좋아요는 실패 확률이 낮고 즉각적인 반응이 중요하므로
      낙관적 업데이트가 적합하다.
    */
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
