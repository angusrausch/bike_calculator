FROM rust:1.96-alpine AS builder

WORKDIR /app
COPY src /app/src
COPY Cargo.toml Cargo.lock /app/

RUN cargo build --release

FROM alpine AS runner

WORKDIR /app

COPY --from=builder app/target/release/bike_calculator_backend /app/bike_calculator_backend
RUN chmod +x /app/bike_calculator_backend

# tini required as Rust does not handle exit properly
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

CMD [ "/app/bike_calculator_backend", "--port", "5000" ]