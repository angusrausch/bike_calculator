FROM openjdk:25-rc-jdk
 
WORKDIR /app
 
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline
 
COPY src ./src

ENTRYPOINT [ "./mvnw", "spring-boot:run", "-Dspring-boot.run.arguments=--server.port=5000"]