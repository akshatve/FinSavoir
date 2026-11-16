# Use official Python lightweight image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies needed for psycopg2 and compiling packages
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Expose the port FastAPI will run on
EXPOSE 8000

# Command to run the app using Uvicorn (Production mode, no reload)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]