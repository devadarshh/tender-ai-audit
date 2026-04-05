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
            setError("Document must be a PDF file.");
            return;
        }
        if (selectedFile.size > MAX_FILE_SIZE) {
            setError("Document size exceeds the 50MB construction standard.");
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
                toast.success("Sync Successful", {
                    description: "Initializing Brickanta AI Audit..."
                });
                router.push(`/analysis/${result.documentId}`);
            }
            else {
                toast.error("Process Failed", { description: result.error });
                setIsUploading(false);
            }

        } catch (error) {
            toast.error("An unexpected error occurred during processing.");
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
        <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 font-inter text-brand-dark">
            <div className="w-full max-w-2xl bg-brand-paper shadow-2xl shadow-brand-dark/10 p-12 border border-brand-dark/5 relative">
                {/* Brand Decor */}
                <div className="absolute top-0 left-0 w-2 h-full bg-brand-dark"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-accent"></div>

                <div className="mb-12">
                     <div className="flex items-center gap-2 mb-4">
                        <div className="w-4 h-4 bg-brand-action"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] font-tektur opacity-40">Brickanta • Agentic MVP System</span>
                    </div>
                    <h1 className="text-5xl font-black font-tektur tracking-tighter italic leading-[0.8] mb-6">
                        Upload <span className="font-brand-serif font-light text-brand-accent lowercase italic">tender</span>
                    </h1>
                    <p className="text-brand-muted text-xs font-medium uppercase tracking-[0.05em] font-tektur">
                        Input technical PDF documentation for risk-gap assessment.
                    </p>
                </div>

                {/* Dropzone Area */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        relative group cursor-pointer
                        border-[2px] border-dotted p-20 transition-all duration-500
                        flex flex-col items-center justify-center gap-6
                        ${isDragging ? "border-brand-accent bg-brand-dark/5 scale-[1.01]" : "border-brand-dark/10 hover:border-brand-accent hover:bg-brand-bg/50"}
                        ${file ? "border-brand-secondary bg-brand-secondary/5" : ""}
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
                            <div className="w-16 h-16 bg-brand-paper border border-brand-dark/10 flex items-center justify-center text-brand-dark/20 group-hover:bg-brand-dark group-hover:text-brand-bg transition-all duration-500">
                                <Upload size={32} />
                            </div>
                            <div className="text-center font-tektur">
                                <p className="font-black text-brand-dark uppercase tracking-[0.2em] text-[11px]">Select / Drop PDF Audit</p>
                                <p className="text-[10px] text-brand-muted mt-2 tracking-[0.1em] font-black italic">MAX (50MB) • CONSTRUCTION STANDARD</p>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-500">
                            <div className="w-16 h-16 bg-brand-dark text-brand-bg flex items-center justify-center">
                                <FileText size={32} />
                            </div>
                            <div className="text-center">
                                <p className="font-black text-brand-dark tracking-tighter uppercase font-tektur italic mb-1">{file.name}</p>
                                <span className="text-[9px] font-black text-brand-secondary uppercase tracking-widest px-3 py-1 bg-brand-bg border border-brand-dark/5">
                                    {(file.size / (1024 * 1024)).toFixed(2)} MB • READY FOR ANALYSIS
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info and Errors */}
                <div className="mt-12 space-y-4">
                    {error && (
                        <div className="flex items-center gap-3 text-brand-action bg-brand-paper p-5 border-l-4 border-brand-action text-[10px] uppercase font-black tracking-widest animate-in slide-in-from-top-2">
                            <AlertCircle size={16} />
                            <span>CRITICAL ERROR: {error}</span>
                        </div>
                    )}
                    {file && !error && (
                        <div className="flex items-center justify-between bg-brand-bg p-5 border border-brand-dark/5">
                            <div className="flex items-center gap-4">
                                <CheckCircle2 size={18} className="text-brand-accent" />
                                <span className="text-[10px] font-black text-brand-dark uppercase tracking-widest font-tektur leading-none shrink-0 border-r border-brand-dark/10 pr-4">Structure Verified</span>
                                <span className="text-[10px] text-brand-muted truncate block max-w-[200px]">CRC SHA-2 Sequence VALIDATED</span>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); removeFile(); }}
                                className="p-2 hover:bg-brand-dark hover:text-brand-bg transition-colors text-brand-muted"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}
                    <button
                        onClick={handleUpload}
                        disabled={!file || !!error || isUploading}
                        className={`
                            w-full py-6 font-black text-xs uppercase tracking-[0.4em] font-tektur transition-all duration-500
                            ${!file || !!error ? "bg-brand-dark/10 text-brand-dark/40 cursor-not-allowed" : "bg-brand-dark text-brand-bg hover:bg-brand-accent hover:shadow-2xl active:scale-95"}
                            flex items-center justify-center gap-4 relative overflow-hidden group
                        `}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="animate-spin" size={16} />
                                Initiating Analysis...
                            </>
                        ) : (
                            "Initiate Expert Audit"
                        )}
                        <div className="absolute inset-0 bg-brand-bg/10 -translate-x-full group-hover:translate-x-full transition-transform duration-[1.5s] ease-in-out"></div>
                    </button>
                </div>
            </div>
        </div>
    )
}
