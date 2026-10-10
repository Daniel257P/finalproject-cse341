# StockFlow API

CSE 341 Final Project — a RESTful inventory API for a small manufacturing plant. It tracks suppliers, raw materials, finished products, and production orders.

**Team:** Daniel Paulino · Itohan Otasowie Martha · Emerald Uwaoma Awoke · Etim Frank

---

### Daniel Paulino Individual Contribution
* Project setup: Created the repository and the base architecture: Express server, MongoDB/Mongoose connection, folder structure (models, controllers, routes, middleware), the shared validation helper and ObjectId validation middleware, GitHub OAuth authentication, and the initial Swagger documentation.
* Users: Built the User model, controller, routes, and validation (full CRUD).
* Production Orders: Built the Production Order model, controller, routes, and validation (full CRUD).
* Customer Orders: Built the Customer Order collection with business logic. When an order is created, the API reserves finished-goods stock if enough is available. Otherwise, it automatically creates a linked production order. Deleting an order returns reserved stock or cancels the linked production order.
* Code review and fixes: Standardized DELETE responses to 204 No Content across the API, merged the duplicate Materials sections in Swagger, fixed the low-stock materials query and route, and aligned the material unit validation with the database model.

### Itohan Otasowie Martha

* created the teams database on MongoDB atlas page and revealed the connection string, so that other team members can connect to the database.
* created materials collection and built four API methods, routes,  controllers and models files/functions for the collection

### Etim Frank – Individual Contribution
* Worked on the Swagger API documentation and improved Production Orders endpoint documentation.
* Updated Swagger configuration to use the Render deployment URL instead of localhost.
* Added request-body documentation for the POST and PUT Production Orders endpoints.
* Regenerated and reviewed (swagger.json)  and tested the API through the deployed Render Swagger UI.
* Resolved Git rebase conflicts and committed and pushed the completed Swagger fixes to the team GitHub repository.

### Emerald Uwaoma Awoke - Individual Contribution
* Swagger documentation: Updated swagger.json to document the Products and Suppliers endpoints, including request-body examples and relevant response status codes. The documentation covers the CRUD operations for both collections.
* Products and Suppliers Swagger documentation: Updated swagger.json to document all five CRUD endpoints for both the Products and Suppliers collections, including request parameters and expected response status codes.
* Request-body documentation: Added Swagger annotations to the Products and Suppliers controllers to provide example request bodies for creating and updating records.
* API documentation improvements: Documented the product and supplier fields used in API requests, making it easier to understand and test the endpoints through Swagger UI.
*  Automated Testing: 
- Created automated tests for the Products and Suppliers collection.
- Created tests for product and supplier request validation to help verify that invalid input is handled appropriately.
* Request Validation Middleware
- Updated `middleware/product.js` to validate product data, including required fields, numeric values, non-negative quantities and prices, and supported units of measurement.
- Updated `middleware/supplier.js` to validate required supplier information and email addresses.