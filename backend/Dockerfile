# syntax=docker/dockerfile:1

FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace

COPY pom.xml .
RUN mvn -B -DskipTests dependency:go-offline

COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /workspace/target/*.jar app.jar

ENV JAVA_OPTS=""
EXPOSE 10000

CMD ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-10000} -jar app.jar"]
