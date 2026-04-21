import { useOpenEditPostModal } from "@/store/post-editor-modal";
import { Button } from "../ui/button";
import type { PostEntity } from "@/types";

export default function EditPostItemButton(props: PostEntity) {
  // 액션 함수
  const openEditPostModal = useOpenEditPostModal();

  const handleButtonClick = () => {
    openEditPostModal({
      postId: props.id,
      content: props.content,
      imageUrls: props.image_urls,
    });
  };

  return (
    <Button
      onClick={handleButtonClick}
      className="cursor-pointer"
      variant={"ghost"}
    >
      수정
    </Button>
  );
}
