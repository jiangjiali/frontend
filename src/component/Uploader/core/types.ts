import { ChunkProgress } from "./uploader/chunk";

export enum PolicyType {
    local = "local",
    remote = "remote",
}

export interface Policy {
    id: number;
    name: string;
    allowedSuffix: Nullable<string[]>;
    maxSize: number;
    type: PolicyType;
}

export enum TaskType {
    file,
    resumeHint,
}

export interface Task {
    type: TaskType;
    name: string;
    size: number;
    policy: Policy;
    dst: string;
    file: File;
    child?: Task[];
    session?: UploadCredential;
    chunkProgress: ChunkProgress[];
    resumed: boolean;
}

type Nullable<T> = T | null;

export interface Response<T> {
    code: number;
    data: T;
    msg: string;
    error: string;
}

export interface UploadSessionRequest {
    path: string;
    size: number;
    name: string;
    policy_id: number;
    last_modified?: number;

    mime_type?: string;
}

export interface UploadCredential {
    sessionID: string;
    expires: number;
    chunkSize: number;
    uploadURLs: string[];
    credential: string;
    uploadID: string;
    callback: string;
    policy: string;
    ak: string;
    keyTime: string;
    path: string;
    completeURL: string;
}
