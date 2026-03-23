import GlobalLoader from "@/components/global-loader";
import { useProfileData } from "@/hooks/queries/use-profile-data";
import supabase from "@/lib/supabase";
import { useIsSessionLoaded, useSession, useSetSession } from "@/store/session";
import { useEffect, type ReactNode } from "react";

export default function SessionProvider({ children }: { children: ReactNode }) {
  const session = useSession();
  const setSession = useSetSession();
  const isSessionLoaded = useIsSessionLoaded();
  // sessions 데이터가 null값이 아니면 user의 id도 null값이 아니기에 queryFn이 실행되어 프로필 정보를 불러오게된다
  const { data: profile, isLoading: isProfileLoading } = useProfileData(
    session?.user.id,
  );

  // supabese 관련
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });
  }, []);

  if (!isSessionLoaded) {
    return <GlobalLoader />;
  }

  if (isProfileLoading) {
    return <GlobalLoader />;
  }

  return children;
}
