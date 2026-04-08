import supabase from "@/lib/supabase";
import { uploadImage } from "./image";
import type { PostEntity } from "@/types";

// post 테이블의 모든 데이터를 최신순으로 조회 요청
export async function fetchPosts() {
  const { data, error } = await supabase
    .from("post")
    // *로 모든 컬럼의 값을 가져오고 profile 데이트로부터 author_id 컬럼 값을 가져오고 일치하는 값을 모두다 설정한다.
    .select("*, author: profile!author_id (*)")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }
  return data;
}

// 외래키 (Foreign Key)
// 테이블과 테이블을 연결하는 키, 두 테이블을 연결하는 것
// 스키마란?
// 데이터베이스의 구조와 규칙을 정의하는 큰 단위, 테이블을 정의하는 큰 폴더

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
