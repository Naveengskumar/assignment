
# Three Assignments — Full Stack (Single README)

This single file documents both **backend (Node.js/Express + Socket.IO)** and **frontend (Angular)** for the three assignments:

1. **Users CRUD + Pagination** (Admin)
2. **CSV Upload with Data Preview**
3. **Real-time Notifications** (Socket.IO)

---

## Monorepo Structure

```
.
├─ README.md                                # (this file)
├─ user_data.csv                          # Example CSV for upload
├─ backend/                                  # Express API + Socket.IO
│  ├─ README.md
│  ├─ src/...
│  └─ package.json
└─ frontend/                                 # Angular app
   ├─ README.md
   ├─ src/...
   └─ package.json
```


---

## Specific APIs Used in This Project (from earlier chat notes)

- **Users CRUD (Admin)** — `/api/v1/users`
  - `GET /api/v1/users?page=1&limit=10&search=` — **paginated** list with optional `search` (name/email)
  - `POST /api/v1/users` — create
  - `GET /api/v1/users/:id` — read
  - `PUT /api/v1/users/:id` — update
  - `DELETE /api/v1/users/:id` — delete
- **CSV Upload Preview** — `/api/v1/upload/csv`
  - `POST /api/v1/upload/csv` — multipart/form-data (`file` field); backend returns preview (first 10 rows) + stats
- **Notifications**
  - **Socket connect:** Clients connect at server origin via Socket.IO and receive an initial alert (`connected`) and **periodic emits** (e.g., `ticker` every 15s).
- **Health check** — `GET /api/v1/health`


---

## Backend (Express + Socket.IO)

### 1) Setup & Run

```bash
cd backend
cp .env.example .env
npm install
npm run dev
# or build+run:
# npm run build && npm start
```

`.env` example:
```ini
PORT=3000
NODE_ENV=development

# DB

Mongo:
DB_CLIENT=mongo
MONGO_URI=mongodb://localhost:27017/assignments
```

### 2) Endpoints

- **Health:** `GET /api/v1/health`
- **Users CRUD:**
  - `GET /api/v1/users?page=1&limit=10&search=`
  - `POST /api/v1/users`
  - `GET /api/v1/users/:id`
  - `PUT /api/v1/users/:id`
  - `DELETE /api/v1/users/:id`
- **CSV Upload (Preview):** `POST /api/v1/upload/csv` (multipart: `file`)
- **Notifications (Broadcast):** `POST /api/v1/notifications/broadcast`

**CSV route wiring tip:**
```ts
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });
router.post('/upload/csv', upload.single('file'), uploadController.handleCsv);
```

### 3) Socket.IO

- **Connection:** client connects to `http://localhost:3000` (same origin)
- **Server emits:**
  - `connected` (on join)
  - `ticker` (periodic emit; e.g., every 15s to prove real-time)
  - `admin-broadcast` (on POST `/api/v1/notifications/broadcast`)
- **Client (Angular) tips:**
  - Call `socket.connect()` **before** routing to the notifications page
  - Subscribe to events in `ngOnInit`; unsubscribe in `ngOnDestroy`

### 4) Backend Scripts

- `npm run dev` — run in watch mode (ts-node-dev / nodemon)
- `npm run build` — compile TypeScript
- `npm start` — run compiled code
- `npm test` — Jest tests (recommend Supertest for HTTP routes)

---

## Frontend (Angular)

### 1) Setup & Run

```bash
cd frontend
npm install
npm start   # or `ng serve`
```

### 2) Configure Environments

`src/environments/environment.ts`:
```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000',
  socketUrl: 'http://localhost:3000'
};
```

### 3) Features

- **Admin → Users**
  - Paginated list (`page`, `limit`), 
  - Add user single/by uploading csv
  - Test Socket connection and live notification
- **Admin → CSV Upload**
  - Pick a CSV → preview first 10 rows → submit
- **Admin → Notifications**
  - Button to `connect()` socket and navigate to `/admin/notifications`
  - Panel shows `connected`, periodic `ticker`, and `admin-broadcast` messages


### 4) Frontend Scripts

- `ngx serve`



- This **single `README.md`** (covers both apps)
- Optional: Postman collection + OpenAPI spec at root
