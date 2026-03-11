import { createTodo } from "@/api/create-todo";
import { QUERY_KEYS } from "@/lib/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodo,
    // 4가지 이벤트 핸들러
    onMutate: () => {},
    onSettled: () => {},
    // 요청 성공
    onSuccess: () => {
      // 데이터 무효화
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.todo.list,
      });
    },
    // 요청 실패
    onError: (error) => {
      window.alert(error.message);
    },
  });
}
