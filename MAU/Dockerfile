# syntax=docker/dockerfile:1

FROM python:3.12-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1
WORKDIR /app

# System deps for building psycopg2 and other packages
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install -r requirements.txt \
    && pip install gunicorn psycopg2-binary

# Copy Django project (backend)
COPY backend/ /app/

ENV DJANGO_SETTINGS_MODULE=mau_hospital.settings
EXPOSE 3000

# Run migrations then start gunicorn
CMD sh -c "python manage.py migrate && gunicorn mau_hospital.wsgi:application --bind 0.0.0.0:3000 --workers 3"


