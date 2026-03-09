import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// store와 비슷한 역할, 쉽게 예시로
// 전역 선언하는 방법
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      // 캐시데이터를 메모리에서 실제로 제거하는 방식
      gcTime: 5 * 60 * 1000,

      refetchOnMount: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    {/* props로 queryClient를 전달 */}
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
      <App />
    </QueryClientProvider>
  </BrowserRouter>,
);
