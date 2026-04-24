export function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \u00A0]+$/gm, '')
    .replace(/^[ \u00A0]+/gm, '')
    .trim()
}

export function cleanResumeText(text: string): string {
  let cleaned = normalizeText(text)

  cleaned = cleaned.replace(/\[CHART/g, '')
  cleaned = cleaned.replace(/\d+\.\d+\.\d+\.\d+/g, '')
  cleaned = cleaned.replace(/http[s]?:\/\/\S+/g, '')

  const lines = cleaned.split('\n')
  const filteredLines = lines
    .map(line => line.trim())
    .filter(line => line.length > 0)

  return filteredLines.join('\n')
}
