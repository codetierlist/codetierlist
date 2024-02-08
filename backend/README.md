# Codetierlist Backend
The backend for Codetierlist is a RESTful API built with Express, Prisma, and PostgreSQL.

It handles user authentication, CRUD operations for the frontend, and managing the redis queue
for the runner jobs.

## Authentication
Codetierlist expects Shibboleth authentication headers to be present in the request. If the
headers are not present, the request will be rejected with a 401 Unauthorized status code.

The headers that are expected are:
- `utorid`: The user's utorid
- `sn`: The user's last name
- `givenName`: The user's first name
- `http_mail`: The user's email address

## Environment Variables
Please see `.env.example` for the environment variables that are expected to be present.

## API Endpoints
Please see the `/api` directory for the API documentation. Each route is annotated with
JSDoc comments.

## Development
To start the backend, use the Docker Dev environment. This will start the everything
needed for the Codetierlist project to run.
