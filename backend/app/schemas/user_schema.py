from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRegister(BaseModel):
    """
    Schema used to register a new user.
    """

    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
    )

    email: EmailStr

    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
    )


class UserResponse(BaseModel):
    """
    Public user information returned by the API.
    """

    id: int

    username: str

    email: EmailStr

    model_config = ConfigDict(
        from_attributes=True,
    )


class UserLogin(BaseModel):
    """
    Login request.
    """

    email: EmailStr

    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
    )


class Token(BaseModel):
    """
    JWT access token returned after login.
    """

    access_token: str

    token_type: str