FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV MALLOC_ARENA_MAX=2

EXPOSE 8002

CMD sh -c "uvicorn app:app --host 0.0.0.0 --port ${PORT:-8002}"
