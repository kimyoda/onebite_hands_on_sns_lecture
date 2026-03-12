import { createTodo } from "@/api/create-todo";
import { QUERY_KEYS } from "@/lib/constants";
import type { Todo } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodo,
    // 4가지 이벤트 핸들러
    onMutate: () => {},
    onSettled: () => {},
    // 요청 성공
    onSuccess: (newTodo) => {
      // setQueryData 메서드 활용
      queryClient.setQueryData<Todo>(
        QUERY_KEYS.todo.detail(newTodo.id),
        newTodo,
      );
      queryClient.setQueryData<string[]>(
        QUERY_KEYS.todo.list,
        (prevTodoIds) => {
          if (!prevTodoIds) {
            return [newTodo.id];
          }
          return [...prevTodoIds, newTodo.id];
        },
      );
    },
    // 요청 실패
    onError: (error) => {
      window.alert(error.message);
    },
  });
}
