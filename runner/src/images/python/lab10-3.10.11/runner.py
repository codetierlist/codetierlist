import os
import sys
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
        with open(os.path.join('../code', file), 'wb') as f:
            f.write(base64.b64decode(sol_files[file]))

    for file in test_files.keys():
        with open(os.path.join('../tests', file), 'wb') as f:
            f.write(base64.b64decode(test_files[file]))

    sys.path.append('../code')
    sys.path.append('../tests')

    with open('../tests/lab10_tests.py', 'r+') as f:
        content = f.read()
        f.seek(0, 0)
        f.write("from lab10 import find_email\n\n" + content)

    from lab10_tests import run_tests

    try:
        with suppress_output():
            ptests, ftests = run_tests()
    except Exception as e:
        print(json.dumps({
            'status': 'ERROR',
            'error': str(e)
        }))
    else:
        if len(ftests) == 0:
            print(json.dumps({
                'status': 'PASS',
                'amount': len(ptests)
            }))
        else:
            print(json.dumps({
                'status': 'FAIL',
                'amount': len(ptests) + len(ftests),
                'score': len(ptests),
                'failed': ftests
            }))
