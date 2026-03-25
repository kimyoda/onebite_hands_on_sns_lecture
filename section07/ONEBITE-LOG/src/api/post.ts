import supabase from "@/lib/supabase";
import { uploadImage } from "./image";
import type { PostEntity } from "@/types";

export async function createPost(content: string) {
  const { data, error } = await supabase
    .from("post")
    .insert({
      content,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
}

export async function createPostWithImages({
  content,
  images,
  userId,
}: {
  content: string;
  images: File[];
  userId: string;
}) {
  // 1. 새로운 포스트 생성
  const post = await createPost(content);
  // 이미지가 없는 예외사항 추가
  if (images.length === 0) {
    return post;
  }

  try {
    // 2. 이미지 업로드 - 병렬정리
    const imageUrls = await Promise.all(
      images.map((image) => {
        // 확장자를 뽑아내는 수식
        const fileExtension = image.name.split(".").pop() || "webp";
        // JS 내장 객체 함수
        const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;
        const filePath = `${userId}/${post.id}/${fileName}`;
        // Images 모든 이미지를 map 메서드를 활용해 비동기 함수로 변환
        return uploadImage({
          file: image,
          filePath,
        });
      }),
    );

    // 3. 포스트 테이블 업데이트
    const updatedPost = await updatePost({
      id: post.id,
      image_urls: imageUrls,
    });

    return updatedPost;
  } catch (error) {
    await deletePost(post.id);
    throw error;
  }
}

// 포스트 업데이트 비동기 함수
// Partial이라는 유틸리티 타입으로 모든 프로퍼티를 선택적 프로퍼티로 변환
export async function updatePost(post: Partial<PostEntity> & { id: number }) {
  const { data, error } = await supabase
    .from("post")
    .update(post)
    .eq("id", post.id)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
}

// 에외사항 함수
export async function deletePost(id: number) {
  const { data, error } = await supabase
    .from("post")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
