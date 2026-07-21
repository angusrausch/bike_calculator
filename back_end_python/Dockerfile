FROM python:3.14.6 as builder

WORKDIR /app

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN pip install --upgrade pip
RUN pip install --upgrade setuptools wheel

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY . .
RUN pip install --no-cache-dir .

FROM python:3.14.6 AS runner

WORKDIR /app

COPY --from=builder /opt/venv /opt/venv
COPY __init__.py app.py .

ENV PATH="/opt/venv/bin:$PATH"

CMD [ "gunicorn", "--bind", "0.0.0.0:5000", "app:app" ]