import supabase from "@/lib/supabase";
import { getRandomNickname } from "@/lib/utils";

// 위의 조건에 맞는 하나의 데이터만 받아오기
export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }
  return data;
}

// 프로필 데이터를 설정(랜덤 닉네임)
export async function createProfile(userId: string) {
  const { data, error } = await supabase
    .from("profile")
    .insert({
      id: userId,
      nickname: getRandomNickname(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
