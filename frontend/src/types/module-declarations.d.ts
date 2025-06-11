// Type declarations for modules without type definitions
declare module "@mui/material";
declare module "@mui/icons-material/Add";
declare module "@mui/icons-material/AutoFixHigh";
declare module "react-router-dom";

// Google Analytics gtag type declarations
declare global {
  interface Window {
    gtag?: (
      command: "config" | "event" | "js" | "get",
      targetId: string | Date,
      config?: {
        page_path?: string;
        previousPath?: string;
        [key: string]: any;
      },
    ) => void;
  }
}

export {};
