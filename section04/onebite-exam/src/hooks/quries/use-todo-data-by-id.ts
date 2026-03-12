import { fetchTodoById } from "@/api/fetch-todo-by-id";
import { QUERY_KEYS } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

export function useTodoDataById(id: string, type: "LIST" | "DETAIL") {
  return useQuery({
    queryFn: () => fetchTodoById(id),
    queryKey: QUERY_KEYS.todo.detail(id),
    // enabled값으로 detail에서만 리페칭이 되도록 설정한다
    enabled: type === "DETAIL",
    // staleTime과 gcTime은 함꼐하지 못한다.
    staleTime: 1000,
    // gcTime이 지나면 삭제를 한다.
    gcTime: 5000,
  });
}
