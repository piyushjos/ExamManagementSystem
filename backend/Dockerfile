# Build stage: Use OpenJDK 21 and install Maven manually
FROM eclipse-temurin:21 AS build

# Install Maven
RUN apt-get update && apt-get install -y maven

WORKDIR /app
# Copy pom.xml and source code
COPY pom.xml .
RUN mvn -q -e -DskipTests package || true
COPY src ./src
RUN mvn -q -DskipTests package
# Build the application (skip tests for faster build)
#RUN mvn clean package -DskipTests

# Run stage: Use OpenJDK 21 for runtime
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar ./exam-platform.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/exam-platform.jar"]
