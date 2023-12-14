def palindrome(s: str):
    # removes spaces from start and end but not middle
    return s.strip() == s[::-1].strip()
