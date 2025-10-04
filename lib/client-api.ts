import {del, get, patch, post, put} from "@/lib/api";
import {CreateDiaryRequest, CreateDiaryResponse, DiaryEntry, PaginatedResponse, UpdateDiaryRequest, UpdateUserProfile, UserProfile} from "@/types/diary";

export function getUserProfile() :Promise<UserProfile> {
    console.log("[client-api]getUserProfile");
    return get("/users/me");
}

export function deleteUser() :Promise<void> {
    console.log("[client-api]deleteUser");
    return del("/users/me");
}

export function updateUserProfile(data: {username?: string, profileImageUrl?: string}) :Promise<UpdateUserProfile> {
    console.log("[client-api]updateUserProfile");
    return patch("/users/me/profile", data);
}

export function logout():Promise<void> {
    return post("/auth/logout");
}

export function getClientDiaries(page = 0, limit = 10): Promise<PaginatedResponse<DiaryEntry>> {
    console.log("[client-api]getClientDiary");
    return get(`/diaries?page=${page}&limit=${limit}`)
}

export function getDiary(id: string): Promise<DiaryEntry> {
    console.log("[client-api]getDiary");
    return get(`/diaries/${id}`)
}

export function createDiary(data: CreateDiaryRequest): Promise<CreateDiaryResponse> {
    return post("/diaries", data)
}

export function updateDiary(id: string, data: UpdateDiaryRequest): Promise<CreateDiaryResponse> {
    return put(`/diaries/${id}`, data)
}

export function deleteDiary(id: string): Promise<void> {
    return del(`/diaries/${id}`)
}

export function getS3PresignedUrl(fileName: string, contentType: string): Promise<{ url: string; key: string; contentType: string; }> {
    console.log("[client-api]getS3PresignedUrl");
    return post("/s3/put-url", { fileName, contentType });
}

export function getS3DownloadUrl(key: string): Promise<{ url: string }> {
    console.log("[client-api]getS3DownloadUrl");
    return post("/s3/get-url", { key });
}