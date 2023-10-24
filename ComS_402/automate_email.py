import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import csv

def send_email(class_file, course_info_file):
    # Initialize email content
    sender_email = 'ISU.optimal.groups@gmail.com'
    sender_password = 'kobk lzrn ujls sevo'

    # Initialize the email server
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(sender_email, sender_password)

    # Open the CSV file for reading course information
    with open(course_info_file, "r") as csv_file:
        csv_reader = csv.reader(csv_file)
        for i, row in enumerate(csv_reader):
            if i == 1 and len(row) >= 3:
                course = row[0]
                deadline = row[1]

    # Open the class CSV file for sending emails
    with open(class_file, "r") as csv_file:
        csv_reader = csv.reader(csv_file)
        next(csv_reader, None)  # Skip the header row

        for row in csv_reader:
            if len(row) >= 3:
                netid = row[0]
                print(netid)
                code = row[2]
                email = f"{netid}@iastate.edu"
                link = f'http://127.0.0.1:5000/frontend/preferences.html?course={course}&code={code}'

                msg = MIMEMultipart()
                msg['From'] = sender_email
                msg['To'] = email
                subject = course + ': ' + 'Optimal Groups Survey'
                msg['Subject'] = subject

                email_body = f"""   Hello, this is an automated email from the Optimal Groups Survey!
Please click on the link provided and complete the survey:
{link}
The due date is set to: {deadline}. Please complete the survey before then.

This survey will require you to be connected to campus Wi-Fi. If not, you can connect via the ISU VPN by following these instructions:
https://it.engineering.iastate.edu/how-to/install-and-connect-to-vpn-pc/

Thanks for using Optimal-Groups-Survey!
"""
                msg.attach(MIMEText(email_body, 'plain'))
                text = msg.as_string()

                # Send the email
                server.sendmail(sender_email, email, text)

    # Close the email server
    server.quit()
    return False

# Call the send_email function with your CSV file paths
# send_email("/optimalgroups_csv_storage/TEST_001_Classlist.csv", "/optimalgroups_csv_storage/TEST 001_data.csv")
