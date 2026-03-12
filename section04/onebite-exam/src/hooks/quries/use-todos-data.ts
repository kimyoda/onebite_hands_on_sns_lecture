import { fetchTodos } from "@/api/fetch-todos";
import { QUERY_KEYS } from "@/lib/constants";
import type { Todo } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useTodosData() {
  const queryClient = useQueryClient();

  return useQuery({
    // queryFn - 실제 api 요청을 수행하는 함수
    // TanStack Query가 자동으로 이 함수를 호출해서 데이터를 가져온다
    queryFn: async () => {
      // 캐시 정규화 작업
      const todos = await fetchTodos();
      // forEach 메서드를 활용해 setQuery메서드를 통해 개별로 저장될것이다
      todos.forEach((todo) => {
        queryClient.setQueryData<Todo>(QUERY_KEYS.todo.detail(todo.id), todo);
      });
      // map메서드의 결과 todo의 id 값을 저장한다.
      return todos.map((todo) => todo.id);
    },
    // queryKey - 이 쿼리의 고유 식별자 (캐시 키)
    // ["todos"]라는 키로 캐시를 저장하고 관리
    // 같은 queyKey를 사용하는 컴포넌트는 동일한 캐시를 공유한다
    queryKey: QUERY_KEYS.todo.list,
  });
}
