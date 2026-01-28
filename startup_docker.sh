#!/bin/bash

set -e

# Define colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

BUILD=false
START=false
STOP=false
NETWORK=""

BACKEND=false
FRONTEND=false

show_usage() {
  echo "Usage: $0 [OPTIONS]"
  echo ""
  echo "Options:"
  echo "  --build        Build the project"
  echo "  --stop         Stop the running services"
  echo "  --start        Start the frontend and backend services"
  echo "  --net          Adds a additional network to containers"
  echo "  -h, --help     Show this help message"
}

# Exit early with usage if no arguments are passed
if [[ $# -eq 0 ]]; then
  show_usage
  exit 1
fi

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --build)
      BUILD=true
      shift
      ;;
    --stop)
      STOP=true
      shift
      ;;
    --start)
      START=true
      shift
      ;;
    --backend)
      BACKEND=true
      shift
      ;;
    --frontend)
      FRONTEND=true
      shift
      ;;
    --net)
      NETWORK=$2
      shift 2
      ;;
    -h|--help)
      show_usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      show_usage
      exit 1
      ;;
  esac
done

echo -e "${YELLOW}Loading environment variables...${NC}"

# Add additional network
if [ ! -z "$NETWORK" ]; then
  NETWORK="--net ${NETWORK}"
fi

if $STOP; then
  echo -e "\n${YELLOW}Stopping and removing containers${NC}"
  docker rm -f bike_calculator_frontend bike_calculator_backend >/dev/null 2>&1
  if [[ $? -ne 0 ]]; then
    echo "${RED}Failed to stop containers $STATUS${NC}"
    exit 1
  fi
  echo -e "${BLUE}All containers stopped${NC}"
  exit 0
fi

if ! $BACKEND && ! $FRONTEND; then 
  echo -e "\n${RED}No container selected to build or start${NC}"
  exit 1
fi

if $BUILD; then
  echo -e "\n${GREEN}Building Images${NC}\n"
  if $BACKEND; then
    echo -e "\n${YELLOW}Building Backend Image...${NC}"
    docker build -t bike_calculator_backend ./back_end/
    if [[ $? -ne 0 ]]; then
      echo "${RED}Building backend docker image failed $STATUS${NC}"
      exit 1
    fi
  fi

  if $FRONTEND; then
    echo -e "\n${YELLOW}Building Frontend Image...${NC}"
    docker build -t bike_calculator_frontend ./front_end/
    if [[ $? -ne 0 ]]; then
      echo "${RED}Building frontend docker image failed $STATUS${NC}"
      exit 1
    fi
  fi
fi

if $START; then
  if $BACKEND; then
    echo -e "\n${YELLOW}Starting Backend Container...${CYAN}"

    if docker ps | egrep "bike_calculator_backend" > /dev/null 2>&1; then
      echo -e "${YELLOW}Old backend containers found. Shutting it down...${NC}"
      docker rm -f bike_calculator_backend >/dev/null 2>&1
      if [[ $? -ne 0 ]]; then
        echo "${RED}Removing backend docker container failed $STATUS${NC}"
        exit 1
      fi
      echo -e "${GREEN}Backend docker container shut down.${NC}"
    fi

    docker run ${NETWORK} --name bike_calculator_backend \
          -p 8080:8080 \
          --restart unless-stopped \
          -d bike_calculator_backend
    if [[ $? -ne 0 ]]; then
      echo "${RED}Starting Backend docker container failed $STATUS${NC}"
      exit 1
    fi
    echo -e "${BLUE}Started Backend container${NC}"
  fi

  if $FRONTEND; then
    echo -e "\n${YELLOW}Starting Frontend docker container...${CYAN}"
    
    if docker ps | egrep "bike_calculator_frontend" > /dev/null 2>&1; then
      echo -e "${YELLOW}Old frontend containers found. Shutting it down...${NC}"
      docker rm -f bike_calculator_frontend >/dev/null 2>&1
      if [[ $? -ne 0 ]]; then
        echo "${RED}Removing frontend docker container failed $STATUS${NC}"
        exit 1
      fi
      echo -e "${GREEN}Frontend docker container shut down.${NC}"
    fi

    docker run --name bike_calculator_frontend \
          -p 3000:80 \
          --restart unless-stopped \
          -d bike_calculator_frontend
    if [[ $? -ne 0 ]]; then
      echo "${RED}Starting Frontend docker container failed $STATUS${NC}"
      exit 1
    fi
    echo -e "${BLUE}Started Frontend container${NC}"
  fi
fi

exit 0
