FROM python:3.10.11

# for user code
WORKDIR /code
COPY test_code.py ./

# for user tests
WORKDIR /tests
COPY test_test.py ./
COPY test_test_2.py ./

# for runner data
WORKDIR /setup
RUN pip install CIUnitTest
COPY runner.py ./

CMD ["python", "runner.py"]

