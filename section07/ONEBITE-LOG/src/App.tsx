import SessionProvider from "@/provider/session-provider";
import RootRoute from "@/root-route";
import ModalProvider from "./provider/modal-provider";

export default function App() {
  return (
    <SessionProvider>
      <ModalProvider>
        <RootRoute />;
      </ModalProvider>
    </SessionProvider>
  );
}
