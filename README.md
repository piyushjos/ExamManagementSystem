# Exam Platform

## **1. Clone the Repository**

Open a terminal and run:

```sh
git clone <repository-url>
cd exam-platform
```

## **2. Open the Project in IntelliJ**

1. Open IntelliJ IDEA.
2. Click **File > Open** and select the `exam-platform` folder.
3. Wait for dependencies to load.

## **3. Install Dependencies**

Ensure you have Maven installed. If not, install it using:

```sh
brew install maven
```

Then, in IntelliJ, open the Terminal and run:

```sh
mvn clean install
```

## **4. Configure IntelliJ Settings**

1. Go to **File > Project Structure > Project** and set:
    - **SDK**: Select Java 17 or higher.
    - **Language Level**: 17 (or the project's requirement).
2. Under **Modules > Dependencies**, ensure **Maven** is selected as the build tool.

## **5. Set Up the H2 Database**

The project is configured to use an H2 embedded database.

Ensure the following properties are set in `application.properties`:

```properties
spring.datasource.url=jdbc:h2:file:./data/exam_platform
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

Run the application.

### **Access the H2 Console:**

- Open: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
- **JDBC URL**: `jdbc:h2:file:./data/exam_platform`
- **Username**: `sa`
- **Password**: *(leave empty)*

## **6. Run the Project**

Start the application with:

```sh
mvn spring-boot:run
```

or in IntelliJ:

1. Open the `ExamPlatformApplication.java` file.
2. Click the **Run** button.

## **7. Verify API Endpoints**

Use Postman or `curl` to test authentication:

```sh
curl -X POST http://localhost:8080/api/auth/login \  
     -H "Content-Type: application/json" \  
     -d '{"username":"admin", "password":"admin"}'
```

## **8. Common Issues and Fixes**

### **1. H2 Database Not Found**

If the H2 console shows a missing database error:

- Ensure the `./data/exam_platform.mv.db` file exists.
- If missing, restart the app to regenerate it.

### **2. Port 8080 Already in Use**

If port **8080** is in use, change it in `application.properties`:

```properties
server.port=8081
```

Then restart the application.

## **9. Additional Notes**

- The **admin user** is predefined in `application.properties`:

```properties
spring.security.user.name=admin
spring.security.user.password=admin
```

- If modifying security settings, ensure **JWT configurations** remain intact.

This setup ensures the project runs consistently on every team member’s system.


## **Front End SetUp**


# Exam Portal Frontend

## Project Setup

### Initialize Vite Project
```sh
npm create vite@latest exam-portal-frontend --template react
cd exam-portal-frontend
npm install
```

### Install Material-UI
```sh
npm install @mui/material @emotion/react @emotion/styled
```

### Install HTTP Client (Axios)
```sh
npm install axios
```

## Project Structure
Consider organizing your project into the following folders:

```
exam-portal-frontend/
├── src/
│   ├── components/   # Reusable UI components
│   ├── pages/        # Different views (login, dashboard, exam page, etc.)
│   ├── services/     # API service wrappers to interact with the backend
│   ├── utils/        # Helpers (e.g., authentication, token storage)
│   ├── App.js        # Main application component
│   ├── index.js      # Entry point
│   ├── ...
├── package.json      # Project dependencies & scripts
├── README.md         # Project documentation
```

This structure ensures better maintainability and modularity.

---

Happy coding! 🚀


