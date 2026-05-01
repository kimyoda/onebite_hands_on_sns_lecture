import AlertModal from "@/components/modal/alert-modal";
import PostEditorModal from "@/components/modal/post-editor-modal";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

export default function ModalProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {/* createPortal이 필요한 이유 */}
      {/* 
       createPortal을 사용하는 이유:

       모달은 화면 전체를 덮어야 한다
       createPortal 없이 컴포넌트 트리 안에 렌더링하면 
       부모의 overflow:hidden, z-index, transform 등 CSS에 의해 모달이 잘리거나 다른 요소 뒤에 가려질 수 있다

       createPortal로 document.getElementById("modal-root")에 렌더링하면
       부모 컴포넌트의 CSS 영향을 전혀 받지 않고 항상 화면 최상단에 표시된다.

       index.html:
        <div id="root"></div>
        <div id="modal-root"></div>  ← 모달이 여기에 렌더링됨

        React 트리상으로는 ModalProvider의 자식이므로
        Context, 이벤트 버블링 등은 정상적으로 동작한다.
      */}
      {createPortal(
        <>
          <PostEditorModal />
          <AlertModal />
        </>,
        document.getElementById("modal-root")!,
      )}
      {children}
    </>
  );
}
