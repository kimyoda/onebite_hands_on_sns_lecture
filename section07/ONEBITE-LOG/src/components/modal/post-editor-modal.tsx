import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import { usePostEditorModal } from "@/store/post-editor-modal";
import { useEffect, useRef, useState } from "react";

export default function PostEditorModal() {
  const { isOpen, close } = usePostEditorModal();

  const [content, setContent] = useState("");

  const textareRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    textareRef.current?.focus();
    setContent("");
  }, [isOpen]);

  const handleCloseModal = () => {
    close();
  };

  useEffect(() => {
    if (textareRef.current) {
      textareRef.current.style.height = "auto";
      textareRef.current.style.height = textareRef.current.scrollHeight + "px";
    }
  }, [content]);

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="max-h-[90vh]">
        <DialogTitle>포스트 작성</DialogTitle>
        <textarea
          ref={textareRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="focuse:outline-none max-h-125 min-h-25"
          placeholder="무슨 일이 있었나요? "
        />
        <Button variant={"outline"} className="cursor-pointer">
          <ImageIcon />
          이미지 추가
        </Button>
        <Button className="cursor-pointer">저장</Button>
      </DialogContent>
    </Dialog>
  );
}
