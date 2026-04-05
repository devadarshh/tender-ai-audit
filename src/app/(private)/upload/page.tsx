"use client"
import { useState, useRef } from "react";
import { uploadTenderToSupabase } from "../actions";
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

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

            const tempProjectId = "dev-project-id";

            const result = await uploadTenderToSupabase(formData, tempProjectId);
            
            if (result.success && result.documentId) {
                toast.success("Upload Successful", {
                    description: "Moving to analysis dashboard..."
                });
                // Redirect to the analysis page for real-time results
                router.push(`/analysis/${result.documentId}`);
            }
            else {
                toast.error("Upload Failed", { description: result.error });
                setIsUploading(false);
            }

        } catch (error) {
            toast.error("An unexpected error occurred");
            setIsUploading(false);
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
            <div className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 p-10 border border-slate-100">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">Upload Tender</h1>
                    <p className="text-slate-400 mt-2 font-medium">Select your PDF document for expert AI audit.</p>
                </div>

                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        relative group cursor-pointer
                        border-[3px] border-dashed rounded-3xl p-16 transition-all duration-500
                        flex flex-col items-center justify-center gap-6
                        ${isDragging ? "border-indigo-500 bg-indigo-50/50 scale-[1.03]" : "border-slate-100 hover:border-indigo-300 hover:bg-slate-50"}
                        ${file ? "border-emerald-200 bg-emerald-50/20" : ""}
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
                            <div className="w-20 h-20 bg-indigo-100/50 rounded-3xl flex items-center justify-center text-indigo-600 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500">
                                <Upload size={40} />
                            </div>
                            <div className="text-center">
                                <p className="font-black text-slate-800 text-lg">Click to select PDF</p>
                                <p className="text-xs text-slate-400 mt-1 uppercase font-black tracking-widest">Supports documents up to 50MB</p>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-20 h-20 bg-emerald-100/50 rounded-3xl flex items-center justify-center text-emerald-600 animate-in zoom-in duration-300">
                                <FileText size={40} />
                            </div>
                            <p className="font-black text-slate-800 tracking-tight">{file.name}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none bg-slate-100 px-3 py-1 rounded-full">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB • READY
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-10 space-y-4">
                    {error && (
                        <div className="flex items-center gap-3 text-rose-500 bg-rose-50 p-5 rounded-2xl text-sm font-bold border border-rose-100 animate-in slide-in-from-top-2">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}
                    {file && !error && (
                        <div className="flex items-center justify-between bg-slate-50 p-5 rounded-2xl border border-slate-100 animate-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-4">
                                <CheckCircle2 size={24} className="text-emerald-500" />
                                <span className="text-sm font-bold text-slate-700 font-mono italic">Document Verified</span>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); removeFile(); }}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}
                    <button
                        onClick={handleUpload}
                        disabled={!file || !!error || isUploading}
                        className={`
                            w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-500
                            ${!file || !!error ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-slate-900 text-white hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-200 hover:-translate-y-1 active:scale-95"}
                            flex items-center justify-center gap-3
                        `}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Uploading to Vault...
                            </>
                        ) : (
                            "Initiate AI Audit"
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
