import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAlertModal } from "@/store/alert-modal";

export default function AlertModal() {
  /*
    useAlertModal로 store 전체를 가져온다
    store.isOpen, store.title, store.description,
    store.onPositive, store.onNegative, store.actions 모두 접근 가능
  */
  const store = useAlertModal();

  /*
    isOpen이 false이면 null을 반환해서 렌더링하지 않는다.
    ModalProvider에 항상 존재하지만 닫혀있을 때는 DOM에 없는 것처럼 처리.
  */
  if (!store.isOpen) {
    return null;
  }
  const handleCancelClick = () => {
    /*
      onNegative 콜백이 있으면 실행
      현재 이탈 방지 기능에서는 onNegative를 사용하지 않지만
      다른 곳에서 AlertModal을 재사용할 때를 위해 옵셔널로 지원한다.
    */
    if (store.onNegative) {
      store.onNegative();
    }
    store.actions.close();
  };
  const handleActionClick = () => {
    /*
      onPositive 콜백이 있으면 실행
      PostEditorModal에서 전달한 close() 함수가 여기서 실행된다.
      → PostEditorModal이 닫히는 동작
    */
    if (store.onPositive) {
      store.onPositive();
    }
    store.actions.close();
  };

  return (
    <AlertDialog open={store.isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{store.title}</AlertDialogTitle>
          <AlertDialogDescription>{store.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancelClick}>
            취소
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleActionClick}>
            확인
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
