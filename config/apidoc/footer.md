# Codes

## <a id="errors"></a>Errors

If you have an error from the API, you'll get a generic structure with a field `code`. This field has an integer value.

| Code | HTTP Code |                 Description                                |
|:----:|:---------:|------------------------------------------------------------|
| 1    | 400       | You provided incorrect params                              |
| 2    | 401       | You're not authorized                                      |
| 3    | 400       | The email provided already exists                          |
| 4    | 404       | The requested resource is not found                        |
| 5    | 500       | The server got an error, this is not your fault            |
| 6    | 400       | You provided a bad or malformed token                      |
| 7    | 401       | The credentials provided don't match ani in database       |