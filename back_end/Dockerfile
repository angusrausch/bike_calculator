FROM openjdk:25-rc-jdk
 
WORKDIR /app
 
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline
 
COPY src ./src

COPY start.sh /app/
RUN chmod +x start.sh

ENTRYPOINT [ "/app/start.sh" ]
