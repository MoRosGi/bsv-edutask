import json
import pytest
import pymongo

from src.util.dao import DAO

## Open and dump original validator in test validators
@pytest.fixture
def validator_test(original_collection_name):
    original_validator = "../../f{original_collection_name}.json"
    test_validator = "f{original_collection_name}_test.json"

    with open(original_validator, "r") as openfile:
        json_object = json.load(openfile)
    with open(test_validator, "w") as outfile:
        json.dump(json_object, outfile)

## Create a DAO object
@pytest.fixture
def dao(collection_name):
    test_collection = validator_test(collection_name)
    yield DAO(test_collection)
    ## teardown file test created
    ## drop collection (test)

## test collection task
    ## Use parametrize for different cases
    ## DAO task

## test collection todo
    ## Use parametrize for different cases
    ## DAO todo

## test collection user
    ## Use parametrize for different cases
    ## DAO user

## test collection video
    ## Use parametrize for different cases
    ## DAO video