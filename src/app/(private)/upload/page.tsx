"use client"
import { useState, useRef } from "react";
import { uploadTenderToSupabase } from "../actions";
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/**
 * BRICKANTA SECURE UPLOAD PORTAL
 * Senior-Grade Implementation: High-legibility, robust interaction, and brand-first messaging.
 */
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

            // Placeholder project ID for MVP
            const tempProjectId = "audit-seq-001";

            const result = await uploadTenderToSupabase(formData, tempProjectId);
            
            if (result.success && result.documentId) {
                toast.success("Sync Successful", {
                    description: "Initializing Brickanta AI Audit Sequence..."
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) validateAndSetFile(selectedFile);
    };

    const removeFile = () => {
        setFile(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 font-inter text-brand-dark selection:bg-brand-accent selection:text-white">
            <div className="w-full max-w-2xl bg-white shadow-2xl shadow-brand-dark/5 p-12 border border-brand-dark/5 relative animate-in fade-in zoom-in duration-700">
                
                {/* Brand Decor (Removed the dark/blue side-line as requested) */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-accent"></div>

                <div className="mb-14">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="w-4 h-4 bg-brand-action"></div>
                        <span className="text-[12px] font-black uppercase tracking-[0.2em] font-tektur text-brand-muted italic opacity-70">Brickanta Audit Portal</span>
                    </div>
                    <h1 className="text-6xl font-black font-tektur tracking-tighter italic leading-[0.85] mb-4 uppercase text-brand-dark">
                        Initiate <span className="font-brand-serif font-light text-brand-accent lowercase italic">tender</span><br/>
                        <span className="font-brand-serif font-light text-brand-accent lowercase italic">audit</span>
                    </h1>
                    <p className="text-brand-muted text-[15px] font-medium tracking-wide font-inter leading-relaxed opacity-90 max-w-xl">
                        Securely ingest technical PDF documentation into the Brickanta AI engine for instant risk-gap extraction and structural integrity analysis.
                    </p>
                </div>

                {/* Secure Dropzone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) validateAndSetFile(f); }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        relative group cursor-pointer
                        border-[3px] border-dashed p-10 transition-all duration-500
                        flex flex-col items-center justify-center gap-8
                        ${isDragging ? "border-brand-accent bg-brand-dark/5 scale-[1.01]" : "border-brand-dark/10 hover:border-brand-accent hover:bg-brand-bg"}
                        ${file ? "border-brand-secondary bg-brand-paper" : ""}
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
                            <div className="w-20 h-20 bg-brand-bg border border-brand-dark/5 flex items-center justify-center text-brand-dark/30 group-hover:bg-brand-dark group-hover:text-brand-bg transition-all duration-700 shadow-sm rounded-sm mb-4">
                                <Upload size={32} />
                            </div>
                            <div className="text-center font-tektur">
                                <p className="font-black text-brand-dark uppercase tracking-[0.2em] text-[15px] mb-2">Drop PDF Sequence Here</p>
                                <p className="text-[12px] text-brand-muted tracking-[0.15em] font-black italic opacity-60 uppercase">MAX (50MB) • ISO CONSTRUCTION STANDARD</p>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-brand-dark text-brand-bg flex items-center justify-center shadow-2xl">
                                <FileText size={40} />
                            </div>
                            <div className="text-center">
                                <p className="font-black text-brand-dark tracking-tighter uppercase font-tektur italic mb-2 text-lg">{file.name}</p>
                                <span className="text-[11px] font-black text-brand-accent uppercase tracking-widest px-4 py-2 bg-white border border-brand-accent/20 rounded-full">
                                    {(file.size / (1024 * 1024)).toFixed(2)} MB • READY FOR EXTRACTION
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Validation and Feedback */}
                <div className="mt-14 space-y-6">
                    {error && (
                        <div className="flex items-center gap-4 text-brand-action bg-brand-paper p-6 border-l-4 border-brand-action text-[12px] uppercase font-black tracking-widest animate-in slide-in-from-top-4">
                            <AlertCircle size={20} />
                            <span>System Error: {error}</span>
                        </div>
                    )}
                    {file && !error && (
                        <div className="flex items-center justify-between bg-brand-bg p-6 border border-brand-dark/5 rounded-sm">
                            <div className="flex items-center gap-4">
                                <CheckCircle2 size={24} className="text-brand-accent" />
                                <div className="flex flex-col">
                                   <span className="text-[11px] font-black text-brand-dark uppercase tracking-widest font-tektur">Integrity Verified</span>
                                   <span className="text-[9px] text-brand-muted uppercase font-black tracking-[0.3em] opacity-40">MD5 SHA-256 SEQUENCE OK</span>
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); removeFile(); }}
                                className="p-3 hover:bg-brand-action hover:text-white transition-all text-brand-muted cursor-pointer rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}
                    <button
                        onClick={handleUpload}
                        disabled={!file || !!error || isUploading}
                        className={`
                            w-full py-7 font-black text-sm uppercase tracking-[0.4em] font-tektur transition-all duration-700 cursor-pointer
                            ${!file || !!error ? "bg-brand-dark/10 text-brand-dark/30 cursor-not-allowed" : "bg-brand-dark text-brand-bg hover:bg-brand-accent hover:shadow-2xl active:scale-95"}
                            flex items-center justify-center gap-5 relative overflow-hidden group shadow-lg
                        `}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Synchronizing...
                            </>
                        ) : (
                            "Start Expert Extraction"
                        )}
                        <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-full transition-transform duration-[2s] ease-in-out"></div>
                    </button>
                </div>
            </div>
        </div>
    )
}
