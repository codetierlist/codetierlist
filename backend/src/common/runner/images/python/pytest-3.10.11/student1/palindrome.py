def palindrome(s: str):
    # does not filter out spaces
    return s == s[::-1]
