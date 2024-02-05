"""
UTM: CSC108, Fall 2021

Practical Lab 10

Instructors: Michael Liut, Andrew Petersen, Andi Bergen,
             Tingting Zhu, Pooja Vashisth, and Sonya Allin

This code is provided solely for the personal and private use of
students taking the CSC108 course at the University of Toronto.
Copying for purposes other than this use is expressly prohibited.
All forms of distribution of this code, whether as given or with
any changes, are expressly prohibited.

All of the files in this directory and all subdirectories are:
Copyright (c) 2021 Michael Liut, Haocheng Hu

LAB RESTRICTIONS, PLEASE READ:
Do not add any imports, the ones that you need will be given to you.
Do not use try-except statements, you should be able to anticipate
or prevent any errors from happening at all!
"""

import re


def find_email(s: str) -> str:
    """
    Given a string <s>, return the email that exists in the string.

    Preconditions:
        <s> contains at most 1 email, or none at all.

    If <s> does not contain an email, return the empty string.

    Email definition:
        An email address is defined as 'name@domain.com' or 'name@domain.ca'
        with the following specifications:

            name: the name is an alphanumeric string that is less than or
                  equal to 12 characters. Additional characters allowed are
                  dash (-), period (.) and underscore (_). But the email
                  cannot start or end with these additional characters.
                  The name must also be at least 1 character long.
                  Example names:
                                a
                                ab
                                a_b
                                A__B..C--D
                                1nt3r3st.1ng

            domain: the domain is strictly numerical, and the number must be
                    divisible by 5. the length of the domain is unrestricted.
                    Example domains:
                                984125
                                0

            ending: the email must end with a (.com) or (.ca) (case sensitive)

    Note: you must not use any loops (for, while) here.
          We want you to just use the re library for this function.

    >>> find_email('12345a_test_email@165265365.com!')
    'a_test_email@165265365.com'
    """
    # to avoid PyTA yelling, we are splitting the regex into two parts
    x = r'[a-zA-Z\d]([\w.-]{1,10})?(?(1)'
    y = r'[a-zA-Z\d]|[a-zA-Z\d]?)@\d*[05]\.c(om|a)'
    p = re.compile(x + y)

    match = re.search(p, s)

    if match:
        return match.group(0)
    return ''


if __name__ == '__main__':
    import doctest

    doctest.testmod()
