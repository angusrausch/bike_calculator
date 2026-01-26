# Bike Calculator
**An everything bike website**
Want to calculate gear ratios, how about speed at a cadence, and rollout? Find it all here. Setup when other sites that did this got noticably worse, this site lets you calculate all of them and fine tune your bike. 
Other inovations have occured as well. Need to find your closest tap to refill your water bottle, or a bike rack. We can do that too, just use the maps feature <small>(only available in Brisbane and Gold Coast)</small>. 

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [First time setup](#first-time-setup)
- [Development](#development)
- [Docker Deployment](#docker-deployment)

---
## Features
- Calculators for:
   - Speed at gear and cadence
   - Ratio at gear
   - Rollout
- Maps for:
   - Taps (Brisbane, Gold Coast, Sunshine Coast, Moreton Bay)
   - Bike Racks (Brisbane CBD only)

---
## Prerequisites
**For  Development:**
- Node V22
- Java (OpenJDK) 25
- PostgreSQL
**For Production:**
- Docker

---

## First Time Setup

- Setup Database
   - Create PSQL database
      - No instructions here as it differs depending on how you want to deploy
   - Copy default psql database
      ```bash
      psql -U <username> -d <database_name> < default_tables.pgsql
      ```

- Setup Server Properties
   - Copy properties example files
      ```bash
      cp back_end/src/main/resources/application.properties.example back_end/src/main/resources/application.properties
      cp front_end/.env.example front_end/.env
      ```
   - Modify backend `application.properties`
      - Update following values:
         - spring.datasource.url 
            - This has to equal `jdbc:postgresql://*`
         - spring.datasource.username
         - spring.datasource.password
         - server.port
         - google.maps.key
   - Modify frontend `.env`
      - Update `REACT_APP_API_BASE_URL` to match address for `application.properties/server.port`
         - Likely `localhost:8080` for development (default)

--- 

## Development
- Start backend server
   - Run command:
      ```bash
      ./mvnw spring-boot:run 
      ```
   - This has to be closed and rerun after changes to code
- Start frontend server
   - Run command:
      ```bash
      npm start
      ```
   - This will auto update with code changes
   - Changes to `.env` require restart

---
## Docker Deployment

Use built in script `startup_docker.sh` to start app
This this assumes you have already done the above setup 

| Flag | Description       |
|------|-------------------|
| `--build` | Build containers|
| `--start` | Start containers|
| `--stop` | Stop containers|
| `--net` | Add docker network to backend container (for database)|

**You can use multiple arguments together**
```bash
./startup_docker --build --start --net web
```
