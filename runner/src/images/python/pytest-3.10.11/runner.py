import os
import sys
from pathlib import Path

import pytest
import json
import base64
from contextlib import contextmanager
import random


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


class PytestPlugin:
    def __init__(self) -> None:
        self.results = {}

    @pytest.hookimpl(hookwrapper=True, tryfirst=True)
    def pytest_runtest_makereport(self, item, call):
        outcome = yield
        report = outcome.get_result()
        if report.failed or item.nodeid not in self.results:
            self.results[item.nodeid] = {
                "name": item.nodeid,
                "errors": report.longrepr
            }
        return report

    def res(self):
        failed = [f"id: {x['name']} output: {x['errors']}" for x in self.results.values() if x['errors'] is not None]
        if len(failed) == 0:
            return {'status': 'PASS', 'amount': len(self.results), 'coverage': json.loads(
                    open('coverage.json', 'r').read()) if Path(
                    'coverage.json').is_file() else None}
        else:
            return {'status': 'FAIL',
                    'amount': len(self.results),
                    'score': len(self.results) - len(failed),
                    'failed': failed,
                    'coverage': json.loads(
                        open('coverage.json', 'r').read()) if Path(
                        'coverage.json').is_file() else None
                    }


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

    plugin = PytestPlugin()
    args = ['-o', 'python_files=*test*.py', '.']
    # if 'coverage' in data and data['coverage']:
    args += ['--cov', '--cov-report=json']
    with suppress_output():
        random.seed(0)
        pytest_out = pytest.main(args, plugins=[plugin])

    if pytest_out == 0 or pytest_out == 1:
        print(json.dumps(plugin.res()))
    else:
        txt = ""
        if pytest_out == 2:
            txt = "Test execution was interrupted by the user / error importing tests"
        elif pytest_out == 3:
            txt = "Internal error happened while executing tests"
        elif pytest_out == 4:
            txt = "pytest command line usage error"
        elif pytest_out == 5:
            txt = "no tests were collected"
        print(json.dumps({'status': 'ERROR',
                          'error': f"pytest returned exit code {pytest_out}: {txt}"}))
