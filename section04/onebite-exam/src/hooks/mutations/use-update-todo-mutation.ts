import { updateTodo } from "@/api/update-todo";
import { QUERY_KEYS } from "@/lib/constants";
import type { Todo } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTodo,
    // 낙관적 업데이트, 자동 매개변수 제공, 캐시데이터 수정요청
    onMutate: async (updatedTodo) => {
      // 덮어씌우지 안게끔 방지
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.todo.detail(updatedTodo.id),
      });

      const prevTodo = queryClient.getQueryData<Todo>(
        QUERY_KEYS.todo.detail(updatedTodo.id),
      );

      queryClient.setQueryData<Todo>(
        QUERY_KEYS.todo.detail(updatedTodo.id),
        (prevTodo) => {
          if (!prevTodo) {
            return;
          }
          return {
            ...prevTodo,
            ...updatedTodo,
          };
        },
      );

      return {
        prevTodo,
      };
    },
    // 에러시 반환하는 값 (요청 실패시 일어나는 예외상황)
    onError: (error, variable, context) => {
      if (context && context.prevTodo) {
        queryClient.setQueryData<Todo>(
          QUERY_KEYS.todo.detail(context.prevTodo.id),
          // 변경하고자 하는 값을 넣는다.
          context.prevTodo,
        );
      }
    },
  });
}
