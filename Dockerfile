FROM python:3.12-slim

WORKDIR /app

RUN pip install --no-cache-dir websockets

COPY server.py .
COPY 07_HARRIS_WILDLANDS/ 07_HARRIS_WILDLANDS/

ENV HOST=0.0.0.0
ENV PORT=5000

EXPOSE 5000

CMD ["python", "server.py"]
