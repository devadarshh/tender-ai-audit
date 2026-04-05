"use client"
import { useState, useRef } from "react";
import { uploadTenderToSupabase } from "../actions";
import { Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const MAX_FILE_SIZE = 50 * 1024 * 1024;


    const validateAndSetFile = (selectedFile: File) => {
        setError(null);

        if (selectedFile.type !== "application/pdf") {
            setError("Only PDF files are allowed");
            return;
        }
        if (selectedFile.size > MAX_FILE_SIZE) {
            setError("File size exceeds 50MB limit");
            return;

        }
        setFile(selectedFile);
    }
    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const result = await uploadTenderToSupabase(formData);
            if (result.success) {
                toast.success("Upload Successful", {
                    description: "Your file is now securely stored in supabase"
                });
                setFile(null);
            }
            else {
                toast.error("Upload Failed", { description: result.error });
            }

        } catch (error) {
            toast.error("An unexpected error occurred");
        }
        finally {
            setIsUploading(false)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }

    const handleDragLeave = () => {
        setIsDragging(false);
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) validateAndSetFile(droppedFile);
    };

    const handleFileChange = (error: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = error.target.files?.[0];
        if (selectedFile) validateAndSetFile(selectedFile);
    };

    const removeFile = () => {
        setFile(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Upload Tender</h1>
                    <p className="text-slate-500 mt-2">Select your PDF document for analysis (Max 50MB)</p>
                </div>
                {/* Dropzone Area */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
            relative group cursor-pointer
            border-2 border-dashed rounded-2xl p-12 transition-all duration-300
            flex flex-col items-center justify-center gap-4
            ${isDragging ? "border-blue-500 bg-blue-50/50 scale-[1.02]" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"}
            ${file ? "border-green-200 bg-green-50/20" : ""}
          `}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="application/pdf"
                        className="hidden"
                    />
                    {!file ? (
                        <>
                            <div className="w-16 h-16 bg-blue-100/50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                                <Upload size={32} />
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-slate-700">Click to upload or drag & drop</p>
                                <p className="text-sm text-slate-400 mt-1">PDF documents only</p>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 bg-green-100/50 rounded-2xl flex items-center justify-center text-green-600">
                                <FileText size={32} />
                            </div>
                            <p className="font-semibold text-slate-800">{file.name}</p>
                            <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                    )}
                </div>
                {/* Action Area */}
                <div className="mt-8 space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 text-red-500 bg-red-50 p-4 rounded-xl text-sm border border-red-100">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}
                    {file && !error && (
                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 size={20} className="text-green-500" />
                                <span className="text-sm font-medium text-slate-700">File is ready for upload</span>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); removeFile(); }}
                                className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}
                    <button
                        onClick={handleUpload}
                        disabled={!file || !!error || isUploading}
                        className={`
              w-full py-4 rounded-2xl font-bold text-white transition-all duration-300
              ${!file || !!error ? "bg-slate-200 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 leading-none"}
            `}
                    >
                        {isUploading ? "Uploading..." : "Start Analysis"}
                    </button>
                </div>
            </div>
        </div>
    )
}

