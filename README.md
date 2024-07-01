# Project Installation and Running Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- [Git](https://git-scm.com/downloads)
- [Docker](https://www.docker.com/get-started) (for containerization)
- [Node.js](https://nodejs.org/en/download/) (for running the project without Docker)

## Installation

Clone the project repository:

```bash
git clone https://github.com/mualnaqeeb/reading-recommendation.git
cd reading-recommendation
```

## Running the Project

### Without Docker

1. **Install dependencies:**
   
   ```bash
   npm install
   ```

2. **Set up environment variables:**

   Ensure you have a `.env` file in the root of the project with the required configurations.

3. **Seed Admin Account:**

   Make sure to seed the admin account by running the seed script (if applicable).

4. **Start the project:**

   ```bash
   npm run start
   ```

### With Docker

1. **Set up secrets:**

   Ensure you have a `secrets` directory in your project root containing the secret files (`db_user`, `db_password`, `db_name`) with your sensitive data.

2. **Set up environment variables:**

   Ensure you have a `.env` file in the root of the project with the required configurations.

3. **Build the Docker image:**

   ```bash
   docker-compose build
   ```

4. **Run the Docker container:**

   ```bash
   docker-compose up
   ```

Replace `8080:8080` with the appropriate port mapping if your application uses a different port.

## Accessing the Application

Once the application is running, you can access it by navigating to [http://localhost:8080](http://localhost:8080) in your web browser (or the appropriate port if you've changed it).

## Additional Information

- **Seeding Admin Account:**

  Ensure you seed the admin account by running the appropriate seed script if required. This is crucial for accessing admin functionalities.

- **Secrets Folder:**

  Ensure you have a `secrets` folder with the necessary secret files for database credentials.

- **Environment Variables:**

  Ensure you have a `.env` file with all the required environment variables. This file should not be committed to version control for security reasons.

- **API Version:**

  When making API requests, include the API version in the headers to ensure compatibility. Example:

  ```http
  GET /endpoint HTTP/1.1
  Host: localhost:8080
  x-api-version: v1
  ```

---
