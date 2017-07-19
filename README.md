# BudgetApp-API
The BudgetApp-API is basically a back-end (in Node.js) & front-end (in React) Application for Budget Management, in which We've added the Login, Logout and Authentication modules in addition back-end requests for Create, Update, View, Delete Incomes and Expenses and users can get total Income & Expenses.

# Table of Contents
1. [Authors and Contributors](#author)
2. [How to deploy the app?](#deploy-app)
3. [Resources Used](#resources)
4. [Future Improvements](#future-improvements)

### <a name="author"></a>1. Authors and Contributors

I, [Devashish Patel](https://github.com/Devashish2910) and my friend [Abhishek Ghosh](https://github.com/ghoshabhi) are the developers for this Application.

### <a name="deploy-app"></a>2. How to check the app ?
Follow the steps below to check back-end API :

1. Postman Collection Link : https://www.getpostman.com/collections/2250806e9bda9762ee18
2. Import the whole collection in your Postman App from the above link.
3. Now set environment of Postman as below.
| Key | Value |
| --- | --- |
| `url` | https://www.getpostman.com/collections/2250806e9bda9762ee18 |
| `auth` | set login token here and then put it in the req.header (Auth) value |






### <a name="resources"></a> 3. Resources

* Node.js is used as the scripting language for the server.
* `npm` modules used in the API.
 * `express`, `Sequelize`, `crypto-js`, `bcryptjs`, `pg`, `pg-hstore`,`sqlite3`, `underscore`, `body-parser`
* Database : Sqlite (For Local), Postgres (For Heroku)

### <a name="future-improvements"></a> 4. Future Improvements

* Use `mongodb` as No Sql Database
* Implement front-end with React

_Any suggestions for the API are welcomed. Please email me at devashish2910@gmail.com to share your suggestions_
