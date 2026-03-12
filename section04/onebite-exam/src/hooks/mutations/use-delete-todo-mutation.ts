import { deleteTodo } from "@/api/delete-todo";
import { QUERY_KEYS } from "@/lib/constants";
import type { Todo } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTodo,

    // 1. 캐시 무효화 -> invalidateQueries -> 하나만 제거하는 방법으로는 불필요
    // 2. 수정 요청의 응답값 활용 -> onSuccess -> 가장 적절하다(혼란 없이 피드백을 줄 수 있는 해당 방식이 적절)
    onSuccess: (deletedTodo) => {
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.todo.detail(deletedTodo.id),
      });
      queryClient.setQueryData<string[]>(
        QUERY_KEYS.todo.list,
        (prevTodoIds) => {
          if (!prevTodoIds) {
            return [];
          }
          return prevTodoIds.filter((id) => id !== deletedTodo.id);
        },
      );
    },
    // 3. 나관적 업데이트 -> onMutate -> 바로 화면을 업데이트 할 수 있는 장점이 있다. 요청이 실패할 때는 데이터를 원상복구 해야하기에 삭제와는 맞지않는다.
  });
}
