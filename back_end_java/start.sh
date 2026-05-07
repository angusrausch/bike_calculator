#!/bin/sh

set -a

DIR="$(dirname "$(realpath "$0")")"

if [ -f "$DIR/.env" ]; then
  . "$DIR/.env"
fi

set +a

./mvnw spring-boot:run