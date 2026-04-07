import { toPng } from "html-to-image"

function sanitizeFilename(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function downloadElementAsPng(element: HTMLElement, filename: string) {
  await document.fonts?.ready?.catch(() => undefined)

  const dataUrl = await toPng(element, {
    cacheBust: true,
    backgroundColor: "#060d0d",
    pixelRatio: Math.max(2, window.devicePixelRatio || 1),
    filter: (node) => !(node instanceof HTMLElement && node.dataset.pngIgnore === "true"),
  })

  const link = document.createElement("a")
  link.download = `${sanitizeFilename(filename) || "chart"}.png`
  link.href = dataUrl
  link.click()
}
