import { fetchTodos } from "@/api/fetch-todos";
import { QUERY_KEYS } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

export function useTodosData() {
  return useQuery({
    // queryFn - 실제 api 요청을 수행하는 함수
    // TanStack Query가 자동으로 이 함수를 호출해서 데이터를 가져온다
    queryFn: fetchTodos,
    // queryKey - 이 쿼리의 고유 식별자 (캐시 키)
    // ["todos"]라는 키로 캐시를 저장하고 관리
    // 같은 queyKey를 사용하는 컴포넌트는 동일한 캐시를 공유한다
    queryKey: QUERY_KEYS.todo.list,
  });
}
