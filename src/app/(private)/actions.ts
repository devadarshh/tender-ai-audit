"use server";

import { prisma } from "@/lib/prisma";
import { fileQueue } from "@/lib/queue";
import { supabase } from "@/lib/supabase";

export async function uploadTenderToSupabase(formData: FormData, projectId: string) {
    try {
        const file = formData.get("file") as File;
        if (!file) throw new Error("No file selected");

        const buffer = await file.arrayBuffer();
        
        // 1. Upload to Supabase Storage
        const fileName = `${Date.now()}-${file.name}`;
        const { data, error: uploadError } = await supabase.storage
            .from("Files")
            .upload(fileName, buffer, {
                contentType: "application/pdf",
                upsert: false,
            });

        if (uploadError) throw uploadError;

        // 2. Database Record: Ensure Project exists then create Document
        const doc = await prisma.document.create({
            data: {
                fileName: file.name,
                fileUrl: data.path,
                status: "uploaded",
                project: {
                    connectOrCreate: {
                        where: { id: projectId },
                        create: { id: projectId },
                    },
                },
            },
        });

        // 3. Queue the background processing job
        // Senior Tip: Always log when adding to queue to verify producer is working
        console.log(`📡 Adding document ${doc.id} to file-upload-queue...`);
        
        await fileQueue.add("process-pdf", {
            documentId: doc.id
        });

        return { 
            success: true, 
            path: data.path, 
            documentId: doc.id 
        };

    } catch (error: any) {
        console.error("Upload Action Pipeline Error:", error);
        return {
            success: false,
            error: error.message || "An unexpected error occurred"
        };
    }
}