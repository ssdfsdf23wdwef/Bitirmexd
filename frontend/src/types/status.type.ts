
import React from "react"; // Eklendi

export type CourseStatus = "basarılı" | "orta" | "başarısız" | "beklemede"; // Eklendi


// Eklendi
export interface CourseStatusInfo {
  label: CourseStatus;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  description: string;
}

