import React from "react";

import { LearningTargetStatus } from "../types/learningTarget.type";
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { CourseStatus, CourseStatusInfo } from "../types/status.type"; // Güncellendi

const statusConfig: Record<LearningTargetStatus, CourseStatusInfo> = {
  // StatusInfo -> CourseStatusInfo olarak güncellendi
  pending: {
    label: "beklemede" as CourseStatus, // Tip uyumu için eklendi
    color: "text-secondary",
    bgColor: "bg-secondary/20",
    borderColor: "border-secondary",
    icon: <Clock className="text-secondary" />,
    description: "",
  },
  failed: {
    label: "başarısız" as CourseStatus, // Tip uyumu için eklendi
    color: "text-state-error",
    bgColor: "bg-state-error-bg",
    borderColor: "border-state-error-border",
    icon: <XCircle className="text-state-error" />,
    description: "",
  },
  medium: {
    label: "orta" as CourseStatus, // Tip uyumu için eklendi
    color: "text-state-warning",
    bgColor: "bg-state-warning-bg",
    borderColor: "border-state-warning-border",
    icon: <AlertCircle className="text-state-warning" />,
    description: "",
  },
  mastered: {
    label: "başarılı" as CourseStatus, // Tip uyumu için eklendi
    color: "text-state-success",
    bgColor: "bg-state-success-bg",
    borderColor: "border-state-success-border",
    icon: <CheckCircle className="text-state-success" />,
    description: "",
  },
};

/**
 * Durum değerine göre stil bilgilerini döndüren yardımcı fonksiyon
 */
export function getStatusStyle(status: LearningTargetStatus): CourseStatusInfo {
  // StatusInfo -> CourseStatusInfo olarak güncellendi
  return statusConfig[status];
}
