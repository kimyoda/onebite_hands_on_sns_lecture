import { fetchPosts } from "@/api/post";
import { QUERY_KEYS } from "@/lib/constants";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 5;

export function useInfinitePostsData() {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.post.list,
    // pageParam이라는 매개변수의 데이터를 일부 데이터만 받아오도록 수정한다.
    queryFn: async ({ pageParam }) => {
      // page가 0이면 0 -1 * 5라 0, 4번 아이템까지 총 5개의 아이템을 불러 올 수 있도록 할 수 있다.
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const posts = await fetchPosts({ from, to });
      return posts;
    },

    initialPageParam: 0,
    // 1page씩 추가 됨
    getNextPageParam: (lastPage, allPages) => {
      // 뒤에 불러올 데이터는 없다라는 설정
      if (lastPage.length < PAGE_SIZE) {
        return undefined;
      }
      return allPages.length;
    },
  });
}
