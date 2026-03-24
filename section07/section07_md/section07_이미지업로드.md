## section07\_이미지 추가하기

### storage

Storage = 저장소

- 이미지, 동영상 등의 용량이 큰 파일을 보관한다
- 일종의 파일 보관소

흐름 정리하기

User
-> 업로드(폴더별로 나눠서 보관)
-> post_id가 삭제되었을떄는 날리면되고
-> user_id를 날려 user가 탈퇴했을떄를 대비한다
-> 먼저 Post를 Database에 생성한다
-> 이후 Storage에 업로드를 한다{user_id}/{post_id}/image.png
DataBase
-> Post 생성
-> Post 업데이트
Storage
-> 이미지 URL을 다시 유저에게 보냄
