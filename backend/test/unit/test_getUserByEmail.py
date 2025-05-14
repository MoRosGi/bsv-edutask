import pytest
import unittest.mock as mock

from src.controllers.usercontroller import UserController

# Test comment 2.0
@pytest.fixture
def mockedDAO():
    return mock.MagicMock()

@pytest.fixture
def sut(mockedDAO):
    return UserController(dao=mockedDAO)

@pytest.fixture
def user_obj():
    return [{'name': "John Doe", 'email': "john@mail.se"}, {'name': "Johnna Doever", 'email': "john@mail.se"}]

@pytest.mark.unit
def test_user_unique(sut, mockedDAO, user_obj):
    mockedDAO.find.return_value = [user_obj[0]]
    result = sut.get_user_by_email("john@mail.se")
    assert result == user_obj[0]

@pytest.mark.unit
def test_user_multiple(sut, mockedDAO, user_obj):
    mockedDAO.find.return_value = user_obj
    result = sut.get_user_by_email("john@mail.se")
    assert result == user_obj[0]

@pytest.mark.unit
def test_user_multiple_warning(sut, mockedDAO, user_obj, capsys):
    mockedDAO.find.return_value = user_obj
    sut.get_user_by_email("john@mail.se")
    captured = capsys.readouterr()
    expected_warning = f'Error: more than one user found with mail john@mail.se'
    assert expected_warning in captured.out

@pytest.mark.unit
def test_user_none(sut, mockedDAO):
    mockedDAO.find.return_value = []
    result = sut.get_user_by_email("john@mail.se")
    assert result is None

@pytest.mark.unit
def test_exception_raise(sut, mockedDAO):
    mockedDAO.find.side_effect = Exception
    with pytest.raises(Exception):
        sut.get_user_by_email("john@mail.se")

@pytest.mark.unit
@pytest.mark.parametrize('email', ['john@@mail.se', '', '@', 'john.se', 'john@', '@mail.se', 'john@.se'])
def test_valueError_raise(sut, email):
    with pytest.raises(ValueError, match='Error: invalid email address'):
        sut.get_user_by_email(email)