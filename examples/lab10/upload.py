import asyncio
import random
from os import listdir

import aiofiles
import httpx
import requests
import uuid

base_url = 'http://localhost:3555/api'
course = 'CSC108' + uuid.uuid4().hex[:6]
assignment = "lab10" + uuid.uuid4().hex[:6]
admin_utorid="liutmich"
admin_headers = {"utorid": admin_utorid, "http_mail": "ido.benhaim@mail.utoronto.ca", "sn": "Liut", "givenName": "Michael"}
n = -1
def create_course(course_name: str, course_code: str) -> str:
    """
    Given a course name and a course code, create a course and return the
    course id.

    Preconditions:
        - course_name is not an empty string
        - course_code is not an empty string
    """
    url = f'{base_url}/courses'
    data = {
        'name': course_name,
        'code': course_code
    }
    response = requests.post(url, json=data, headers=admin_headers)
    if response.status_code != 201:
        print(response.status_code)
        print(response.json())
        exit(1)

def create_assignment(course: str, assignment: str, due_date: str) -> str:
    """
    Given a course id, an assignment name and a due date, create an assignment
    and return the assignment id.

    Preconditions:
        - course is not an empty string
        - assignment is not an empty string
        - due_date is not an empty string
    """
    url = f'{base_url}/courses/{course}/assignments'
    data = {
        'name': assignment,
        'dueDate': due_date,
        'description': 'This is a lab assignment',
        'groupSize': 100,
        "image": "python",
        "image_version": "lab10-3.10.11"
    }
    response = requests.post(url, json=data, headers=admin_headers)
    if response.status_code != 201:
        print(response.status_code)
        print(response.json())
        exit(1)

def add_padding(user : str):
    return 'u' * (6 - len(user)) + user

async def upload_submission(user : str):
    async with httpx.AsyncClient() as client:
        url = f'{base_url}/courses/{course}/assignments/{assignment}/submissions'
        response = await client.post(url, files={
            'files': ("lab10.py", open(f'./lab_10_submissions/{user}/lab10.py', 'rb'), "text/plain"),
        }, headers={
            "utorid": add_padding(user),
            "http_mail": f"{user}@mail.utoronto.ca",
            "sn": "Last name",
            "givenName": user,
        })
        if response.status_code != 200:
            print(response.status_code)
            print(response.json())

async def upload_tests(user : str):
    async with aiofiles.open(f'./lab_10_submissions/{user}/lab10_tests.py', mode='rb') as f:
        contents = await f.read()
    async with httpx.AsyncClient() as client:
        url = f'{base_url}/courses/{course}/assignments/{assignment}/testcases'
        files = {
            'files': ("lab10_tests.py", contents, "text/plain")
        }
        response = await client.post(url, files=files, headers={
            "utorid": add_padding(user),
            "http_mail": f"{user}@mail.utoronto.ca",
            "sn": "Last name",
            "givenName": user
        })
        if response.status_code != 200:
            print(response.status_code)
            print(response.json())

def get_students():
    return list(listdir(f'./lab_10_submissions'))

def enroll_students(students : list[str]):
    url = f'{base_url}/courses/{course}/add'
    print([add_padding(student) for student in students])
    data = {
        'utorids': [add_padding(student) for student in students],
        'role': 'STUDENT'
    }
    response = requests.post(url, json=data, headers=admin_headers)
    if response.status_code != 200:
        print(response.status_code)
        print(response.json())
        exit(1)
async def upload_student(student : str):
    print(f"Uploading for {student}")
    try:
        await upload_submission(student)
        pass
    except Exception as e:
        print(e)
    try:
        await upload_tests(student)
    except Exception as e:
        print(e)
async def main():
    print("Creating course")
    create_course("Introduction to Computer Science", course)
    print("Creating assignment")
    create_assignment(course, assignment, "2024-11-30")
    students = get_students()
    print("Enrolling students")
    enroll_students(students)
    print("Uploading submissions and tests")
    url = f'{base_url}/courses/{course}/assignments/{assignment}/submissions'
    files = {
        'files': ("lab10.py",
                  open(f'./lab10.py', 'rb'),
                  "text/plain")
    }
    response = requests.post(url, json={},files=files, headers=admin_headers)
    if response.status_code != 200:
        print(response.status_code)
        print(response.json())
        exit(1)
    random.shuffle(students)
    pooling = 20
    for i in range(0, n if len(students) > n >= 0 else len(students), pooling):
        print(f"Uploading students {i} to {i+pooling}")
        await asyncio.gather(*map(upload_student, students[i:i+pooling]))
    print("Done")

if __name__ == "__main__":
    asyncio.run(main())
