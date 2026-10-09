export type ParsedRow = { name: string; value: string; unit: string; range: string; region: string; status: "正常" | "需关注" | "异常" };

const regionFor = (name: string) => {
  const n = name.toLowerCase();
  if (/alt|ast|肝|胆红素|bilirubin/.test(n)) return "肝脏";
  if (/肌酐|creatinine|尿酸|uric|尿素|urea|肾/.test(n)) return "肾脏";
  if (/心|ecg|troponin|心电/.test(n)) return "心脏";
  if (/肺|呼吸|lung/.test(n)) return "肺部";
  if (/脊|vertebra/.test(n)) return "脊柱";
  return "未关联";
};

export async function extractPdfText(file: File) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.mjs", import.meta.url).toString();
  const document = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map(item => "str" in item ? item.str : "").join(" "));
  }
  const cleanup = (document as unknown as { destroy?: () => Promise<void> }).destroy;
  if (typeof cleanup === "function") await cleanup.call(document);
  return pages.join("\n");
}

export function parseVerifiedValues(text: string): ParsedRow[] {
  const compact = text.replace(/\s+/g, " ");
  const pattern = /([A-Za-z\u4e00-\u9fff][A-Za-z\u4e00-\u9fff0-9()/% .-]{1,36}?)\s+(-?\d+(?:\.\d+)?)\s*([a-zA-Zμµ/%^0-9.-]{0,14})\s*(?:参考(?:范围|值)?[:：]?\s*)?(-?\d+(?:\.\d+)?)\s*(?:-|–|—|~|至)\s*(-?\d+(?:\.\d+)?)/g;
  const rows: ParsedRow[] = []; const seen = new Set<string>(); let match: RegExpExecArray | null;
  while ((match = pattern.exec(compact)) && rows.length < 24) {
    const [, rawName, rawValue, unit, low, high] = match; const name = rawName.trim().replace(/[：:]+$/, "");
    const value = Number(rawValue), min = Number(low), max = Number(high); if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || min >= max) continue;
    const key = `${name}-${rawValue}-${low}-${high}`; if (seen.has(key)) continue; seen.add(key);
    rows.push({ name, value: rawValue, unit: unit || "", range: `${low}–${high}`, region: regionFor(name), status: value < min || value > max ? "异常" : "正常" });
  }
  return rows;
}
