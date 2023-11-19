import os
import sys
import unittest
import ciunittest
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


sys.path.append('../code')

suite = unittest.TestLoader().discover('../tests')
with suppress_output():
    json = ciunittest.JsonTestRunner().run(suite, formatted=True)

print(json)
