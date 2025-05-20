import fs from 'fs'; // For file system operations
import path from 'path'; // For path manipulation
import os from 'os';

export const createResumePath = async (uploadedFile: File) => {
    // Create a temporary file path
    const tempDir = os.tmpdir(); // System's temporary directory
    // Ensure tempDir exists (usually does, but good practice for some environments)
    if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempFilePath = path.join(tempDir, `${Date.now()}-${uploadedFile.name}`);

    // Get file content as ArrayBuffer, then convert to Node.js Buffer
    const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());

    // Write file to temp path
    fs.writeFileSync(tempFilePath, fileBuffer);
    console.log(`File saved temporarily to: ${tempFilePath}`);
    return tempFilePath;
}