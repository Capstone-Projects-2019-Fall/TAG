import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

def change_label(label_name, index):
    driver.execute_script("$('#label-selected').attr('value','" + label_name + "');")
    time.sleep(1)
    driver.execute_script("tagModel.renameCategory('" + label_name + "');")
    time.sleep(1)
    driver.execute_script("document.getElementsByClassName('label-name')["+ index + "].innerHTML = '" + label_name + "';")
    time.sleep(1)
    driver.execute_script("renderTextareaHighlights();")

# Leave browser open after demo is executed
chrome_options = Options()
chrome_options.add_experimental_option("detach", True)

driver = webdriver.Chrome("/home/tug3260/TAG/automation/chromedriver", chrome_options=chrome_options)

# Open up TAG Home Page
driver.get("http://127.0.0.1:8000/")
time.sleep(2)

# Click button to open up TAG Annotator
get_started = driver.find_element_by_class_name("button")
get_started.click()
time.sleep(2)

# Add a new label, rename it
add_label = driver.find_element_by_id("add-label")
add_label.click()
change_label('test1','0')
time.sleep(2)

# Add another new label, rename it
add_label.click()
change_label('test2','1')
time.sleep(2)

# Add a document, switch to document
add_doc = driver.find_element_by_id("fileInputControl")
add_doc.send_keys("/home/tug3260/Documents/Lorem_Ipsum.txt")
time.sleep(2)

