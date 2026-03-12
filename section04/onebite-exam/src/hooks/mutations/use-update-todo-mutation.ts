import { updateTodo } from "@/api/update-todo";
import { QUERY_KEYS } from "@/lib/constants";
import type { Todo } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTodo,
    // 낙관적 업데이트, 자동 매개변수 제공
    onMutate: async (updatedTodo) => {
      // todolist 캐시데이터를 prevTodos변수에 담는다.
      // 조회 요청, cancelQueries는 다 취소시키는 메서드다.
      // todolist를 불러오는 조회 요청을 취소를 한다. 낙관적 업데이트를 위한 과정 (두번째 예외사항)
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.todo.list,
      });
      const prevTodos = queryClient.getQueryData<Todo[]>(QUERY_KEYS.todo.list);
      // 캐시 데이터를 업데이트하는
      queryClient.setQueryData<Todo[]>(QUERY_KEYS.todo.list, (prevTodos) => {
        if (!prevTodos) {
          return [];
        }
        return prevTodos.map((prevTodo) =>
          prevTodo.id === updatedTodo.id
            ? { ...prevTodo, ...updatedTodo }
            : prevTodo,
        );
      });

      return {
        prevTodos,
      };
    },
    // 에러시 반환하는 값 (요청 실패시 일어나는 예외상황)
    onError: (error, variable, context) => {
      if (context && context.prevTodos) {
        queryClient.setQueryData<Todo[]>(
          QUERY_KEYS.todo.list,
          // 변경하고자 하는 값을 넣는다.
          context.prevTodos,
        );
      }
    },
    // 백엔드와 데이터를 맞추기 위한 무효화 작업, todolist 캐시 데이터를 무효화하고 서버에서 받아와서 갱신시킨다
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.todo.list,
      });
    },
  });
}
