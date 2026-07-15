# Interview Questions — Interview AI (yt-genai)

A comprehensive list of interview questions covering every part of this project's stack and architecture.

---

## Table of Contents
1. [JavaScript & Node.js](#1-javascript--nodejs)
2. [Express.js & REST API](#2-expressjs--rest-api)
3. [MongoDB & Mongoose](#3-mongodb--mongoose)
4. [Authentication — JWT & Cookies](#4-authentication--jwt--cookies)
5. [File Uploads & PDF Processing](#5-file-uploads--pdf-processing)
6. [Google Generative AI (Gemini)](#6-google-generative-ai-gemini)
7. [Puppeteer & PDF Generation](#7-puppeteer--pdf-generation)
8. [React & Frontend](#8-react--frontend)
9. [Vite & Build Tooling](#9-vite--build-tooling)
10. [CORS & Security](#10-cors--security)
11. [System Design & Architecture](#11-system-design--architecture)
12. [Error Handling & Debugging](#12-error-handling--debugging)

---

## 1. JavaScript & Node.js

**Q1. What is the difference between `require()` and `import`?**
> `require()` is CommonJS (synchronous, Node.js native). `import` is ES Modules (static, tree-shakeable). This backend uses CommonJS (`require`); the frontend uses ESM (`import`).

**Q2. What is the event loop in Node.js and why does it matter for this project?**
> Node's single-threaded event loop handles async I/O non-blockingly. Since this project calls an external AI API, parses PDFs, and queries MongoDB, all of which are I/O operations, using `async/await` keeps the server responsive while those operations complete.

**Q3. What does `async/await` do under the hood?**
> It is syntactic sugar over Promises. `await` pauses execution of the current async function until the Promise resolves, without blocking the event loop.

**Q4. What is the difference between `==` and `===` in JavaScript?**
> `==` does type coercion; `===` checks value and type strictly. Always prefer `===`.

**Q5. What is a closure?**
> A function that retains access to variables from its outer scope even after that scope has exited. Used implicitly throughout this project in middleware and route handlers.

**Q6. What is the difference between `null` and `undefined`?**
> `undefined` means a variable was declared but not assigned. `null` is an explicit "no value." Both are falsy.

**Q7. How does `Promise.all()` differ from sequential `await`?**
> `Promise.all()` runs promises in parallel and resolves when all complete (or rejects on the first failure). Sequential `await` runs one after another. Parallel is faster when tasks are independent.

**Q8. What are higher-order functions? Give an example from this project.**
> Functions that take or return other functions. The `cors()` middleware accepts an `origin` callback — a higher-order function pattern used in `app.js`.

---

## 2. Express.js & REST API

**Q9. What is middleware in Express and how does it work?**
> Middleware functions have `(req, res, next)` signatures. They execute in order and call `next()` to pass control. This project uses middleware for JSON parsing (`express.json()`), cookie parsing (`cookie-parser`), CORS, authentication, and file uploads (Multer).

**Q10. What is the difference between `app.use()` and `app.get()`/`app.post()`?**
> `app.use()` matches any HTTP method and can match partial paths (used for global middleware and routers). `app.get()`/`app.post()` match specific methods and exact paths.

**Q11. How does Express routing work in this project?**
> Routes are split into `auth.routes.js` and `interview.routes.js`, mounted via `app.use("/api/auth", authRouter)` and `app.use("/api/interview", interviewRouter)`. This keeps concerns separated.

**Q12. What is the difference between `res.json()` and `res.send()`?**
> `res.json()` sets `Content-Type: application/json` and serializes the object. `res.send()` is generic — it infers type. The PDF endpoint uses `res.send(pdfBuffer)` with an explicit `Content-Type: application/pdf` header.

**Q13. How do you handle errors globally in Express?**
> By adding a 4-argument error middleware `(err, req, res, next)` after all routes. This project handles errors per-controller with try/catch blocks.

**Q14. What HTTP status codes does this project use, and why?**
> `201` — resource created (new interview report); `200` — success; `400` — bad request (missing file/fields); `401` — unauthorized (missing/invalid token); `404` — not found; `500` — internal server error.

**Q15. What is `express.Router()` and why use it?**
> `Router` is a mini Express app for grouping related routes. It makes the codebase modular — each feature (auth, interview) has its own router file.

---

## 3. MongoDB & Mongoose

**Q16. What is the difference between SQL and NoSQL databases? Why use MongoDB here?**
> SQL databases are relational with a fixed schema. MongoDB is document-based and schema-flexible. Here it suits interview reports well — they have nested arrays (questions, skill gaps, preparation plan) that map naturally to JSON documents.

**Q17. What is Mongoose and what does it add over the native MongoDB driver?**
> Mongoose is an ODM (Object Document Mapper). It adds schema validation, type casting, virtuals, middleware (hooks), and a clean query API on top of the raw driver.

**Q18. What is the difference between `findById()` and `findOne()`?**
> `findById(id)` is shorthand for `findOne({ _id: id })`. Both are used in this project: `findById` for PDF generation, `findOne` for report retrieval (scoped to the logged-in user for security).

**Q19. What does `.select("-resume -selfDescription ...")` do in `getAllInterviewReportsController`?**
> It excludes heavy fields from the query response to reduce payload size. The `-` prefix means "exclude this field."

**Q20. What does `.sort({ createdAt: -1 })` do?**
> It sorts documents by `createdAt` in descending order (newest first). Mongoose/MongoDB adds `createdAt` automatically when `timestamps: true` is set in the schema.

**Q21. What is the risk of storing user data without ownership checks?**
> An attacker could access other users' reports by guessing an ID. This project mitigates it by scoping queries with `{ _id: id, user: req.user.id }`.

**Q22. What is a MongoDB ObjectId?**
> A 12-byte unique identifier automatically assigned as `_id`. It encodes a timestamp, machine ID, and sequence number.

---

## 4. Authentication — JWT & Cookies

**Q23. What is a JWT and what are its three parts?**
> JSON Web Token: a Base64-encoded `header.payload.signature`. The header names the algorithm (e.g. HS256), the payload holds claims (e.g. user ID), and the signature verifies integrity using a secret key.

**Q24. Why store the JWT in a cookie instead of localStorage?**
> Cookies with `httpOnly` flag are inaccessible to JavaScript, preventing XSS attacks. `localStorage` can be read by any script on the page.

**Q25. What does `withCredentials: true` do in Axios?**
> Tells the browser to send cookies cross-origin. Required here because the frontend and backend run on different ports (5173 and 3000), so they are different origins.

**Q26. How does the token blacklist work in this project?**
> On logout, the token is saved to a `blacklist` MongoDB collection. The `authUser` middleware checks this collection before verifying the token. This allows stateless JWTs to be "invalidated."

**Q27. What is the downside of a database blacklist for token invalidation?**
> Every authenticated request requires a DB lookup. At scale, this can become a bottleneck. Alternatives include short-lived tokens with refresh tokens, or in-memory caching (Redis).

**Q28. What happens if `JWT_SECRET` is weak or leaked?**
> An attacker could forge valid tokens and impersonate any user. The secret must be long, random, and kept in environment variables — never hardcoded.

---

## 5. File Uploads & PDF Processing

**Q29. What is Multer and how is it configured in this project?**
> Multer is Express middleware for handling `multipart/form-data`. It is configured with `memoryStorage()` (files stored in RAM as `Buffer`), a 3MB size limit, and a `fileFilter` that rejects non-PDF files.

**Q30. What is `memoryStorage` vs `diskStorage` in Multer?**
> `memoryStorage` keeps the file in RAM as `req.file.buffer` — fast but limited by memory. `diskStorage` saves to disk — better for large files. Since PDFs here are small (≤3MB) and processed immediately, memory storage is appropriate.

**Q31. How does `pdf-parse` extract text from a PDF?**
> It reads the PDF binary buffer and extracts embedded text streams from each page. It does NOT use OCR — scanned image-only PDFs will return empty text.

**Q32. What is the correct API for `pdf-parse`?**
> `const data = await pdfParse(buffer)`. It returns `{ text, numpages, info, ... }`. A common bug is treating it as a class (`new pdfParse.PDFParse(...)`), which throws a TypeError.

**Q33. What happens if a user uploads a scanned PDF with no embedded text?**
> `pdf-parse` returns an empty or near-empty string. This project guards against it with an empty-text check that returns a 400 error with a user-friendly message.

**Q34. What is `FormData` in the browser and why is it used here?**
> `FormData` builds a `multipart/form-data` request body that can carry both text fields and binary files. Used in `generateInterviewReport` to send the resume file alongside text fields to the backend.

---

## 6. Google Generative AI (Gemini)

**Q35. What is structured output / response schema in the Gemini API?**
> You can pass a JSON schema to constrain the model's output format. This project uses `zodToJsonSchema()` to convert a Zod schema into a JSON schema, ensuring the AI always returns a valid, predictable object.

**Q36. What is Zod and why use it here?**
> Zod is a TypeScript-first schema validation library. Here it defines the expected shape of the AI response (match score, questions, skill gaps, preparation plan). `zodToJsonSchema` converts it for the Gemini API's `responseSchema` config.

**Q37. What is `responseMimeType: "application/json"` in the Gemini config?**
> It instructs the model to return raw JSON rather than markdown-wrapped JSON or prose. Combined with `responseSchema`, it guarantees a parseable response.

**Q38. What could go wrong if the AI returns malformed JSON?**
> `JSON.parse(response.text)` would throw a SyntaxError, crashing the request. The try/catch in the controller now catches this and returns a 500 with the error message.

**Q39. Why is the AI prompt important for resume generation quality?**
> The prompt in `generateResumePdf` instructs the AI to produce ATS-friendly, human-sounding HTML. Vague prompts produce generic resumes; detailed prompts with constraints produce tailored, professional output.

**Q40. What are the risks of passing raw user input directly into an AI prompt?**
> Prompt injection — a malicious user could embed instructions in their resume or job description to manipulate the AI's output. Mitigation includes input sanitization and output validation.

---

## 7. Puppeteer & PDF Generation

**Q41. What is Puppeteer?**
> A Node.js library that controls a headless Chromium browser via the DevTools Protocol. Used here to render AI-generated HTML to a PDF.

**Q42. Why does Puppeteer need `--no-sandbox` on Replit/Linux containers?**
> Chromium's sandbox requires kernel-level user namespaces. Many cloud/container environments (Replit, Docker without `--privileged`) disable these. `--no-sandbox` bypasses the sandbox so the browser can launch.

**Q43. What does `waitUntil: "networkidle0"` mean in `page.setContent()`?**
> It waits until there are no more than 0 active network connections for 500ms before considering the page loaded. This ensures web fonts or external stylesheets referenced in the HTML are fully loaded before PDF rendering.

**Q44. What is the A4 paper format used in PDF generation?**
> 210mm × 297mm. The `page.pdf()` call uses `format: "A4"` with 20mm top/bottom and 15mm left/right margins to produce a professional single/double-page resume.

**Q45. What are the memory implications of launching Puppeteer per request?**
> Each launch spins up a Chromium process (~100–200MB RAM). For high traffic, a persistent browser pool (one shared instance with multiple pages) is more efficient. At current scale, per-request launch is acceptable.

---

## 8. React & Frontend

**Q46. What is the difference between controlled and uncontrolled components in React?**
> A controlled component's value is managed by React state (`value` + `onChange`). An uncontrolled component uses a ref or the DOM directly. File inputs are typically uncontrolled.

**Q47. What is React Router and how is it used here?**
> React Router v7 handles client-side navigation. It maps URL paths to page components without full page reloads.

**Q48. What is a custom hook and why use `useInterview`?**
> A custom hook is a function starting with `use` that encapsulates reusable stateful logic. `useInterview` wraps all the API calls, loading states, and error handling for the interview feature, keeping the UI component clean.

**Q49. What is Axios and how does it differ from `fetch`?**
> Axios is an HTTP client with automatic JSON serialization/deserialization, interceptors, request cancellation, and better error objects. `fetch` is native but more verbose for the same tasks.

**Q50. What does `responseType: "blob"` do in the PDF download request?**
> It tells Axios to return the response body as a `Blob` (binary data) rather than parsing it as JSON. Required to download the PDF file in the browser.

**Q51. How would you trigger a file download from a Blob in the browser?**
> Create an object URL with `URL.createObjectURL(blob)`, assign it to a temporary `<a>` tag's `href`, set a `download` attribute, click it programmatically, then revoke the URL.

**Q52. What is SASS and why use it over plain CSS?**
> SASS is a CSS preprocessor that adds variables, nesting, mixins, and functions. It improves maintainability for larger stylesheets.

---

## 9. Vite & Build Tooling

**Q53. What is Vite and why is it faster than Webpack in development?**
> Vite serves ES modules directly to the browser in dev mode (no bundling). It uses esbuild for pre-bundling dependencies. Webpack bundles everything first. Vite's HMR (Hot Module Replacement) is also faster.

**Q54. What is the Vite dev proxy configured in this project?**
> Requests to `/api/*` are forwarded to `http://localhost:3000`. This avoids CORS issues in development by making both frontend and backend appear to come from the same origin.

**Q55. What is `import.meta.env` in Vite?**
> Vite exposes environment variables prefixed with `VITE_` via `import.meta.env` at build time. This project uses `VITE_API_URL` (defaulting to `""`) to configure the backend base URL.

**Q56. What does `host: true` and `allowedHosts: true` do in Vite's server config?**
> `host: true` binds to `0.0.0.0` so the server is accessible from outside the local machine (required for Replit). `allowedHosts: true` disables the host-checking protection, necessary for reverse-proxied environments like Replit.

---

## 10. CORS & Security

**Q57. What is CORS and why does the browser enforce it?**
> Cross-Origin Resource Sharing. Browsers block requests from one origin (e.g. `localhost:5173`) to another (e.g. `localhost:3000`) unless the server explicitly allows it via `Access-Control-Allow-Origin` headers. This is a browser security policy, not a server-side restriction.

**Q58. Why does CORS require `credentials: true` on both the server and client?**
> Cookies are not sent cross-origin by default. The server must set `Access-Control-Allow-Credentials: true` AND specify an explicit origin (not `*`). The client must set `withCredentials: true`. Both sides must opt in.

**Q59. What is the difference between authentication and authorization?**
> Authentication verifies identity ("who are you?" — JWT check). Authorization verifies permission ("can you do this?" — e.g. the `user: req.user.id` scope on DB queries ensures a user can only access their own reports).

**Q60. What is XSS and how does this project partially mitigate it?**
> Cross-Site Scripting — injecting malicious scripts into a page. Using `httpOnly` cookies for the JWT prevents script access to the token. However, if AI-generated HTML is rendered directly in the browser without sanitization, it could be a vector.

**Q61. What is a brute-force attack on a login endpoint and how would you prevent it?**
> Repeatedly trying passwords. Prevention: rate limiting (e.g. `express-rate-limit`), account lockout after N failures, CAPTCHA. This project currently has no rate limiting.

---

## 11. System Design & Architecture

**Q62. Describe the end-to-end flow when a user uploads a resume.**
> 1. User fills the form and submits → Frontend `FormData` via Axios POST to `/api/interview/`  
> 2. Vite dev proxy forwards to Express on port 3000  
> 3. `authUser` middleware verifies the JWT cookie  
> 4. Multer parses the multipart body, validates the file is a PDF, stores it in memory  
> 5. Controller calls `pdf-parse` to extract text  
> 6. Text + form fields sent to Gemini API with a structured response schema  
> 7. AI returns JSON (match score, questions, skill gaps, prep plan)  
> 8. Report saved to MongoDB  
> 9. Report JSON returned to frontend as 201 response

**Q63. Why is the PDF stored as extracted text rather than the raw file?**
> Storing binary files in MongoDB is discouraged for large files (GridFS exists for that). Extracted text is small, queryable, and all downstream features (AI prompts, PDF generation) only need the text content anyway.

**Q64. What would you change to scale this to 10,000 concurrent users?**
> - Offload AI and Puppeteer calls to a background job queue (Bull/BullMQ + Redis) — they are slow and CPU-heavy  
> - Return a job ID immediately and poll or use WebSockets for completion  
> - Use a Puppeteer browser pool instead of launching per request  
> - Add caching (Redis) for repeated identical AI requests  
> - Horizontal scaling behind a load balancer

**Q65. What is the separation of concerns principle and how is it applied here?**
> Each layer has one responsibility: routes define URL-to-handler mapping, controllers handle request/response logic, services contain business logic (AI calls), models define data shape, and middleware handles cross-cutting concerns (auth, file upload).

**Q66. What would you store in environment variables vs. code?**
> Secrets and environment-specific config (DB URIs, API keys, JWT secrets) in env vars. Constants that don't change between environments (field names, pagination limits) in code.

---

## 12. Error Handling & Debugging

**Q67. What happens if `req.file` is undefined in the upload controller?**
> Before the fix, it threw `TypeError: Cannot read properties of undefined (reading 'buffer')` — an unhandled 500. After the fix, a guard returns a 400 with a clear message.

**Q68. What is the difference between a 400 and a 500 error?**
> 400 (Bad Request) is the client's fault — invalid input, missing fields. 500 (Internal Server Error) is the server's fault — unexpected crash, DB failure, AI API error.

**Q69. Why should you never return raw error stack traces to the client in production?**
> Stack traces reveal internal file paths, library versions, and code structure — valuable information for an attacker. Log them server-side, return only a generic message to the client.

**Q70. How would you add request logging to this project?**
> Use the `morgan` middleware: `app.use(morgan("dev"))`. It logs method, URL, status code, and response time for every request.

**Q71. How would you debug an issue where the PDF download button downloads a corrupt file?**
> 1. Check the network tab — is the response `Content-Type: application/pdf`?  
> 2. Is `responseType: "blob"` set in Axios?  
> 3. Log the buffer size on the backend before sending  
> 4. Check if the error is in Puppeteer (inspect server logs), AI (malformed HTML), or the Blob URL creation on the frontend

**Q72. What is `console.error` vs `console.log` and when should you use each?**
> `console.error` writes to stderr and is conventionally used for errors. `console.log` writes to stdout for general output. In production, structured logging libraries (Winston, Pino) replace both.

---

*Last updated: July 2026*
