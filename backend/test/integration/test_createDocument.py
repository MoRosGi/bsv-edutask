from pathlib import Path
import json
import pytest
import datetime
from bson import ObjectId

from src.util.dao import DAO

VALIDATOR_DIR = Path("./src/static/validators")
date_test = datetime.datetime.now()
objectId_test = ObjectId()

@pytest.fixture
def dao():
    collections_test = []
    def _dao(collection_name):
        original = VALIDATOR_DIR / f"{collection_name}.json"
        test_file = VALIDATOR_DIR / f"{collection_name}_test.json"

        with original.open("r") as openfile:
            json_object = json.load(openfile)
        with test_file.open("w") as outfile:
            json.dump(json_object, outfile)

        collections_test.append((collection_name, test_file))

        return DAO(test_file.stem)

    yield _dao
    for name, path in collections_test:
        DAO(f"{name}_test").collection.drop()
        path.unlink()

@pytest.mark.integration
def test_task_id(dao):
    dao_object = dao("task")
    document_created = dao_object.create({"title": "Title test", "description": "Description test", "startdate": date_test, "requires": [objectId_test]})
    assert "_id" in document_created.keys()


@pytest.mark.integration
@pytest.mark.parametrize('data, count', [({"title": "Title test", "startdate": date_test, "requires": [objectId_test]}, 1), ({"title": "Title test", "description": "Description test", "startdate": "2025-04-25", "requires": [objectId_test]}, 1), ({"title": "Title test", "description": "Description test", "startdate": date_test, "requires": [objectId_test]}, 2)])
def test_task_exception(dao, data, count):
    dao_object = dao("task")
    if count > 1:
        dao_object.create(data)
        with pytest.raises(Exception):
            dao_object.create(data)
    with pytest.raises(Exception):
        dao_object.create(data)

@pytest.mark.integration
def test_todo_id(dao):
    dao_object = dao("todo")
    document_created = dao_object.create({"description": "Description test", "done": True})
    assert "_id" in document_created.keys()

@pytest.mark.integration
@pytest.mark.parametrize('data, count', [({"done": True}, 1), ({"description": "Description test", "done": "Yes"}, 1), ({"description": "Description test", "done": True}, 2)])
def test_todo_exception(dao, data, count):
    dao_object = dao("todo")
    if count > 1:
        dao_object.create(data)
        with pytest.raises(Exception):
            dao_object.create(data)
    with pytest.raises(Exception):
        dao_object.create(data)

@pytest.mark.integration
def test_user_id(dao):
    dao_object = dao("user")
    document_created = dao_object.create({"firstName": "John","lastName": "Doe", "email": "john@mail.se", "tasks": [objectId_test]})
    assert "_id" in document_created.keys()

@pytest.mark.integration
@pytest.mark.parametrize('data, count', [({"firstName": "John","lastName": "Doe", "tasks": [objectId_test]}, 1), ({"firstName": "John","lastName": "Doe", "email": "john@mail.se", "tasks": "Clean garden"}, 1), ({"firstName": "John","lastName": "Doe", "email": "john@mail.se", "tasks": [objectId_test]}, 2)])
def test_user_exception(dao, data, count):
    dao_object = dao("user")
    if count > 1:
        dao_object.create(data)
        with pytest.raises(Exception):
            dao_object.create(data)
    with pytest.raises(Exception):
        dao_object.create(data)

@pytest.mark.integration
def test_video_id(dao):
    dao_object = dao("video")
    document_created = dao_object.create({"url": "https://videos.com"})
    assert "_id" in document_created.keys()

@pytest.mark.integration
@pytest.mark.parametrize('data', [{}, {"url": 35}])
def test_video_exception(dao, data):
    dao_object = dao("video")
    with pytest.raises(Exception):
        dao_object.create(data)