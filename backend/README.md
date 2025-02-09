# Togetherly — Backend

Togetherly's backend is a robust and scalable API built with Express and TypeScript that powers the digital wedding planner platform. It provides secure endpoints, handles data validation and persistence, and manages user authentication, budgets, and more — all while ensuring high performance and reliability.

## Features

- **Secure Authentication:** Implements JWT-based authentication and Google OAuth integration for secure user management.
- **Robust API Endpoints:** Provides endpoints for handling wedding details, budgets, tasks, and more.
- **Data Validation:** Uses Zod to enforce strict schemas for incoming data, ensuring reliable API behavior.
- **MongoDB Integration:** Leverages Mongoose for schema-based data modeling and communication with MongoDB.
- **Security Enhancements:** Utilizes Helmet and CORS middleware to protect against common web vulnerabilities.

## Tech Stack

- **Express**: A fast and minimalist web framework for Node.js.
- **TypeScript**: Provides static typing for improved code quality and maintainability.
- **Mongoose**: An ODM for MongoDB, facilitating schema-based data modeling.
- **JSON Web Tokens (JWT)**: For secure user authentication and session management.
- **Zod**: Validates and parses environment variables and request payloads.
- **Helmet and CORS**: Enhance security by setting various HTTP headers and restricting cross-origin requests.
