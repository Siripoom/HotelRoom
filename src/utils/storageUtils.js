// src/utils/storageUtils.js
import { supabase } from "../lib/supabase";
import { v4 as uuidv4 } from "uuid";

// ฟังก์ชันอัปโหลดรูปภาพ
export const uploadImage = async (file, bucket = "rooms") => {
  try {
    // ตรวจสอบประเภทไฟล์
    if (!file.type.startsWith("image/")) {
      throw new Error("Please upload an image file");
    }

    // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`; // ไม่ต้องมีโฟลเดอร์ย่อย

    // อัปโหลดไฟล์ไปที่ Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    // สร้าง URL สำหรับเข้าถึงรูปภาพ
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

// ฟังก์ชันลบรูปภาพ
export const deleteImage = async (url, bucket = "rooms") => {
  try {
    if (!url) return;

    // แยกชื่อไฟล์จาก URL
    const urlParts = url.split("/");
    const fileName = urlParts[urlParts.length - 1];

    if (!fileName) return;

    // ลบไฟล์จาก Supabase Storage
    const { error } = await supabase.storage.from(bucket).remove([fileName]);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};
