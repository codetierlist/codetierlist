import os
import sys
import pytest
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
            return {'status': 'PASS', 'amount': len(self.results)}
        else:
            return {'status': 'FAIL',
                    'amount': len(self.results),
                    'score': len(self.results) - len(failed),
                    'failed': failed
                    }


if __name__ == '__main__':
    run_data = os.getenv("RUN_FILES")
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

    plugin = PytestPlugin()
    with suppress_output():
        pytest_out = pytest.main(['../tests'], plugins=[plugin])

    print(json.dumps(plugin.res()))
