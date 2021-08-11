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
avatars: ['chamomile', 'orange', 'tea-tree', 'rose', 'rosemary', 'leaf']

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

Parameters: `body`

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