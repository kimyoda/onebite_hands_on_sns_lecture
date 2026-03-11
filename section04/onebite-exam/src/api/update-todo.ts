import { API_URL } from "@/lib/constants";
import type { Todo } from "@/types";

// Partial로 일부만 선택적으로 만듬
// & 교집합 타입
export async function updateTodo(todo: Partial<Todo> & { id: string }) {
  const response = await fetch(`${API_URL}/todos/${todo.id}`, {
    method: "PATCH",
    body: JSON.stringify(todo),
  });

  if (!response.ok) {
    throw new Error("Update Todo Failed");
  }

  const data: Todo = await response.json();

  return data;
}
