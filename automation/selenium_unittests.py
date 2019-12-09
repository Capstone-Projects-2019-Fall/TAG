import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TagUnitTests(unittest.TestCase):
    # Initial conditions for Unit Tests to be run
    def setUp(self):
        self.driver = webdriver.Chrome("/home/tug3260/TAG/automation/chromedriver")
        self.driver.get("https://tagweb.pythonanywhere.com/tag")

    # Check that all buttons are clickable on the site
    def test_buttons_are_clickable(self):
        wait = WebDriverWait(self.driver, 10)
        self.assertTrue(wait.until(EC.element_to_be_clickable((By.ID, 'add-label'))))
        self.assertTrue(wait.until(EC.element_to_be_clickable((By.ID, 'add-document'))))
        self.assertTrue(wait.until(EC.element_to_be_clickable((By.ID, 'textType'))))
        self.driver.find_element_by_id("textType").click()
        self.assertTrue(wait.until(EC.element_to_be_clickable((By.ID, 'regexFlags'))))
        self.assertTrue(wait.until(EC.element_to_be_clickable((By.ID, 'searchSend'))))
        self.assertTrue(wait.until(EC.element_to_be_clickable((By.ID, 'searchToggle'))))
        self.assertTrue(wait.until(EC.element_to_be_clickable((By.ID, 'downloadBtn'))))
        self.driver.find_element_by_id("downloadBtn").click()
        self.assertTrue(wait.until(EC.element_to_be_clickable((By.ID, 'dlZip'))))
        self.assertTrue(wait.until(EC.element_to_be_clickable((By.ID, 'dlJson'))))
        self.assertTrue(wait.until(EC.element_to_be_clickable((By.ID, 'annotateBtn'))))
        self.driver.find_element_by_id("annotateBtn").click()
        self.assertTrue(wait.until(EC.element_to_be_clickable((By.ID, 'annAll'))))
        self.assertTrue(wait.until(EC.element_to_be_clickable((By.ID, 'annThis'))))
        self.assertTrue(wait.until(EC.element_to_be_clickable((By.ID, 'rightContainer'))))
        

    # Assert that 3 labels can be created
    def test_label_has_been_created(self):
        self.driver.find_element_by_id("add-label").click()
        self.driver.find_element_by_id("add-label").click()
        self.driver.find_element_by_id("add-label").click()
        lists = self.driver.find_elements_by_class_name("label-name")
        no=len(lists)
        self.assertEqual(3, len(lists))   
   

    def tearDown(self):
        self.driver.close()
        

if __name__ == "__main__":
    unittest.main()