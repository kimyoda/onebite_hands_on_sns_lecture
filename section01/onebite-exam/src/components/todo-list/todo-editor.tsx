import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateTodo } from "@/store/todos";
import { useState } from "react";

export default function TodoEditor() {
  const createTodo = useCreateTodo();
  const [content, setContent] = useState("");

  const handleAddClick = () => {
    if (content.trim() === "") {
      return;
    }
    createTodo(content);
    setContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // IME (한글 입력 등) 조합 중 Enter 처리 방지
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
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
      <Button onClick={handleAddClick}>추가</Button>
    </div>
  );
}
