# BGV Platform — REST API Documentation

Welcome to the Background Verification (BGV) Platform API documentation. This REST API facilitates candidate management, automated background verification check flows (Aadhaar & PAN cards), dashboard statistics collection, and secure PDF report generation.

---

## 🔒 Authentication & Headers

All endpoints except `Authentication`, `Mock API`, and `Health Check` require bearer token authorization.

### Required Request Headers
```http
Authorization: Bearer <your-jwt-token>
x-request-id: <uuid> (Optional - generated automatically if not provided)
Content-Type: application/json
```

### Security & Controls
1. **JWT Verification**: Tokens are signed using HS256 (`JWT_SECRET`) and expire in **7 days**.
2. **Helmet Protections**: Restricts frames (`Frameguard: deny`), blocks MIME-sniffing (`noSniff`), and enforces standard XSS filtering.
3. **CORS Restrictions**: Requests are limited to origins specified in the `FRONTEND_URL` or `FRONTEND_URLS` environment variables.
4. **Rate Limiting Policies**:
   * **General API**: Max `100` requests per 15 minutes per IP.
   * **Authentication**: Max `5` registration or login attempts per 15 minutes per IP.
   * **Verifications**: Max `10` external verification starts per 1 hour per IP.

---

## 🧭 Endpoint Index

### 🔐 1. Authentication
Endpoints for register and login flows. No token authentication required.

#### `POST /api/auth/register`
Creates a new user (Recruiter/Admin).
* **Rate Limit**: 5 requests / 15 minutes.
* **Request Body**:
```json
{
  "name": "Jane Recruiter",
  "email": "recruiter@example.com",
  "password": "Password123"
}
```
* **Validation Rules**:
  * `name`: Required string, min 2 characters.
  * `email`: Required valid email string (case-insensitive).
  * `password`: Required string, min 8 characters, must contain at least one digit.

* **Response (201 Created)**:
```json
{
  "id": "e94ba67b-1dcc-4509-9064-fe42bcd4e87e",
  "name": "Jane Recruiter",
  "email": "recruiter@example.com",
  "role": "RECRUITER"
}
```

* **Error Responses**:
  * `400 Bad Request`: Validation failure (e.g. password too short, invalid email).
  * `409 Conflict`: `{"error": "Email already registered"}`.

---

#### `POST /api/auth/login`
Authenticates a user and returns a JWT token.
* **Rate Limit**: 5 requests / 15 minutes.
* **Request Body**:
```json
{
  "email": "recruiter@example.com",
  "password": "Password123"
}
```
* **Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "e94ba67b-1dcc-4509-9064-fe42bcd4e87e",
    "name": "Jane Recruiter",
    "email": "recruiter@example.com",
    "role": "RECRUITER"
  }
}
```
* **Error Responses**:
  * `401 Unauthorized`: `{"error": "Invalid email or password"}`.

---

### 👥 2. Candidates
Manage candidate profiles. Ownership check enforced; users can only interact with candidates they created.

#### `POST /api/candidates`
Creates a new candidate profile.
* **Request Body**:
```json
{
  "fullName": "John Smith",
  "email": "john.smith@example.com",
  "phone": "9876543210",
  "aadhaarNumber": "123456789012",
  "panNumber": "ABCDE1234F",
  "dob": "1985-10-20",
  "address": "456 Elm St, City, Country"
}
```
* **Validation Rules**:
  * `fullName`: String, min 2 characters.
  * `email`: Valid email string.
  * `phone`: Exactly 10 digits.
  * `aadhaarNumber`: Exactly 12 digits.
  * `panNumber`: Valid Indian PAN card format (`[A-Z]{5}[0-9]{4}[A-Z]{1}`).
  * `dob`: Valid Date representation.
  * `address`: String, min 10 characters.

* **Response (201 Created)**:
  * *Note: Aadhaar numbers are permanently masked in all response payloads (`XXXX-XXXX-LAST4`) for security.*
```json
{
  "id": "00976c2d-48b8-4d40-89c0-a5eacc379e65",
  "fullName": "John Smith",
  "email": "john.smith@example.com",
  "phone": "9876543210",
  "aadhaarNumber": "XXXX-XXXX-9012",
  "panNumber": "ABCDE1234F",
  "dob": "1985-10-20T00:00:00.000Z",
  "address": "456 Elm St, City, Country",
  "status": "PENDING",
  "createdById": "e94ba67b-1dcc-4509-9064-fe42bcd4e87e",
  "createdAt": "2026-05-21T09:10:23.273Z"
}
```

---

#### `GET /api/candidates`
Retrieves a paginated list of candidates created by the authenticated user.
* **Query Parameters** (Optional):
  * `page`: Number, default `1`.
  * `limit`: Number, default `10`.
  * `search`: String, filters by `fullName` or `email` (case-insensitive).
  * `status`: Filters by candidate verification status (`PENDING`, `VERIFIED`, `FAILED`, `PARTIAL`).
* **Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "00976c2d-48b8-4d40-89c0-a5eacc379e65",
      "fullName": "John Smith",
      "email": "john.smith@example.com",
      "phone": "9876543210",
      "aadhaarNumber": "XXXX-XXXX-9012",
      "panNumber": "ABCDE1234F",
      "dob": "1985-10-20T00:00:00.000Z",
      "address": "456 Elm St, City, Country",
      "status": "PENDING",
      "createdById": "e94ba67b-1dcc-4509-9064-fe42bcd4e87e",
      "createdAt": "2026-05-21T09:10:23.273Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

#### `GET /api/candidates/:id`
Retrieves a specific candidate profile with full verification logs and report relationships.
* **Response (200 OK)**:
```json
{
  "id": "00976c2d-48b8-4d40-89c0-a5eacc379e65",
  "fullName": "John Smith",
  "email": "john.smith@example.com",
  "phone": "9876543210",
  "aadhaarNumber": "XXXX-XXXX-9012",
  "panNumber": "ABCDE1234F",
  "dob": "1985-10-20T00:00:00.000Z",
  "address": "456 Elm St, City, Country",
  "status": "VERIFIED",
  "createdById": "e94ba67b-1dcc-4509-9064-fe42bcd4e87e",
  "createdAt": "2026-05-21T09:10:23.273Z",
  "verificationLogs": [
    {
      "id": "a671cf0e-3fa1-4475-b82b-8a0ad101db87",
      "candidateId": "00976c2d-48b8-4d40-89c0-a5eacc379e65",
      "verificationType": "AADHAAR",
      "verificationStatus": "VERIFIED",
      "verifiedAt": "2026-05-21T09:12:10.120Z",
      "requestPayload": {},
      "responsePayload": {
        "status": "verified",
        "nameMatch": true,
        "dobMatch": true,
        "message": "Aadhaar verified successfully"
      }
    }
  ],
  "report": {
    "id": "f5195cb1-fb52-4a0b-9d41-c7c40d12e84c",
    "candidateId": "00976c2d-48b8-4d40-89c0-a5eacc379e65",
    "pdfUrl": "https://res.cloudinary.com/dankm7683/image/upload/v1779356188/reports/d458750e-3d3b-43b6-a0b5-9b28d594c799.pdf",
    "generatedAt": "2026-05-21T09:15:30.400Z"
  }
}
```

---

#### `PUT /api/candidates/:id`
Updates elements of a candidate's profile.
* **Request Body**: Partial candidate object (e.g. `{ "email": "new.email@example.com" }`).
* **Response (200 OK)**: Updated candidate object.
* **Error Responses**:
  * `404 Not Found`: Candidate not found or does not belong to the user.

---

#### `DELETE /api/candidates/:id`
Deletes a candidate profile.
* **Response (204 No Content)**: Deletion successful (no response body).

---

### 🔍 3. Verifications
Executes background verification processes using configured third-party services.

#### `POST /api/verifications/:id/start`
Starts a sequential verification run (Aadhaar validation first, followed by PAN validation) for the specified candidate.
* **Rate Limit**: 10 requests / 1 hour per IP.
* **Response (200 OK)**:
```json
{
  "message": "Verification completed",
  "status": "VERIFIED",
  "logs": [
    {
      "type": "AADHAAR",
      "status": "VERIFIED",
      "details": {
        "nameMatch": true,
        "dobMatch": true
      }
    },
    {
      "type": "PAN",
      "status": "VERIFIED",
      "details": {
        "panStatus": "active"
      }
    }
  ]
}
```
* **Overall Status Transition Matrix**:
  * Both checks verify successfully → `VERIFIED`
  * One check succeeds, one fails → `PARTIAL`
  * Both checks fail → `FAILED`

---

### 📄 4. Reports
Handles candidate report generation and distribution.

#### `GET /api/reports`
Lists all generated reports that belong to candidates created by the user.
* **Response (200 OK)**:
```json
[
  {
    "id": "f5195cb1-fb52-4a0b-9d41-c7c40d12e84c",
    "candidateId": "00976c2d-48b8-4d40-89c0-a5eacc379e65",
    "pdfUrl": "https://res.cloudinary.com/dankm7683/image/upload/v1779356188/reports/d458750e-3d3b-43b6-a0b5-9b28d594c799.pdf",
    "generatedAt": "2026-05-21T09:15:30.400Z",
    "candidate": {
      "id": "00976c2d-48b8-4d40-89c0-a5eacc379e65",
      "fullName": "John Smith",
      "email": "john.smith@example.com",
      "aadhaarNumber": "XXXX-XXXX-9012",
      "status": "VERIFIED"
    }
  }
]
```

---

#### `POST /api/reports/:candidateId/generate`
Launches Puppeteer locally or using serverless Chrome `@sparticuz/chromium` on cloud runtime, compiles the report template into a professional, styled PDF layout, uploads the buffer to Cloudinary, and registers/updates the report record in the database.
* **Response (200 OK)**:
```json
{
  "message": "Report generated successfully",
  "reportId": "f5195cb1-fb52-4a0b-9d41-c7c40d12e84c",
  "generatedAt": "2026-05-21T09:15:30.400Z"
}
```

---

#### `GET /api/reports/:candidateId`
Redirects the requester to the secure Cloudinary PDF URL for immediate browser-level file streaming or local downloading.
* **Response (302 Found)**: Redirect to Cloudinary URL (`https://res.cloudinary.com/dankm7683/image/upload/...`).

---

### 📊 5. Dashboard Statistics

#### `GET /api/stats`
Returns aggregated verification state metrics matching candidates created by the user.
* **Response (200 OK)**:
```json
{
  "total": 24,
  "verified": 15,
  "pending": 5,
  "failed": 2,
  "partial": 2
}
```

---

### 🧪 6. Mock Verification Endpoints
Mock verification providers configured to test full validation flows (used in testing environments and fallbacks).

#### `POST /mock-api/aadhaar/verify`
Mock endpoint validating a 12-digit Aadhaar card number.
* **Request Body**: `{ "aadhaarNumber": "123456789012" }`
* **Test Rule**: If the number starts with `000000`, the check fails.
* **Response (200 OK - Match)**:
```json
{
  "status": "verified",
  "nameMatch": true,
  "dobMatch": true,
  "message": "Aadhaar verified successfully"
}
```
* **Response (200 OK - Fails)**:
```json
{
  "status": "failed",
  "nameMatch": false,
  "dobMatch": false,
  "message": "Aadhaar not found in records"
}
```

---

#### `POST /mock-api/pan/verify`
Mock endpoint validating a standard Indian PAN format card number.
* **Request Body**: `{ "panNumber": "ABCDE1234F" }`
* **Test Rule**: If the PAN starts with `AAAAA`, the check fails.
* **Response (200 OK - Match)**:
```json
{
  "status": "verified",
  "panStatus": "active",
  "message": "PAN verified successfully"
}
```
* **Response (200 OK - Fails)**:
```json
{
  "status": "failed",
  "panStatus": "inactive",
  "message": "PAN not found or inactive"
}
```

---

### 🏥 7. Health Check

#### `GET /health`
Returns the status of the Express server process.
* **Response (200 OK)**:
```json
{
  "status": "ok",
  "uptime": 2356.12
}
```
