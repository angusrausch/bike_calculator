#!/bin/sh

set -a

DIR="$(dirname "$(realpath "$0")")"

. "$DIR/.env"

set +a

./mvnw spring-boot:run