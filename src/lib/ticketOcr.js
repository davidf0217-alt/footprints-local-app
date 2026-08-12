const cityPattern = /(?:始发站|出发地|出发|FROM|From|起飞地)\s*[:：]?\s*([\u4e00-\u9fa5]{2,8})[\s\S]{0,60}?(?:终到站|目的地|到达|TO|To|降落地)\s*[:：]?\s*([\u4e00-\u9fa5]{2,8})/i;
const routePattern = /([\u4e00-\u9fa5]{2,8})\s*(?:—|–|-|→|至)\s*([\u4e00-\u9fa5]{2,8})/;
const datePattern = /(20\d{2})[./年-](\d{1,2})[./月-](\d{1,2})/;
const flightPattern = /\b([A-Z]{2}\s?\d{3,4})\b/i;
const trainPattern = /\b([GDCZTK]\s?\d{1,4})\b/i;

export function parseTicketText(text) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const route = normalized.match(cityPattern) || normalized.match(routePattern);
  const date = normalized.match(datePattern);
  const flight = normalized.match(flightPattern);
  const train = normalized.match(trainPattern);
  const ticketNumber = flight?.[1]?.replace(/\s/g, "") || train?.[1]?.replace(/\s/g, "") || "";
  const dateValue = date ? `${date[1]}-${String(date[2]).padStart(2, "0")}-${String(date[3]).padStart(2, "0")}` : "";
  return { rawText: normalized, type: flight ? "机票" : train ? "火车票" : "行程单", ticketNumber, departure: route?.[1] || "", arrival: route?.[2] || "", date: dateValue };
}

export async function recognizeTicket(file, onProgress) {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker(["chi_sim", "eng"], 1, { logger: (message) => onProgress?.(message.status === "recognizing text" ? `正在识别 ${Math.round(message.progress * 100)}%` : "正在准备本地识别…") });
  try {
    const { data } = await worker.recognize(file);
    return parseTicketText(data.text);
  } finally { await worker.terminate(); }
}
