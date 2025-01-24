import * as path from "path"
import * as pdfjs from "pdfjs-dist"
import mammoth from "mammoth"
import fs from "fs/promises"
import { isBinaryFile } from "isbinaryfile"

export async function extractTextFromFile(filePath: string): Promise<string> {
	try {
		await fs.access(filePath)
	} catch (error) {
		throw new Error(`File not found: ${filePath}`)
	}
	const fileExtension = path.extname(filePath).toLowerCase()
	switch (fileExtension) {
		case ".pdf":
			return extractTextFromPDF(filePath)
		case ".docx":
			return extractTextFromDOCX(filePath)
		case ".ipynb":
			return extractTextFromIPYNB(filePath)
		default:
			const isBinary = await isBinaryFile(filePath).catch(() => false)
			if (!isBinary) {
				return await fs.readFile(filePath, "utf8")
			} else {
				throw new Error(`Cannot read text for file type: ${fileExtension}`)
			}
	}
}

async function extractTextFromPDF(filePath: string): Promise<string> {
	const dataBuffer = await fs.readFile(filePath)
	// Load PDF document
	const loadingTask = pdfjs.getDocument({
		data: dataBuffer,
	})
	const pdfDocument = await loadingTask.promise

	let fullText = ""

	// Process each page
	for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
		const page = await pdfDocument.getPage(pageNum)
		const textContent = await page.getTextContent({
			disableNormalization: false,
			includeMarkedContent: false,
		})

		let pageText = ""
		let lastY = null

		// Process text items
		for (const item of textContent.items) {
			const ty = item.transform[5] // Get Y position from transform matrix
			if (lastY === ty) {
				pageText += item.str
			} else {
				if (lastY !== null) pageText += "\n"
				pageText += item.str
				lastY = ty
			}
		}

		fullText += `${pageText}\n\n`
	}

	return fullText.trim()
}

async function extractTextFromDOCX(filePath: string): Promise<string> {
	const result = await mammoth.extractRawText({ path: filePath })
	return result.value
}

async function extractTextFromIPYNB(filePath: string): Promise<string> {
	const data = await fs.readFile(filePath, "utf8")
	const notebook = JSON.parse(data)
	let extractedText = ""

	for (const cell of notebook.cells) {
		if ((cell.cell_type === "markdown" || cell.cell_type === "code") && cell.source) {
			extractedText += cell.source.join("\n") + "\n"
		}
	}

	return extractedText
}
