"use client" // This component must be a client component
import {
    ImageKitAbortError,
    ImageKitInvalidRequestError,
    ImageKitServerError,
    ImageKitUploadNetworkError,
    upload,
} from "@imagekit/next";

import { useId, useRef, useState } from "react";

type UploadResponse = {
    fileId?: string;
    filePath?: string;
    url?: string;
    name?: string;
};

interface ImageKitAuthResponse {
    signature?: string;
    expire?: number;
    token?: string;
    publicKey?: string;
    error?: string;
}

interface FileUploadProps {
    onSuccess: (response: UploadResponse) => void;
    onProgress?:(progress:number)=>void;
    fileType?:"image"|"video";
    hasSelection?: boolean;
    onCancelSelection?: () => void;
}
const FileUpload=
    ({ onSuccess, 
        onProgress, 
        fileType,
        hasSelection = false,
        onCancelSelection }:
        FileUploadProps)=>{
    const[uploading,setUploading]=useState(false);
    const [error,setError]=useState<string|null>(null);
    const inputId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const validateFile=(file:File)=>{
        if(fileType==="video"){
            if(!file.type.startsWith("video/")){
                setError("Invalid file type. Please select a video file.");
                return false;
            }
        }
        if(file.size>10*1024*1024){
            setError("File size exceeds the 10MB limit.");
            return false;
        }
        return true;
    }

    const handleFileChange=async (e: React.ChangeEvent<HTMLInputElement>)=>{
        const file=e.target.files?.[0];
        if(!file || !validateFile(file)) return; 
        setUploading(true);
        setError(null);
        try {
            const authRes=await fetch("/api/auth/imagekit-auth");
            const auth = (await authRes.json()) as ImageKitAuthResponse;
            if (!authRes.ok) {
                throw new Error(auth.error || "Failed to get upload auth from server.");
            }

            const publicKey =
                auth.publicKey || process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

            if (!publicKey) {
                throw new Error(
                    "Missing ImageKit public key for upload. Configure IMAGEKIT_PUBLIC_KEY or PUBLIC_KEY on server."
                );
            }
            if (!auth.signature || !auth.expire || !auth.token) {
                throw new Error("Invalid upload auth response from server.");
            }

            const response=await upload({
                file,
                fileName: file.name,
                publicKey, 
                signature:auth.signature,
                expire:auth.expire,
                token:auth.token,
                
                onProgress: (event) => {
                    const percent=(event.loaded / event.total) * 100;
                    onProgress?.(Math.round(percent))
                },
   
            });
            onSuccess(response);
        } catch (error) {
            console.error("Upload error:", error);
            if (error instanceof ImageKitAbortError) {
                setError("Upload was cancelled.");
            } else if (error instanceof ImageKitInvalidRequestError) {
                setError("Invalid upload request. Please check your file and settings.");
            } else if (error instanceof ImageKitServerError) {
                setError("ImageKit server error. Please try again in a moment.");
            } else if (error instanceof ImageKitUploadNetworkError) {
                setError("Network error during upload. Check your connection and retry.");
            } else {
                setError(error instanceof Error ? error.message : "Upload failed.");
            }
        }    
        finally{
            setUploading(false);
        }        
    }

    const handleCancelSelection = () => {
        if (uploading) return;
        if (inputRef.current) {
            inputRef.current.value = "";
        }
        setError(null);
        onProgress?.(0);
        onCancelSelection?.();
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
                <label
                    htmlFor={inputId}
                    className="inline-flex cursor-pointer rounded-md border border-amber-800/40 bg-amber-100 px-3 py-2 text-sm font-medium text-amber-900 transition hover:bg-amber-200"
                >
                    {uploading
                        ? "Uploading..."
                        : fileType === "video"
                        ? "Choose video file"
                        : "Choose image file"}
                </label>

                {hasSelection && (
                    <button
                        type="button"
                        onClick={handleCancelSelection}
                        disabled={uploading}
                        className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancel upload
                    </button>
                )}
            </div>

            <input
                ref={inputRef}
                id={inputId}
                type="file"
                className="hidden"
                accept={fileType==="video" ? "video/*" : "image/*"}
                onChange={handleFileChange}
            />

            {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
        </div>
    );
}

export default FileUpload;
