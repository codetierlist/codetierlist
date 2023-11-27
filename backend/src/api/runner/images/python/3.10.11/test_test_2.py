import unittest

# This is the class we want to test. So, we need to import it
from test_code import Person


class Test(unittest.TestCase):
    """
    The basic class that inherits unittest.TestCase
    """

    person1 = Person()  # instantiate the Person Class
    person2 = Person()

    def test_0_set_name(self):
        id = self.person1.set_name("Daksh")
        name = self.person1.get_name(id)
        self.assertEqual(name, "Daksh")

    def test_1_get_name(self):
        self.person2.set_name("Daksh")  # id = 0
        name = self.person2.get_name(2)
        self.assertEqual(name, 'There is no such user')


if __name__ == '__main__':
    unittest.main()
