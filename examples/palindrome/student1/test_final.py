import pytest

from palindrome import *

# tests are good but doesn't catch student 3's bug, but should knock student 1 and 2 down

def test_normal_pass():
    assert palindrome(" r acecar    ")
