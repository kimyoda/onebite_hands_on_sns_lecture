import useTogglePostLike from "@/hooks/mutations/post/use-toggle-post-like";
import { useSession } from "@/store/session";
import { HeartIcon } from "lucide-react";
import { toast } from "sonner";

export default function LikePostButton({
  id,
  likeCount,
  isLiked,
}: {
  id: number;
  likeCount: number;
  isLiked: boolean;
}) {
  /*
    session에서 user.id를 가져온다.
    MemberOnlyLayout 안에 있으므로 session은 항상 존재한다.
    ! 단언으로 null이 아님을 TypeScript에 알린다.
  */
  const session = useSession();

  const { mutate: togglePostLike } = useTogglePostLike({
    onError: (error) => {
      toast.error("좋아요 요청에 실패했습니다", {
        position: "top-center",
      });
    },
  });

  const handleLikeClick = () => {
    /*
      postId와 userId를 함께 전달한다.
      DB 함수에서 이 두 값으로 좋아요 여부를 판단한다.
    */
    togglePostLike({
      postId: id,
      userId: session!.user.id,
    });
  };

  return (
    <div
      onClick={handleLikeClick}
      className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-xl border-1 p-2 px-4 text-sm"
    >
      <HeartIcon
        className={`{h-4 w-4 ${isLiked && "fill-foreground border-foreground"}}`}
      />
      <span>{likeCount}</span>
    </div>
  );
}
