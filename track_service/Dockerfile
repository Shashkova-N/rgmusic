FROM python:3.9

WORKDIR /app

COPY requirements.txt .
RUN apt-get update && apt-get install -y netcat-traditional
RUN pip install -r requirements.txt

# COPY . .

CMD ["python", "app.py"]