# Seshat Project

This project consists of a Next.js frontend and a Flask backend with PostgreSQL database.

## Prerequisites

- Docker and Docker Compose
- Git

## Project Structure

```
seshat/
├── seshat-back/    # Flask backend
└── seshat-front/   # Next.js frontend
```

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd seshat
```

2. Start the application using Docker Compose:
```bash
docker-compose up --build
```

This will start:
- PostgreSQL database on port 5432
- Flask backend on port 8000
- Next.js frontend on port 3000

## Accessing the Applications

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Database: localhost:5432

## Development

### Backend (seshat-back)
The Flask backend will automatically reload when you make changes to the code.

### Frontend (seshat-front)
The Next.js frontend supports hot reloading, so changes will be reflected immediately.

## Stopping the Application

To stop the application:
```bash
docker-compose down
```

To stop and remove all data (including database):
```bash
docker-compose down -v
```

## Troubleshooting

If you encounter any issues:

1. Check container logs:
```bash
docker-compose logs python  # For backend logs
docker-compose logs next   # For frontend logs
docker-compose logs db     # For database logs
```

2. Rebuild containers:
```bash
docker-compose up --