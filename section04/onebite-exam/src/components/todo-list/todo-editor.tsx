import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateTodoMutation } from "@/hooks/mutations/use-create-todo-mutation";
import { useState } from "react";

export default function TodoEditor() {
  // useMutation로 조작, 수정
  // mutate -> 비동기 함수를 실행하도록 함
  // isPending은 Loading 상태를 파악할 수 있다
  const { mutate, isPending } = useCreateTodoMutation();
  const [content, setContent] = useState("");

  const handleAddClick = () => {
    if (content.trim() === "") {
      return;
    }
    mutate(content);
    setContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // IME (한글 입력 등) 조합 중 Enter 처리 방지
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      mutate(content);
      handleAddClick();
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="새로운 할 일을 입력하세요..."
      />
      <Button disabled={isPending} onClick={handleAddClick}>
        추가
      </Button>
    </div>
  );
}
