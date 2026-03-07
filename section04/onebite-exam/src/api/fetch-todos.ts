import { API_URL } from "@/lib/constants";
import type { Todo } from "@/types";

export async function fetchTodos() {
  // API_URL 상수를 사용 tods 엔드포인트에 GET 요청
  const response = await fetch(`${API_URL}/todos`);

  if (!response.ok) {
    throw new Error("Fetch Failed");
  }

  const data: Todo[] = await response.json();
  return data;
}
