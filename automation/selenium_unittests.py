import unittest
from selenium import webdriver

class TagUnitTests(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Chrome("/home/tug3260/TAG/automation/chromedriver")
        driver = self.driver
        driver.get("https://tagweb.pythonanywhere.com")
        self.assertIn("TAG - Text-Annotated GUI", driver.title)
        driver.find_element_by_class_name("button").click()
        # Currently no title set for this page
        self.assertIn("", driver.title)

    def label_has_been_created(self):
        driver.find_element_by_id("add-label").click()
        

    def tearDown(self):
        self.driver.close()
        

if __name__ == "__main__":
    unittest.main()