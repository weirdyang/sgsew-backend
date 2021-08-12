# About

Express backend using `passport`, `csurf`,`express-validator` and `mongoose`.

# API

## CSRF Protection

All `POST`, `PUT` and `DELETE` requests requires the csrf token to be set in any of locations specified in the `express csurf` [documentation](http://expressjs.com/en/resources/middleware/csurf.html). e.g. req.headers['x-csrf-token'] - the X-CSRF-Token HTTP request header.

To obain a token, make a `GET` request to `auth/csrftoken`, the token will be returned in a cookie and in the body, along with a `_csrf` cookie. This is the [double submit cookie technique](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie).

### Example
```
{
    "token": XXXXX
}
```
## General

If the request is invalid or has errors, the backend will reply with a `message` and `additionalInfo` which contains an array of objects that provides additional info on which part of the request is invalid:

A `500` status code will be returned if there is a server error.

## Example:

```
 {
     "message" : "Invalid inputs passed, please check your data",
     "additionalInfo: [
         {
            "name": "username",
            "error": "Username can not be empty"
         }
     ]
 }
```
# Routes

## Auth

###  `/auth/register` creates a new user

Method: `POST`

Parameters: `body`

```
{
    "username": "string",
    "password": "string",
    "email": "string",
    "avatar": "string"
}
```
avatars available values: ['chamomile', 'orange', 'tea-tree', 'rose', 'rosemary', 'leaf']

Returns:
* 200: If new user is created succesfully
* 422: If validation fails
    - username contains special characters
    - username length < 8
    - password does not contain at least 1 lower case, 1 upper case and 1 numeric character
    - password length < 8
    - avatar chosen is not in the list of allowed choices
    - username already exists in the database
    - email already exists in the database

###  `/auth/login` logins in user

Method: `POST`

Parameters: `body`

```
{
    "username": "string",
    "password": "string",
}
```

Returns:
* 200: If correct username and password
* 422: If validation fails
    - username field is empty
    - password field is empty
* 403: invalid username or password

###  `/auth/key` validates signup key

Method: `POST`

Parameters:

`body`

```
{
    "key": "string"
}
```

Returns:
* 200: If valid key
* 403: invalid key

###  `/auth/logout` clears jwt cookie

Method: `get`

Returns:
* 200

###  `/auth/csrftoken` returns a csrftoken

Method: `get`

Returns:
* 200
```
 {
     "token": "string"
 }
```

## Products

All methods in this area requires a JSON web token to be stored in a cookie with name `jwt`

###  `/products/create` creates a new product

Method: `POST`

Parameters:

`formData`
```
{
    "name": "string",
    "description": "string",
    "productType": "string",
    "brand": "string"
    "price": "string"
    "file": "file"
}
```

Returns:
* 200: If new product is created succesfully
* 422: If validation fails
    - any of the fields are empty
    - name or description are shorter than 6 characters
    - productType is not in ['hardware', 'services']
    - brand is shorter than 3 characters

###  `/products/:id` update a product with id {:id}

Method: `PUT`

Parameters:

`:id`: the id of the product to be updated

`formData`:
```
{
    "name": "string",
    "description": "string",
    "productType": "string",
    "brand": "string"
    "price": "string"
    "file": "file"
}
```

Returns:
* 200: If product is updated succesfully
* 422: If validation fails
    - any of the fields are empty
    - name or description are shorter than 6 characters
    - productType is not in ['hardware', 'services']
    - brand is shorter than 3 characters

###  `/products/:id` delete a product with id {:id}

Method: `DELETE`

Parameters:

`:id`: the id of the product to be deleted

Returns:
* 200: If product is deleted succesfully
* 404: If product with {:id} does not exist in database
* 403: If user is not an admin

###  `/products/user/:id` gets a array of products created and/or last modified by user

Method: `GET`

Parameters:

`:id`: the id of the user

Returns:
* 200
```
{
    "products": []
}
```

###  `/products/details/:id` gets details of product with id {:id}

Method: `GET`

Parameters:

`:id`: the id of the product

Returns:
* 200
```
{
    "_id": "string",
    "name": "string",
    "user": "string",
    "description": "string",
    "productType": "string",
    "createdAt": "string",
    "updatedAt": "string"
}
```
* 400 - if no product with that id exists in the database

###  `/products/image/:id` returns image associated for product with {:id}

Method: `GET`

Parameters:

`:id`: the id of the product

Returns:
* 200

Headers:
 - Content-Type: product.image.contentType,
 - Content-Length': product.image.length

 * 404 - if product with {:id} does not exist

## Users

All methods in this area requires a JSON web token to be stored in a cookie with name `jwt`

###  `/users/` return all users in the database

Method: `GET`

Returns:
* 200
```
{
    "users": [
        {
            "_id": "string",
            "username": "string",
            "email": "string",
            "avatar": "string",
            "createdAt": "string",
            "updatedAt": "string"
        }
    ]
}
```

###  `/users/:id` deletes user with {:id} from database

Method: `DELETE`

Parameters:

`:id` - id of user to be deleted

Returns:
* 200 - if user sucessfully deleted
* 404 - if no user with {:id} is found
* 403 - if user is not an admin

###  `/users/self` returns details of user associated with jwt token

Method: `get`

Returns:
* 200
```
{
    "_id": "string",
    "role": "string",
    "username": "string",
    "email": "string",
    "avatar": "string",
    "createdAt": "string",
    "updatedAt": "string"
}
```
###  `/users/single/:id` returns details of user with {:id}

Method: `get`

Returns:
* 200
```
{
    "_id": "string",
    "role": "string",
    "username": "string",
    "email": "string",
    "avatar": "string",
    "createdAt": "string",
    "updatedAt": "string"
}
```
* 404 - if user with {:id} does not exist

## Search

These methods are for retrieving data that can be accessed without an account

###  `/search/image/:id` returns image of product with {:id}

Method: `get`

Returns:
* 200
```
{
    "_id": "string",
    "role": "string",
    "username": "string",
    "email": "string",
    "avatar": "string",
    "createdAt": "string",
    "updatedAt": "string"
}
```
* 404 - if user with {:id} does not exist

Method: `GET`

Parameters:

`:id`: the id of the product

Returns:
* 200

Headers:
 - Content-Type: product.image.contentType,
 - Content-Length': product.image.length

 * 404 - if product with {:id} does not exist

###  `/search/image/:id` returns image of product with {:id}

Method: `get`

Returns:
* 200
```
{
    "_id": "string",
    "role": "string",
    "username": "string",
    "email": "string",
    "avatar": "string",
    "createdAt": "string",
    "updatedAt": "string"
}
```
* 404 - if user with {:id} does not exist

Method: `GET`

Parameters:

`:id`: the id of the product

Returns:
* 200

Headers:
 - Content-Type: product.image.contentType,
 - Content-Length': product.image.length

 * 404 - if product with {:id} does not exist

 ###  `/search/products` finds products based on keyword

Method: `get`

Parameters:

`query`:

- keyword: string - will search for partial and full matches for keyword provided in the brand, description and name fields
- sort: sorts results based on name or brand. default is nameasc. available options:
    - nameasc - sort by name in ascending order
    - namedesc - sort by name in descending order
    - brandasc - sort by brand in ascending order
    - nameasc - sort by name in ascending order
- type: filters based on product type. available options: hardware, services.
- limit: number - max amount of products to return. default is 12.
- skip: number - number of documents to skip. default is 0.
- min: number - min price. default is 0.
- max: number - max price. default is `Number.MAX_VALUE`
Returns:
* 200
```
{
    "data": [
        {
            "_id": "string",
            "price": number,
            "name": "string",
            "user": "string",
            "description": "string",
            "productType": "string",
            "brand": "string"
        }
    ],
    "count": numer of documents which match the query
}
```
* 404 - if user with {:id} does not exist

Method: `GET`

Parameters:

`:id`: the id of the product

Returns:
* 200

Headers:
 - Content-Type: product.image.contentType,
 - Content-Length': product.image.length

 * 404 - if product with {:id} does not exist