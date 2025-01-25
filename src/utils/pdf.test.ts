import * as assert from "assert"
import { describe, it } from "mocha"
import { parsePDF } from "./pdf"
import fs from "fs/promises"
import path from "path"

describe("PDF Parser", () => {
	const testFilePath = path.join(__dirname, "..", "..", "..", "assets", "read-pdf-test", "test_document.pdf")

	it("should extract text from test_document.pdf", async () => {
		const buffer = await fs.readFile(testFilePath)
		const result = await parsePDF(buffer)
		const text = result.text.trim()

		console.log("Extracted text tail:", text.slice(-100))
		assert.ok(text.length > 0, "PDF content should not be empty")
	})
})
