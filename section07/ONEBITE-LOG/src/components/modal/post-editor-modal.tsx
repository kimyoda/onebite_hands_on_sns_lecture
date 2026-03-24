import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import { usePostEditorModal } from "@/store/post-editor-modal";
import { useEffect, useRef, useState } from "react";
import { useCreatePost } from "@/hooks/mutations/post/use-create-post";
import { toast } from "sonner";

export default function PostEditorModal() {
  const { isOpen, close } = usePostEditorModal();
  const { mutate: createPost, isPending: isCreatePostPending } = useCreatePost({
    onSuccess: () => {
      close();
    },
    onError: (error) => {
      toast.error("포스트 생성에 실패했다", {
        position: "top-center",
      });
    },
  });

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

  const handleCreatePostClick = () => {
    if (content.trim() === "") {
      return;
    }
    createPost(content);
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
          disabled={isCreatePostPending}
          ref={textareRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="focuse:outline-none max-h-125 min-h-25"
          placeholder="무슨 일이 있었나요? "
        />
        <Button
          disabled={isCreatePostPending}
          variant={"outline"}
          className="cursor-pointer"
        >
          <ImageIcon />
          이미지 추가
        </Button>
        <Button
          disabled={isCreatePostPending}
          onClick={handleCreatePostClick}
          className="cursor-pointer"
        >
          저장
        </Button>
      </DialogContent>
    </Dialog>
  );
}
