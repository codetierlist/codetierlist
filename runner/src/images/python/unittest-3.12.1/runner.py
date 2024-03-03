import os
import sys
import unittest
import json
import base64
from contextlib import contextmanager


@contextmanager
def suppress_output():
    with open(os.devnull, "w") as devnull:
        old_stdout = sys.stdout
        old_stterr = sys.stderr
        sys.stdout = devnull
        sys.stderr = devnull
        try:
            yield
        finally:
            sys.stdout = old_stdout
            sys.stderr = old_stterr


if __name__ == '__main__':
    run_data = input()
    data = json.loads(run_data)
    sol_files = data['solution_files']
    test_files = data['test_case_files']

    for file in sol_files.keys():
        os.makedirs(os.path.dirname(os.path.join('../code', file)), exist_ok=True)
        with open(os.path.join('../code', file), 'wb') as f:
            f.write(base64.b64decode(sol_files[file]))

    for file in test_files.keys():
        os.makedirs(os.path.dirname(os.path.join('../tests', file)), exist_ok=True)
        with open(os.path.join('../tests', file), 'wb') as f:
            f.write(base64.b64decode(test_files[file]))

    sys.path.append('../code')
    os.chdir('../tests')

    suite = unittest.TestLoader().discover('.')
    with suppress_output():
        unittest_out = unittest.TestResult()
        suite.run(unittest_out)

    if unittest_out.wasSuccessful():
        print(json.dumps({'status': 'PASS', 'amount': unittest_out.testsRun}))
    else:
        print(json.dumps({'status': 'FAIL',
                          'amount': unittest_out.testsRun,
                          'score': unittest_out.testsRun - len(unittest_out.failures) - len(unittest_out.errors),
                          'failed': [f"id: {x[0].id()} output: {x[1]}" for x in (unittest_out.failures + unittest_out.errors)]
                          }))
