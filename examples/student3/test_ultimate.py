import pytest

from palindrome import *

# tests are good but doesn't catch student 3's bug, but should knock student 1 and 2 down


def test_space_fail():
    assert not palindrome("by e")


def test_space_fail_2():
    assert not palindrome(" b y  e ")


def test_space_pass():
    assert palindrome("ra cec ar")


def test_space_pass_2():
    assert palindrome("m a d a m")


def test_normal_pass():
    assert palindrome("racecar")


def test_normal_fail():
    assert not palindrome("bye")
