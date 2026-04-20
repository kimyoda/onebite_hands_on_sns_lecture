import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageIcon, XIcon } from "lucide-react";
import { usePostEditorModal } from "@/store/post-editor-modal";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useCreatePost } from "@/hooks/mutations/post/use-create-post";
import { toast } from "sonner";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import { useSession } from "@/store/session";
import { useOpenAlertModal } from "@/store/alert-modal";
import { useUpdatePost } from "@/hooks/mutations/post/use-update-post";

type Image = {
  file: File;
  previewUrl: string;
};

export default function PostEditorModal() {
  const session = useSession();

  const postEditorModal = usePostEditorModal();

  const openAlertModal = useOpenAlertModal();

  const { mutate: createPost, isPending: isCreatePostPending } = useCreatePost({
    onSuccess: () => {
      postEditorModal.actions.close();
    },
    onError: (error) => {
      toast.error("포스트 생성에 실패했다", {
        position: "top-center",
      });
    },
  });

  const { mutate: updatePost, isPending: isUpdatePostPedning } = useUpdatePost({
    onSuccess: () => {
      postEditorModal.actions.close();
    },
    onError: (error) => {
      toast.error("포스트 수정에 실패했습니다", {
        position: "top-center",
      });
    },
  });

  const [content, setContent] = useState("");
  const [images, setImages] = useState<Image[]>([]);

  const textareRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCloseModal = () => {
    if (content !== "" || images.length !== 0) {
      // AlertModal
      openAlertModal({
        title: "게시글 작성이 마무리 되지 않았습니다",
        description: "이 화면에서 나가면 작성중이던 내용이 사라집니다",
        onPositive: () => {
          postEditorModal.actions.close();
        },
      });

      return;
    }
    postEditorModal.actions.close();
  };

  // 수정을 저장했을 때 supbase에 수정된 데이터를 보낸다
  const handleSavePostClick = () => {
    if (content.trim() === "") {
      return;
    }

    if (!postEditorModal.isOpen) {
      return;
    }
    if (postEditorModal.type === "CREATE") {
      createPost({
        content,
        images: images.map((image) => image.file),
        // !으로 타입 단언을 한다
        userId: session!.user.id,
      });
    } else {
      // 변경 된 값들만 보냄, 변경된 곳이 없으면 그냥 냅둔다
      if (content === postEditorModal.content) {
        return;
      }
      updatePost({
        id: postEditorModal.postId,
        content: content,
      });
    }
  };

  const handleSelectImages = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      files.forEach((file) => {
        setImages((prev) => [
          ...prev,
          { file, previewUrl: URL.createObjectURL(file) },
        ]);
      });
    }

    e.target.value = "";
  };

  const handleDeleteImage = (image: Image) => {
    setImages((prevImages) =>
      prevImages.filter((item) => item.previewUrl !== image.previewUrl),
    );
    // 메모리에서도 삭제가 잘 되는 지 확인
    URL.revokeObjectURL(image.previewUrl);
  };

  useEffect(() => {
    if (textareRef.current) {
      textareRef.current.style.height = "auto";
      textareRef.current.style.height = textareRef.current.scrollHeight + "px";
    }
  }, [content]);

  useEffect(() => {
    if (!postEditorModal.isOpen) {
      // 메모리에서 이미지 삭제
      images.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });
      return;
    }

    if (postEditorModal.type === "CREATE") {
      setContent("");
      setImages([]);
    } else {
      setContent(postEditorModal.content);
      setImages([]);
    }

    textareRef.current?.focus();
  }, [postEditorModal.isOpen]);

  // 로딩중
  const isPending = isCreatePostPending || isUpdatePostPedning;

  return (
    <Dialog open={postEditorModal.isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="max-h-[90vh]">
        <DialogTitle>포스트 작성</DialogTitle>
        <textarea
          disabled={isPending}
          ref={textareRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="focuse:outline-none max-h-125 min-h-25"
          placeholder="무슨 일이 있었나요? "
        />
        <input
          onChange={handleSelectImages}
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
        />
        {/* 포스트 수정 시 기능 추가 */}
        {postEditorModal.isOpen && postEditorModal.type === "EDIT" && (
          <Carousel>
            <CarouselContent>
              {postEditorModal.imageUrls?.map((url) => (
                <CarouselItem className="basis-2/5" key={url}>
                  <div className="relative">
                    <img
                      src={url}
                      className="h-full w-full rounded-sm object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
        {images.length > 0 && (
          <Carousel>
            <CarouselContent>
              {images.map((image) => (
                <CarouselItem className="basis-2/5" key={image.previewUrl}>
                  <div className="relative">
                    <img
                      src={image.previewUrl}
                      className="h-full w-full rounded-sm object-cover"
                    />
                    <div
                      onClick={() => handleDeleteImage(image)}
                      className="absolute top-0 right-0 m-1 cursor-pointer rounded-full bg-black/30 p-1"
                    >
                      <XIcon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
        {/* 이미지가 수정될 때에는 추가 버튼이 뜨지 않도록 한다 */}
        {postEditorModal.isOpen && postEditorModal.type === "CREATE" && (
          <Button
            onClick={() => {
              fileInputRef.current?.click();
            }}
            disabled={isPending}
            variant={"outline"}
            className="cursor-pointer"
          >
            <ImageIcon />
            이미지 추가
          </Button>
        )}

        <Button
          disabled={isPending}
          onClick={handleSavePostClick}
          className="cursor-pointer"
        >
          저장
        </Button>
      </DialogContent>
    </Dialog>
  );
}
