import pytest

from palindrome import *

# only tests no spaces


def test_palindrome():
    assert palindrome("racecar")


def test_palindrome_1():
    assert palindrome("madam")
