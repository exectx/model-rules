import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function dedent(str: string) {
  const lines = str.split("\n");

  if (lines[0].trim() === "") {
    lines.shift();
  }
  if (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }

  const minIndent = Math.min(
    ...lines
      .filter((line) => line.trim())
      .map((line) => line.match(/^\s*/)?.[0].length ?? 0)
  );

  if (minIndent === Infinity) {
    return lines.join("\n");
  }

  return lines.map((line) => line.slice(minIndent)).join("\n");
}
