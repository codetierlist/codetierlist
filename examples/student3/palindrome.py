def palindrome(s: str):
    # removes spaces from start and middle but misses space at end
    new_s = ""
    i = 0
    while i < len(s) - 1:
        if s[i] != " ":
            new_s += s[i]
        i += 1

    # add last character
    new_s += s[i]

    return new_s == new_s[::-1]
