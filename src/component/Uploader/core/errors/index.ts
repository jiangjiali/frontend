import {
    Policy,
    Response,
} from "../types";
import { sizeToString } from "../utils";
import i18next from "../../../../i18n";
import { AppError } from "../../../../middleware/Api";

export enum UploaderErrorName {
    InvalidFile = "InvalidFile",
    NoPolicySelected = "NoPolicySelected",
    UnknownPolicyType = "UnknownPolicyType",
    FailedCreateUploadSession = "FailedCreateUploadSession",
    FailedDeleteUploadSession = "FailedDeleteUploadSession",
    HTTPRequestFailed = "HTTPRequestFailed",
    LocalChunkUploadFailed = "LocalChunkUploadFailed",
    SlaveChunkUploadFailed = "SlaveChunkUploadFailed",
    WriteCtxFailed = "WriteCtxFailed",
    RemoveCtxFailed = "RemoveCtxFailed",
    ReadCtxFailed = "ReadCtxFailed",
    InvalidCtxData = "InvalidCtxData",
    CtxExpired = "CtxExpired",
    RequestCanceled = "RequestCanceled",
    ProcessingTaskDuplicated = "ProcessingTaskDuplicated",
    FailedTransformResponse = "FailedTransformResponse",
}

const RETRY_ERROR_LIST = [
    UploaderErrorName.FailedCreateUploadSession,
    UploaderErrorName.HTTPRequestFailed,
    UploaderErrorName.LocalChunkUploadFailed,
    UploaderErrorName.SlaveChunkUploadFailed,
    UploaderErrorName.RequestCanceled,
    UploaderErrorName.ProcessingTaskDuplicated,
    UploaderErrorName.FailedTransformResponse,
];

const RETRY_CODE_LIST = [-1];

export class UploaderError implements Error {
    public stack: string | undefined;
    constructor(public name: UploaderErrorName, public message: string) {
        this.stack = new Error().stack;
    }

    public Message(): string {
        return this.message;
    }

    public Retryable(): boolean {
        return RETRY_ERROR_LIST.includes(this.name);
    }
}

// 文件未通过存储策略验证
export class FileValidateError extends UploaderError {
    // 未通过验证的文件属性
    public field: "size" | "suffix";

    // 对应的存储策略
    public policy: Policy;

    constructor(message: string, field: "size" | "suffix", policy: Policy) {
        super(UploaderErrorName.InvalidFile, message);
        this.field = field;
        this.policy = policy;
    }

    public Message(): string {
        if (this.field == "size") {
            return i18next.t(`uploader.sizeExceedLimitError`, {
                max: sizeToString(this.policy.maxSize),
            });
        }

        return i18next.t(`uploader.suffixNotAllowedError`, {
            supported: this.policy.allowedSuffix
                ? this.policy.allowedSuffix.join(",")
                : "*",
        });
    }
}

// 未知存储策略
export class UnknownPolicyError extends UploaderError {
    // 对应的存储策略
    public policy: Policy;

    constructor(message: string, policy: Policy) {
        super(UploaderErrorName.UnknownPolicyType, message);
        this.policy = policy;
    }
}

// 后端 API 出错
export class APIError extends UploaderError {
    private appError: AppError;
    constructor(
        name: UploaderErrorName,
        message: string,
        protected response: Response<any>
    ) {
        super(name, message);
        this.appError = new AppError(response.msg, response.code, response.msg);
    }

    public Message(): string {
        return `${this.message}: ${this.appError.message}`;
    }

    public Retryable(): boolean {
        return (
            super.Retryable() && RETRY_CODE_LIST.includes(this.response.code)
        );
    }
}

// 无法创建上传会话
export class CreateUploadSessionError extends APIError {
    constructor(response: Response<any>) {
        super(UploaderErrorName.FailedCreateUploadSession, "", response);
    }

    public Message(): string {
        this.message = i18next.t(`uploader.createUploadSessionError`);
        return super.Message();
    }
}

// 无法删除上传会话
export class DeleteUploadSessionError extends APIError {
    constructor(response: Response<any>) {
        super(UploaderErrorName.FailedDeleteUploadSession, "", response);
    }

    public Message(): string {
        this.message = i18next.t(`uploader.deleteUploadSessionError`);
        return super.Message();
    }
}

// HTTP 请求出错
export class HTTPError extends UploaderError {
    public response?: any;
    constructor(public axiosErr: any, protected url: string) {
        super(UploaderErrorName.HTTPRequestFailed, axiosErr.message);
        this.response = axiosErr.response;
    }

    public Message(): string {
        return i18next.t(`uploader.requestError`, {
            msg: this.axiosErr,
            url: this.url,
        });
    }
}

// 本地分块上传失败
export class LocalChunkUploadError extends APIError {
    constructor(response: Response<any>, protected chunkIndex: number) {
        super(UploaderErrorName.LocalChunkUploadFailed, "", response);
    }

    public Message(): string {
        this.message = i18next.t(`uploader.chunkUploadError`, {
            index: this.chunkIndex,
        });
        return super.Message();
    }
}

// 无法创建上传会话
export class RequestCanceledError extends UploaderError {
    constructor() {
        super(UploaderErrorName.RequestCanceled, "Request canceled");
    }
}

// 从机分块上传失败
export class SlaveChunkUploadError extends APIError {
    constructor(response: Response<any>, protected chunkIndex: number) {
        super(UploaderErrorName.SlaveChunkUploadFailed, "", response);
    }

    public Message(): string {
        this.message = i18next.t(`uploader.chunkUploadError`, {
            index: this.chunkIndex,
        });
        return super.Message();
    }
}

// 上传任务冲突
export class ProcessingTaskDuplicatedError extends UploaderError {
    constructor() {
        super(
            UploaderErrorName.ProcessingTaskDuplicated,
            "Processing task duplicated"
        );
    }

    public Message(): string {
        return i18next.t(`uploader.conflictError`);
    }
}

// 无法解析响应
export class TransformResponseError extends UploaderError {
    constructor(private response: string, parseError: Error) {
        super(UploaderErrorName.FailedTransformResponse, parseError.message);
    }

    public Message(): string {
        return i18next.t("uploader.parseResponseError", {
            msg: this.message,
            content: this.response,
        });
    }
}
