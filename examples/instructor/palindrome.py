def palindrome(s: str):
    return s.replace(" ", "") == s[::-1].replace(" ", "")
