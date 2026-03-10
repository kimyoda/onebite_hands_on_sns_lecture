import { createTodo } from "@/api/create-todo";
import { useMutation } from "@tanstack/react-query";

export function useCreateTodoMutation() {
  return useMutation({
    mutationFn: createTodo,
    // 4가지 이벤트 핸들러
    onMutate: () => {},
    onSettled: () => {},
    // 요청 성공
    onSuccess: () => {
      // 테스트
      window.location.reload();
    },
    // 요청 실패
    onError: (error) => {
      window.alert(error.message);
    },
  });
}
