import pytest

from palindrome import *

# only tests no spaces


def test_palindrome_1():
    assert not palindrome("bye")
