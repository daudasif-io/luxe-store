# v3
FROM python:3.11-slim

WORKDIR /app

COPY E-commerce/backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY E-commerce/backend/ .

EXPOSE 5000

CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000"]