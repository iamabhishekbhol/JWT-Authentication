# JWT-Authentication

# JWT Authentication API

A Node.js and Express-based authentication API that implements secure user registration, login with JSON Web Tokens (JWT), refresh-token rotation and revocation, and protected routes. Uses MongoDB (via Mongoose) for user persistence.

---

## Features

* **User Registration**: Create new users with hashed passwords (bcrypt).
* **Login**: Authenticate credentials, issue short-lived access tokens (1h) and long-lived refresh tokens (7d).
* **Protected Routes**: Secure endpoints using JWT access tokens.
* **Refresh Token Rotation**: Exchange a valid refresh token for a new access token and refresh token.
* **Refresh Token Revocation (Logout)**: Invalidate refresh tokens on logout.
* **Schema-Level Persisted Refresh Tokens**: Store active refresh tokens per-user in MongoDB for revocation and rotation.

---

## Prerequisites

* Node.js v14+
* npm or yarn
* MongoDB instance (local or cloud)
* Environment variables (see below)

---

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/jwt-authentication.git
   cd jwt-authentication
   ```
2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

---

## Environment Variables

Create a `.env` file in the project root with:

```dotenv
PORT=3000
MONGO_URI=mongodb://localhost:27017/yourdbname
JWT_SECRET=yourAccessTokenSecret
JWT_REFRESH_TOKEN=yourRefreshTokenSecret
```

* `PORT`: Port to run the Express server.
* `MONGO_URI`: Connection string to your MongoDB database.
* `JWT_SECRET`: Secret key for signing access tokens (expires in 1h).
* `JWT_REFRESH_TOKEN`: Secret key for signing refresh tokens (expires in 7d).

---

## Folder Structure

```
JWT-Authentication/
├── config/
│   └── user.js          # Dummy user example for testing
├── db/
│   └── connect.js       # MongoDB connection logic
├── middleware/
│   ├── authMiddleware.js     # Verifies JWT access tokens
│   └── validators/
│       ├── authValidator.js  # express-validator rules
│       └── validateResult.js # Validation error handler
├── models/
│   └── UserModel.js     # Mongoose schema with refreshTokens array
├── routes/
│   └── auth.js          # Registration, login, token, logout, protected routes
├── utils/
│   └── jwt.js           # Token generation and verification functions
├── .env                 # Environment variables (not checked in)
├── .gitignore
├── package.json
├── README.md            # <-- You are here
└── server.js            # Entry point
```

---

## API Endpoints

### 1. Register a New User

* **URL:** `POST /api/register`
* **Body:**

  ```json
  {
    "username": "alice",
    "password": "Password1!"
  }
  ```
* **Response:**

  * `201 Created` on success
  * JSON with `message` and `userId`

### 2. Login & Receive Tokens

* **URL:** `POST /api/login`
* **Body:**

  ```json
  {
    "username": "alice",
    "password": "Password1!"
  }
  ```
* **Response:**

  ```json
  {
    "message": "Login successful",
    "accessToken": "<JWT_ACCESS_TOKEN>",
    "refreshToken": "<JWT_REFRESH_TOKEN>"
  }
  ```

### 3. Access Protected Route

* **URL:** `GET /api/protected`
* **Headers:**

  ```
  Authorization: Bearer <JWT_ACCESS_TOKEN>
  ```
* **Response:**

  * `200 OK` with `{ message, user }`
  * `401` or `403` on missing/invalid token

### 4. Rotate Refresh Token

* **URL:** `POST /api/token`
* **Body:**

  ```json
  {
    "token": "<JWT_REFRESH_TOKEN>"
  }
  ```
* **Response:**

  ```json
  {
    "accessToken": "<newAccessToken>",
    "refreshToken": "<newRefreshToken>"
  }
  ```

### 5. Logout (Revoke Refresh Token)

* **URL:** `POST /api/logout`
* **Body:**

  ```json
  {
    "token": "<JWT_REFRESH_TOKEN_TO_REVOKE>"
  }
  ```
* **Response:**

  * `204 No Content`

---

## Token Flow Explained

1. **Login**: Client submits credentials → receives **access token** (1h) + **refresh token** (7d).
2. **Protected requests**: Include `Authorization: Bearer <accessToken>` in headers.
3. **Access token expiry**: When you get `401 Unauthorized`, call `/api/token` with the current refresh token.
4. **Token rotation**: Server verifies the refresh token, removes it from the user’s `refreshTokens` array, issues a new pair, and persists the new refresh token.
5. **Logout**: Client calls `/api/logout` with its refresh token → server revokes it, client should discard both tokens.

**Analogy**: Access token is your short-lived day-pass; refresh token is a long-term master key stored securely and rotated each time you use it.

---

## Testing

Use Postman or curl to exercise each endpoint in order:

```bash
# 1. Register
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{ "username": "alice", "password": "Password1!" }'

# 2. Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{ "username": "alice", "password": "Password1!" }'

# 3. Protected (use accessToken)
curl http://localhost:3000/api/protected \
  -H "Authorization: Bearer <accessToken>"

# 4. Token rotation
curl -X POST http://localhost:3000/api/token \
  -H "Content-Type: application/json" \
  -d '{ "token": "<refreshToken>" }'

# 5. Logout
curl -X POST http://localhost:3000/api/logout \
  -H "Content-Type: application/json" \
  -d '{ "token": "<refreshToken>" }'
```

---
