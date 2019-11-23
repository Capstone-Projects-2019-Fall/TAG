import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait # available since 2.4.0
from selenium.webdriver.support import expected_conditions as EC # available since 2.26.0
from selenium.webdriver.common.keys import Keys
from selenium.webdriver import ActionChains

def navigate_homepage():
    driver.find_element_by_xpath('//a[@href="#one"]').click()
    time.sleep(2)
    driver.find_element_by_xpath('//a[@href="#two"]').click()
    time.sleep(2)
    driver.find_element_by_xpath('//a[@href="#three"]').click()
    time.sleep(2)
    driver.find_element_by_xpath('//a[@href="#intro"]').click()
    time.sleep(2)

def change_label(label_name, index):
    driver.find_element_by_id("add-label").click()
    time.sleep(2)
    driver.execute_script("$('#label-selected').attr('value','" + label_name + "');")
    time.sleep(1)
    #driver.execute_script("tagModel.renameCategory('" + label_name + "');")
    time.sleep(1)
    driver.execute_script("document.getElementsByClassName('label-name')[" + index + "].innerHTML = '" + label_name + "';")
    time.sleep(1)

def search_to_add_or_delete_label(label_name, search_text):
    driver.find_element_by_xpath("//div[@value='" + label_name + "']").click()
    time.sleep(2)
    driver.find_element_by_id("searchEntry").send_keys(search_text)
    time.sleep(2)
    driver.find_element_by_id("searchSend").click()
    time.sleep(2)

# Leave browser open after demo is executed
chrome_options = Options()
chrome_options.add_experimental_option("detach", True)

driver = webdriver.Chrome("/home/tug3260/TAG/automation/chromedriver", chrome_options=chrome_options)
driver.maximize_window()

# Open up TAG Home Page
driver.get("http://127.0.0.1:8000/")
time.sleep(2)

# Navigate homepage, Click button to open up TAG Annotator
navigate_homepage()
get_started = driver.find_element_by_class_name("button")
get_started.click()
time.sleep(2)

# ML HIGHLIGHT AUTOMATION
driver.find_element_by_id("add-document").click()
new_doc_added = WebDriverWait(driver,20).until(EC.presence_of_element_located((By.ID, "doc-selected")))
time.sleep(2)
driver.find_element_by_id("annotateBtn").click()
time.sleep(10)
driver.find_element_by_id("downloadBtn").click()
time.sleep(2)
driver.find_element_by_id("dlZip").click()
time.sleep(10)
driver.refresh()
time.sleep(5)

# MANUAL HIGHLIGHT AUTOMATION
# Add a test document
driver.find_element_by_id("add-document").click()
new_doc_added = WebDriverWait(driver,20).until(EC.presence_of_element_located((By.ID, "doc-selected")))
time.sleep(2)

# Add new labels, edit their names
change_label('Location','0')
change_label('People', '1')
change_label('Occupation', '2')

# Select Location highlight, search for New York in the article
search_to_add_or_delete_label("Location", "New York")

# Select People highlight, search for Bloomberg in the article
search_to_add_or_delete_label("People", "Bloomberg")

# Select Occupation highlight, search for democrats using case insensitive regular expression
driver.find_element_by_id("textType").click()
time.sleep(1)
driver.find_element_by_id("regexFlags").click()
time.sleep(2)
driver.find_element_by_xpath("//form[@id='flags']/label[1]").click()
search_to_add_or_delete_label("Occupation", "democrats")

# Oops! Democrats isn't an occupation, delete that annotation
driver.find_element_by_id("searchToggle").click()
search_to_add_or_delete_label("Occupation", "democrats")

# Since we have no Occupations labeled, let's delete that annotation
actions = ActionChains(driver)
actions.context_click(driver.find_element_by_xpath("//div[@value='Occupation']")).perform()
delete_label = WebDriverWait(driver,20).until(EC.presence_of_element_located((By.CLASS_NAME, "delete-label")))
driver.find_element_by_class_name("delete-label").click()

# The first Bloomberg doesn't have his first name, let's delete that annotation as well
driver.find_element_by_id("anno-list").click()
