const multer = require("multer")

const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/octet-stream", // some browsers send PDFs with this type
    "binary/octet-stream",
]

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (_req, file, cb) => {
        const isPdf =
            ALLOWED_MIME_TYPES.includes(file.mimetype) ||
            file.originalname.toLowerCase().endsWith(".pdf")

        if (isPdf) {
            cb(null, true)
        } else {
            cb(new Error("Only PDF files are allowed."), false)
        }
    }
})


module.exports = upload