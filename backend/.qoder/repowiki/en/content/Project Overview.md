# Project Overview

<cite>
**Referenced Files in This Document**
- [package.json](file://package.json)
- [server.js](file://server.js)
- [models/User.js](file://models/User.js)
- [models/Submission.js](file://models/Submission.js)
- [models/Review.js](file://models/Review.js)
- [routes/authRoutes.js](file://routes/authRoutes.js)
- [routes/submissionRoutes.js](file://routes/submissionRoutes.js)
- [routes/adminRoutes.js](file://routes/adminRoutes.js)
- [routes/facultyRoutes.js](file://routes/facultyRoutes.js)
- [middleware/auth.js](file://middleware/auth.js)
- [middleware/validate.js](file://middleware/validate.js)
- [middleware/errorHandler.js](file://middleware/errorHandler.js)
- [utils/ApiError.js](file://utils/ApiError.js)
- [utils/catchAsync.js](file://utils/catchAsync.js)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This academic submission portal backend is a Node.js/Express-based system designed to manage student academic submissions including internships, projects, and research papers. The platform implements role-based access control (RBAC) with three distinct roles: student, faculty, and admin. Students can submit PDF reports, faculty members can review and evaluate submissions, and administrators can manage users, assignments, and system statistics.

The system emphasizes security through JWT authentication, comprehensive input validation, rate limiting, and data sanitization. It provides a RESTful API with clear separation of concerns across middleware, models, routes, and utilities, making it maintainable and extensible for academic institution needs.

## Project Structure
The backend follows a modular architecture organized by functional domains:

```mermaid
graph TB
subgraph "Application Root"
Server["server.js<br/>Main Application Entry"]
Config[".env<br/>Environment Configuration"]
end
subgraph "Core Modules"
Routes["routes/<br/>API Route Handlers"]
Middleware["middleware/<br/>Middleware Functions"]
Models["models/<br/>Mongoose Schemas"]
Utils["utils/<br/>Utility Classes & Helpers"]
end
subgraph "Static Assets"
Public["public/<br/>HTML Pages"]
Uploads["uploads/<br/>PDF Files"]
end
subgraph "Dependencies"
Express["express<br/>Web Framework"]
Mongoose["mongoose<br/>ODM"]
JWT["jsonwebtoken<br/>Authentication"]
Multer["multer<br/>File Upload"]
Validator["express-validator<br/>Input Validation"]
end
Server --> Routes
Server --> Middleware
Server --> Models
Server --> Utils
Routes --> Models
Middleware --> Utils
Models --> Mongoose
Routes --> Express
Middleware --> Express
Utils --> Express
Routes --> JWT
Routes --> Multer
Routes --> Validator
```

**Diagram sources**
- [server.js](file://server.js#L1-L92)
- [package.json](file://package.json#L10-L26)

The project is structured with clear separation of concerns:
- **server.js**: Central application configuration and middleware setup
- **routes/**: Role-specific API endpoints organized by functionality
- **models/**: Mongoose schemas defining the data structure
- **middleware/**: Cross-cutting concerns like authentication and validation
- **utils/**: Reusable utility classes and error handling

**Section sources**
- [server.js](file://server.js#L1-L92)
- [package.json](file://package.json#L1-L28)

## Core Components
The system consists of three primary data models that form the foundation of the academic submission workflow:

### User Model
The User model defines the authentication and authorization structure with three distinct roles:

```mermaid
classDiagram
class User {
+string name
+string email
+string passwordHash
+string role
+string dept
+string year
+timestamps
}
class UserRole {
<<enumeration>>
STUDENT
FACULTY
ADMIN
}
User --> UserRole : "has role"
```

**Diagram sources**
- [models/User.js](file://models/User.js#L3-L18)

### Submission Model
The Submission model captures academic work with comprehensive metadata and workflow tracking:

```mermaid
classDiagram
class Submission {
+ObjectId studentId
+string title
+string type
+string domain
+string companyOrGuide
+string filePath
+string status
+ObjectId assignedFacultyId
+Number version
+timestamps
}
class SubmissionType {
<<enumeration>>
INTERNSHIP
PROJECT
RESEARCH
}
class SubmissionStatus {
<<enumeration>>
SUBMITTED
ASSIGNED
APPROVED
RESUBMISSION_REQUIRED
}
Submission --> SubmissionType : "has type"
Submission --> SubmissionStatus : "has status"
Submission --> User : "created by"
Submission --> User : "assigned to"
```

**Diagram sources**
- [models/Submission.js](file://models/Submission.js#L3-L28)

### Review Model
The Review model handles faculty evaluations with grading and feedback mechanisms:

```mermaid
classDiagram
class Review {
+ObjectId submissionId
+ObjectId facultyId
+string remarks
+Number marks
+string decision
+timestamps
}
class ReviewDecision {
<<enumeration>>
APPROVED
RESUBMISSION_REQUIRED
}
Review --> ReviewDecision : "has decision"
Review --> Submission : "evaluates"
Review --> User : "by faculty"
```

**Diagram sources**
- [models/Review.js](file://models/Review.js#L3-L16)

**Section sources**
- [models/User.js](file://models/User.js#L1-L20)
- [models/Submission.js](file://models/Submission.js#L1-L30)
- [models/Review.js](file://models/Review.js#L1-L18)

## Architecture Overview
The system implements a layered architecture with clear boundaries between presentation, business logic, and data access layers:

```mermaid
graph TB
subgraph "Presentation Layer"
Client["Client Applications"]
Frontend["React Frontend"]
end
subgraph "Application Layer"
AuthRoutes["Auth Routes"]
SubmissionRoutes["Submission Routes"]
AdminRoutes["Admin Routes"]
FacultyRoutes["Faculty Routes"]
end
subgraph "Business Logic Layer"
AuthMiddleware["Authentication Middleware"]
ValidationMiddleware["Validation Middleware"]
ErrorHandling["Error Handler"]
AsyncWrapper["Async Wrapper"]
end
subgraph "Data Access Layer"
UserModel["User Model"]
SubmissionModel["Submission Model"]
ReviewModel["Review Model"]
end
subgraph "External Services"
MongoDB["MongoDB Database"]
JWT["JWT Token Service"]
Multer["File Storage"]
end
Client --> Frontend
Frontend --> AuthRoutes
Frontend --> SubmissionRoutes
Frontend --> AdminRoutes
Frontend --> FacultyRoutes
AuthRoutes --> AuthMiddleware
SubmissionRoutes --> AuthMiddleware
AdminRoutes --> AuthMiddleware
FacultyRoutes --> AuthMiddleware
AuthRoutes --> ValidationMiddleware
SubmissionRoutes --> ValidationMiddleware
AdminRoutes --> ValidationMiddleware
FacultyRoutes --> ValidationMiddleware
AuthRoutes --> UserModel
SubmissionRoutes --> SubmissionModel
AdminRoutes --> UserModel
AdminRoutes --> SubmissionModel
FacultyRoutes --> SubmissionModel
FacultyRoutes --> ReviewModel
AuthMiddleware --> JWT
SubmissionRoutes --> Multer
UserModel --> MongoDB
SubmissionModel --> MongoDB
ReviewModel --> MongoDB
```

**Diagram sources**
- [server.js](file://server.js#L10-L66)
- [middleware/auth.js](file://middleware/auth.js#L3-L23)
- [middleware/validate.js](file://middleware/validate.js#L4-L16)

The architecture enforces several key principles:
- **Separation of Concerns**: Each layer has distinct responsibilities
- **Security First**: Authentication and authorization are enforced at route level
- **Validation Pipeline**: Input validation occurs before business logic
- **Error Management**: Centralized error handling with meaningful responses
- **Extensibility**: Modular design allows easy addition of new features

## Detailed Component Analysis

### Authentication and Authorization System
The authentication system implements JWT-based stateless authentication with role-based access control:

```mermaid
sequenceDiagram
participant Client as "Client"
participant AuthRoute as "Auth Routes"
participant User as "User Model"
participant JWT as "JWT Service"
participant AuthMW as "Auth Middleware"
Client->>AuthRoute : POST /api/auth/register
AuthRoute->>User : Check email uniqueness
User-->>AuthRoute : Unique email
AuthRoute->>AuthRoute : Hash password
AuthRoute->>User : Create user record
User-->>AuthRoute : User created
AuthRoute-->>Client : Registration success
Client->>AuthRoute : POST /api/auth/login
AuthRoute->>User : Find user by email
User-->>AuthRoute : User found
AuthRoute->>AuthRoute : Verify password
AuthRoute->>JWT : Generate token with role
JWT-->>AuthRoute : Signed token
AuthRoute-->>Client : Login success with token
Client->>AuthMW : Protected route with Bearer token
AuthMW->>JWT : Verify token signature
JWT-->>AuthMW : Decoded payload
AuthMW->>AuthMW : Check role requirements
AuthMW-->>Client : Access granted/denied
```

**Diagram sources**
- [routes/authRoutes.js](file://routes/authRoutes.js#L8-L55)
- [middleware/auth.js](file://middleware/auth.js#L3-L23)

Key security features include:
- **Password Hashing**: bcrypt with configurable cost factor
- **JWT Token Management**: Secure token generation with expiration
- **Role-Based Access Control**: Middleware enforces role requirements
- **Input Sanitization**: Protection against NoSQL injection attacks
- **Rate Limiting**: Prevents brute force authentication attempts

**Section sources**
- [routes/authRoutes.js](file://routes/authRoutes.js#L1-L85)
- [middleware/auth.js](file://middleware/auth.js#L1-L25)

### File Upload and PDF Validation System
The submission system implements secure PDF file handling with comprehensive validation:

```mermaid
flowchart TD
Start([Upload Request]) --> ValidateAuth["Validate JWT Token"]
ValidateAuth --> CheckRole{"Student Role?"}
CheckRole --> |No| Forbidden["403 Forbidden"]
CheckRole --> |Yes| CheckFile["Check PDF File"]
CheckFile --> FileType{"PDF Type?"}
FileType --> |No| InvalidType["400 Invalid Type"]
FileType --> |Yes| CheckSize{"Within Size Limit?"}
CheckSize --> |No| TooLarge["400 File Too Large"]
CheckSize --> |Yes| MagicCheck["Validate PDF Magic Bytes"]
MagicCheck --> MagicValid{"Magic Bytes OK?"}
MagicValid --> |No| InvalidPDF["400 Invalid PDF"]
MagicValid --> |Yes| SaveFile["Save to Disk"]
SaveFile --> CreateRecord["Create Submission Record"]
CreateRecord --> Success["201 Created"]
Forbidden --> End([End])
InvalidType --> End
TooLarge --> End
InvalidPDF --> End
Success --> End
```

**Diagram sources**
- [routes/submissionRoutes.js](file://routes/submissionRoutes.js#L47-L83)

The file upload system ensures:
- **Type Safety**: Only PDF files are accepted
- **Size Limits**: Maximum 10MB file size enforcement
- **Content Validation**: Actual PDF magic number verification
- **Unique Naming**: UUID-based filename generation
- **Secure Storage**: Files stored in dedicated uploads directory

**Section sources**
- [routes/submissionRoutes.js](file://routes/submissionRoutes.js#L17-L45)

### Multi-Role Workflow Implementation
The system implements distinct workflows for each role with appropriate permissions and capabilities:

#### Student Workflow
Students can create submissions, track their progress, and view associated reviews:

```mermaid
sequenceDiagram
participant Student as "Student"
participant SubmissionRoute as "Submission Routes"
participant SubmissionModel as "Submission Model"
participant ReviewModel as "Review Model"
Student->>SubmissionRoute : POST /api/submissions/upload
SubmissionRoute->>SubmissionModel : Create submission record
SubmissionModel-->>SubmissionRoute : Submission created
SubmissionRoute-->>Student : Upload success
Student->>SubmissionRoute : GET /api/submissions/mine?page=1&limit=10
SubmissionRoute->>SubmissionModel : Find student submissions
SubmissionModel-->>SubmissionRoute : Submissions list
SubmissionRoute->>ReviewModel : Find related reviews
ReviewModel-->>SubmissionRoute : Reviews list
SubmissionRoute-->>Student : Combined data with pagination
```

**Diagram sources**
- [routes/submissionRoutes.js](file://routes/submissionRoutes.js#L85-L121)

#### Faculty Workflow
Faculty members can manage assigned submissions, provide reviews, and track their evaluation history:

```mermaid
sequenceDiagram
participant Faculty as "Faculty Member"
participant FacultyRoute as "Faculty Routes"
participant SubmissionModel as "Submission Model"
participant ReviewModel as "Review Model"
Faculty->>FacultyRoute : GET /api/faculty/assigned?page=1&limit=10
FacultyRoute->>SubmissionModel : Find assigned submissions
SubmissionModel-->>FacultyRoute : Assigned submissions
FacultyRoute-->>Faculty : List with pagination
Faculty->>FacultyRoute : POST /api/faculty/review
FacultyRoute->>SubmissionModel : Verify assignment
SubmissionModel-->>FacultyRoute : Assignment verified
FacultyRoute->>ReviewModel : Create/update review
ReviewModel-->>FacultyRoute : Review saved
FacultyRoute->>SubmissionModel : Update submission status
SubmissionModel-->>FacultyRoute : Status updated
FacultyRoute-->>Faculty : Review success with new status
```

**Diagram sources**
- [routes/facultyRoutes.js](file://routes/facultyRoutes.js#L82-L133)

#### Administrator Workflow
Administrators have comprehensive oversight capabilities including user management, submission monitoring, and system statistics:

```mermaid
sequenceDiagram
participant Admin as "Administrator"
participant AdminRoute as "Admin Routes"
participant UserModel as "User Model"
participant SubmissionModel as "Submission Model"
Admin->>AdminRoute : GET /api/admin/users?page=1&limit=10&search=john
AdminRoute->>UserModel : Search and paginate users
UserModel-->>AdminRoute : Users with pagination
AdminRoute-->>Admin : User list with filters
Admin->>AdminRoute : POST /api/admin/assign
AdminRoute->>UserModel : Verify faculty exists
UserModel-->>AdminRoute : Faculty verified
AdminRoute->>SubmissionModel : Assign faculty to submission
SubmissionModel-->>AdminRoute : Assignment updated
AdminRoute-->>Admin : Assignment success
Admin->>AdminRoute : GET /api/admin/stats
AdminRoute->>UserModel : Count users
AdminRoute->>SubmissionModel : Count submissions
UserModel-->>AdminRoute : User counts
SubmissionModel-->>AdminRoute : Submission counts
AdminRoute-->>Admin : Dashboard statistics
```

**Diagram sources**
- [routes/adminRoutes.js](file://routes/adminRoutes.js#L20-L182)

**Section sources**
- [routes/submissionRoutes.js](file://routes/submissionRoutes.js#L1-L159)
- [routes/facultyRoutes.js](file://routes/facultyRoutes.js#L1-L172)
- [routes/adminRoutes.js](file://routes/adminRoutes.js#L1-L184)

### Data Validation and Error Handling
The system implements comprehensive validation and error handling across all request paths:

```mermaid
flowchart TD
Request[Incoming Request] --> Validation[Validation Pipeline]
Validation --> ValidationOK{Validation Passes?}
ValidationOK --> |No| ValidationError[400 Validation Error]
ValidationOK --> |Yes| BusinessLogic[Bussiness Logic]
BusinessLogic --> OperationOK{Operation Success?}
OperationOK --> |No| BusinessError[Business Error]
OperationOK --> |Yes| Success[Success Response]
ValidationError --> ErrorHandler[Error Handler]
BusinessError --> ErrorHandler
Success --> Response[JSON Response]
ErrorHandler --> Response
```

**Diagram sources**
- [middleware/validate.js](file://middleware/validate.js#L4-L16)
- [middleware/errorHandler.js](file://middleware/errorHandler.js#L3-L50)

The validation system covers:
- **Input Sanitization**: Removal of dangerous characters and patterns
- **Format Validation**: Email, password, and ID format checks
- **Business Rule Validation**: Domain-specific validation rules
- **Pagination Validation**: Page and limit parameter validation
- **Comprehensive Error Handling**: Consistent error responses across all layers

**Section sources**
- [middleware/validate.js](file://middleware/validate.js#L1-L120)
- [middleware/errorHandler.js](file://middleware/errorHandler.js#L1-L53)
- [utils/ApiError.js](file://utils/ApiError.js#L1-L17)
- [utils/catchAsync.js](file://utils/catchAsync.js#L1-L8)

## Dependency Analysis
The system maintains clean dependency relationships with minimal coupling between components:

```mermaid
graph TB
subgraph "Core Dependencies"
Express["express@^4.19.2"]
Mongoose["mongoose@^8.5.2"]
JWT["jsonwebtoken@^9.0.2"]
Bcrypt["bcrypt@^5.1.1"]
end
subgraph "Security & Validation"
Helmet["helmet@^8.1.0"]
RateLimit["express-rate-limit@^8.2.1"]
MongoSanitize["express-mongo-sanitize@^2.2.0"]
Validator["express-validator@^7.3.1"]
end
subgraph "File Handling"
Multer["multer@^1.4.5-lts.1"]
UUID["uuid@^13.0.0"]
end
subgraph "Development"
DotEnv["dotenv@^16.4.5"]
Nodemon["nodemon@^3.1.4"]
Cors["cors@^2.8.5"]
end
subgraph "Application Code"
Server["server.js"]
Routes["Route Handlers"]
Models["Mongoose Models"]
Middleware["Middleware"]
Utils["Utilities"]
end
Server --> Express
Server --> Mongoose
Server --> Helmet
Server --> RateLimit
Server --> MongoSanitize
Server --> Cors
Routes --> Express
Routes --> JWT
Routes --> Multer
Routes --> Validator
Routes --> Models
Routes --> Middleware
Routes --> Utils
Models --> Mongoose
Middleware --> JWT
Middleware --> Validator
Middleware --> Utils
Utils --> Express
Utils --> Mongoose
```

**Diagram sources**
- [package.json](file://package.json#L10-L26)

Key dependency characteristics:
- **Minimal External Dependencies**: Only essential packages for functionality
- **Security Focused**: Comprehensive security middleware and validation
- **Modern JavaScript**: ES6+ features with proper async/await patterns
- **Environment Configuration**: Flexible configuration through environment variables
- **Development Friendly**: Hot reload support and development scripts

**Section sources**
- [package.json](file://package.json#L1-L28)

## Performance Considerations
The system incorporates several performance optimization strategies:

### Database Optimization
- **Indexing Strategy**: Proper indexing on frequently queried fields (email, role, timestamps)
- **Population Efficiency**: Selective population of only required fields
- **Aggregation Pipelines**: Efficient counting and filtering operations
- **Connection Pooling**: Optimized MongoDB connection management

### Request Optimization
- **Rate Limiting**: Configured limits prevent abuse while maintaining responsiveness
- **Response Caching**: Strategic caching of static assets and frequently accessed data
- **Pagination**: Built-in pagination prevents large result sets
- **Selective Field Loading**: Minimal data transfer through selective field selection

### File Handling Optimization
- **Asynchronous Processing**: Non-blocking file operations
- **Memory Management**: Proper cleanup of temporary files
- **Concurrent Operations**: Parallel database queries where safe
- **Compression**: Optional compression for large responses

## Troubleshooting Guide
Common issues and their solutions:

### Authentication Issues
- **Token Missing**: Ensure Bearer token is included in Authorization header
- **Invalid Credentials**: Verify email/password combination and account activation
- **Role Mismatch**: Check user role matches required permissions
- **Token Expiration**: Implement automatic token refresh mechanisms

### File Upload Problems
- **File Type Errors**: Only PDF files are accepted
- **Size Limit Exceeded**: Files must be under 10MB
- **Permission Denied**: Verify user has student role
- **Storage Issues**: Check disk space and write permissions

### Database Connectivity
- **Connection Failures**: Verify MongoDB URI and network connectivity
- **Authentication Errors**: Check database credentials and user privileges
- **Timeout Issues**: Optimize queries and add appropriate indexes
- **Memory Leaks**: Monitor for proper resource cleanup

### API Error Responses
The system provides structured error responses with:
- **HTTP Status Codes**: Standardized response codes
- **Error Messages**: Descriptive messages for debugging
- **Stack Traces**: Development-only stack traces for debugging
- **Consistent Format**: Uniform error response structure

**Section sources**
- [middleware/errorHandler.js](file://middleware/errorHandler.js#L1-L53)
- [utils/ApiError.js](file://utils/ApiError.js#L1-L17)

## Conclusion
This academic submission portal backend provides a robust, secure, and scalable foundation for managing student academic submissions. The implementation demonstrates excellent architectural principles with clear separation of concerns, comprehensive security measures, and thoughtful error handling.

Key strengths include:
- **Security-First Design**: Multi-layered security with JWT, validation, and rate limiting
- **Role-Based Access Control**: Clear permission boundaries between student, faculty, and admin
- **Modular Architecture**: Clean separation enabling easy maintenance and extension
- **Comprehensive Validation**: End-to-end input validation and sanitization
- **Professional Error Handling**: Consistent and informative error responses

The system is well-suited for academic institutions requiring a centralized platform for managing various types of student academic work while maintaining strict security and access controls. Its modular design allows for future enhancements such as additional submission types, advanced analytics, or integration with external systems.