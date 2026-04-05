"use server";

import { supabase } from " /lib/supabase";


export async function uploadTenderToSupabase(formData: FormData) {

    try {
        const file = formData.get("file") as File;
        if (!file) throw new Error("No Files selected");
        const buffer = await file.arrayBuffer();

        const { data, error } = await supabase.storage.from("Files").upload(`${Date.now()}-${file.name}`, buffer, {
            contentType: "application/pdf",
            upsert: false,
        });

        if (error) throw error;
        return { success: true, path: data.path };

    } catch (error: any) {
        console.error("Upload error:", error);
        return {
            success: false, error: error.message
        };

    }

}