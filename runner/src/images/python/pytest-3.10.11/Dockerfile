FROM python:3.10.11

# for user code
WORKDIR /code

# for user tests
WORKDIR /tests

# for runner data
WORKDIR /setup
RUN pip install pytest
COPY runner.py ./

CMD ["python", "runner.py"]
