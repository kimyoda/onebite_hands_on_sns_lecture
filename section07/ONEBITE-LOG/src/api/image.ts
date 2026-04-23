import { BUCKET_NAME } from "@/lib/constants";
import supabase from "@/lib/supabase";

export async function uploadImage({
  file,
  filePath,
}: {
  file: File;
  filePath: string;
}) {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file);

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

  return publicUrl;
}

// 모든 파일을 불러오고 삭제하는 기능 추가(이미지)
export async function deleteImagesInPath(path: string) {
  const { data: files, error: fetchFilesError } = await supabase.storage
    .from(BUCKET_NAME)
    .list(path);

  if (fetchFilesError) {
    throw fetchFilesError;
  }

  const { error: removeError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove(files.map((file) => `${path}/${file.name}`));

  if (removeError) {
    throw removeError;
  }
}
