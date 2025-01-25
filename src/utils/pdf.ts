// @ts-ignore - Suppress type checking for pdfjs-dist
const PDFJS = require("pdfjs-dist/build/pdf.js")

export async function parsePDF(dataBuffer: Buffer): Promise<{ text: string }> {
	PDFJS.disableWorker = true

	let fullText = ""

	try {
		const doc = await PDFJS.getDocument(dataBuffer)
		const numPages = doc.numPages

		for (let pageNum = 1; pageNum <= numPages; pageNum++) {
			const page = await doc.getPage(pageNum)
			const textContent = await page.getTextContent()

			const pageText = textContent.items
				.filter((item: any): item is { str: string } => "str" in item)
				.map((item: { str: any }) => item.str)
				.join(" ")

			fullText += pageText + "\n"
		}

		return { text: fullText }
	} catch (error) {
		throw new Error(`Failed to parse PDF: ${error.message}`)
	}
}
