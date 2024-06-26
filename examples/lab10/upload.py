#!/usr/bin/env python3
import random
import time
from os import listdir

import httpx
# import aiofiles
import requests
import uuid

from multiprocessing import Pool
from datetime import date

base_url='http://localhost:3555/api'
course=''
assignment = ''
admin_utorid = "liutmich"
admin_headers = {"utorid": admin_utorid, "http_mail": "ido.benhaim@mail.utoronto.ca", "sn": "Liut",
                 "givenName": "Michael"}

n = 1000
group_size = 30


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
        'groupSize': group_size,
        "runner_image": "python",
        "image_version": "lab10-3.10.11"
    }
    response = requests.post(url, json=data, headers=admin_headers)
    if response.status_code != 201:
        print(response.status_code)
        print(response.json())
        exit(1)


def add_padding(user: str):
    """
    Add enough u's to the user id so that it is 6 characters long.
    """
    return 'u' * (6 - len(user)) + user


def generate_headers(user: int) -> dict:
    """
    Given a student id, generate the headers for the student.

    Preconditions:
        - id is a positive integer
    """
    return {
        "utorid": add_padding(user),
        "http_mail": f"{user}@mail.utoronto.ca",
        "sn": user,
        "givenName": user
    }


def upload_submission(user: str):
    """
    Upload the submission for the given user.
    """
    print(course, assignment, user)
    with open(f'./lab_10_submissions/{user}/lab10.py', mode='rb') as f:
        contents = f.read()
    with httpx.Client() as client:
        url = f'{base_url}/courses/{course}/assignments/{assignment}/submissions/'
        response = client.post(url, files={
            'files': ("lab10.py", contents, "text/plain"),
        }, headers=generate_headers(user))
        if response.status_code != 200:
            print(response.status_code)
            print(response.json())


def upload_tests(user: str):
    """
    Upload the tests for the given user.
    """
    print(course, assignment, user)
    with open(f'./lab_10_submissions/{user}/lab10_tests.py', mode='rb') as f:
        contents = f.read()
    with httpx.Client() as client:
        url = f'{base_url}/courses/{course}/assignments/{assignment}/testcases/'
        files = {
            'files': ("lab10_tests.py", contents, "text/plain")
        }
        response = client.post(url, files=files, headers=generate_headers(user))
        if response.status_code != 200:
            print(response.status_code)
            print(response.json())


def get_students():
    """
    Get a list of all the students in the lab_10_submissions directory.
    """
    return list(listdir(f'./lab_10_submissions'))


def enroll_students(students: list[str]):
    """
    Enroll all the students in the given list into the course.
    """
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


def upload_student(data: tuple[str, str, str]):
    global base_url
    global course
    global assignment
    student = data[0]
    course = data[1]
    assignment = data[2]
    print(f"Uploading for {student}")
    try:
        upload_submission(student)
        pass
    except Exception as e:
        print(e)
    try:
        upload_tests(student)
    except Exception as e:
        print(e)
    return student

def main():
    global base_url
    global course
    global assignment
    base_url = 'http://localhost:3555/api'
    course = 'CSC108' + uuid.uuid4().hex[:6]
    assignment = "lab10" + uuid.uuid4().hex[:6]
    print("Creating course")
    create_course("Introduction to Computer Science", course)
    print("Creating assignment")
    # a year from now
    create_assignment(course, assignment, str(date.today().replace(year=date.today().year + 1)))
    students = get_students()
    print("Enrolling students")
    enroll_students(students)
    print("Uploading submissions and tests")
    url = f'{base_url}/courses/{course}/assignments/{assignment}/submissions/'
    files = {
        'files': ("lab10.py",
                  open(f'./lab10.py', 'rb'),
                  "text/plain")
    }
    response = requests.post(url, json={}, files=files, headers=admin_headers)
    if response.status_code != 200:
        print(response.status_code)
        print(response.json())
        exit(1)
    random.shuffle(students)
    pooling = 50
    print("Uploading", len(students), "students")
    print("Group size: ", group_size)
    print("Starting upload at a time: ", time.time())
    with Pool(pooling) as p:
        p.map(upload_student, [(x, course, assignment) for x in students[:n if len(students) > n >= 0 else len(students)]])
    # for i in range(0, n if len(students) > n >= 0 else len(students), pooling):
    #     print(f"Uploading students {i} to {i+pooling}")
    #     await upload_student(students[i])
    print("Done")


if __name__ == "__main__":
    main()
