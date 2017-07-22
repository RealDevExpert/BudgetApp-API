# BudgetApp
The BudgetApp is basically a back-end (in Node.js) & front-end (in React) Application for Budget Management, in which We've added the Login, Logout and Authentication modules in addition back-end requests for Create, Update, View, Delete Incomes and Expenses and users can get total Income & Expenses.

# Table of Contents
1. [Authors and Contributors](#author)
2. [How to deploy the app?](#deploy-app)
3. [Resources Used](#resources)
4. [Future Improvements](#future-improvements)

### <a name="author"></a>1. Authors and Contributors

I, [Devashish Patel](https://github.com/Devashish2910) and [Abhishek Ghosh](https://github.com/ghoshabhi) are the developers for this Application.

### <a name="deploy-app"></a>2. How to check the app ?
Follow the steps below to check back-end API :

-  Postman Collection Link : https://www.getpostman.com/collections/2250806e9bda9762ee18
- URL -https://budgetapp-api.herokuapp.com
| Description | Endpoint  | Method  | Body  | Sample Response  |
| ------------ | ------------ | ------------ | ------------ | ------------ |
| Create User  | /users   |  POST | ```json
{
	"email": "pbhailu3@gmail.com",
	"password": "deva2910"
}
```  | ```json
{
    "id": "5972b8167b46c0194edb5a19",
    "email": "pbhailu345@gmail.com"
}
``` |
|   |   |   |   |   |
|   |   |   |   |   |
|   |   |   |   |   |
|   |   |   |   |   |
|   |   |   |   |   |
|   |   |   |   |   |




### <a name="resources"></a> 3. Resources

* Node.js is used as the scripting language for the server.
* `npm` modules used in the API.
 * `express`, `crypto-js`, `bcryptjs`, `underscore`, `body-parser`,`JWT`,`mongoose`
* Database : MongoDB

### <a name="future-improvements"></a> 4. Future Improvements

* Use `mongodb` as No Sql Database
* Implement front-end with React

_Any suggestions for the API are welcomed. Please email me at devashish2910@gmail.com to share your suggestions_
