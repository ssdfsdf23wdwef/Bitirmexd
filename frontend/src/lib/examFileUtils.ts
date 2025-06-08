// Sınav verisini markdown olarak indirmek için yardımcı fonksiyon
export function downloadExamAsMarkdown(examData: any, filename: string = "giden_sinav.md") {
  const md = `# Sınav Verisi\n\n\n\u0060\u0060\u0060json\n${JSON.stringify(examData, null, 2)}\n\u0060\u0060\u0060`;
  const blob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
