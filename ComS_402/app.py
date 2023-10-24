
from flask import Flask, request, redirect, jsonify, Blueprint
from werkzeug.utils import secure_filename
from datetime import datetime
import pandas as pd
import os
import csv
import traceback
import random
import string
import csvParser
import automate_email

parser = csvParser
emailer = automate_email


app = Flask(__name__)
# app.register_blueprint(routes)
app.config['STORAGE_FOLDER'] = 'optimalgroups_csv_storage' 
app.config['NET_ID_IDENTIFIER'] = 'SIS Login ID'

# Generates unique verification codes for the students in the class
def generate_codes(csv_file, listLength, codeLength):
    codes = []
    random_string = ""
    characters = string.ascii_letters + string.digits  # Letters and numbers
    df = pd.DataFrame(csv_file)
    for x in range(listLength):
        random_string = ''.join(random.choice(characters) for _ in range(codeLength))
        while random_string in df.values or random_string == "":
            random_string = ''.join(random.choice(characters) for _ in range(codeLength))
        codes.append(random_string)
    return codes

@app.route('/upload', methods=['GET'])
def go_to_upload():
    return redirect('/ComS_402/frontend/upload.html')

@app.route('/submit-form', methods=['POST'])
def upload_file():

    instructor_csv = request.files['file']
    group_size = request.form.get('groupSize') 
    deadlineDate = request.form.get('deadlineDate') 
    deadlineTime = request.form.get('deadlineTime')
    deadline = deadlineDate + " " + deadlineTime
    course = request.form.get('course') or 'default_course'
    course = course.replace(" ", "_")
    file_path = os.path.join(app.config['STORAGE_FOLDER'], secure_filename(
        course + '_' + instructor_csv.filename))
    temp_csv = pd.read_csv(instructor_csv)
    
    try:
        netid_and_names = temp_csv[[app.config['NET_ID_IDENTIFIER'], 'Student']]
    except KeyError:
        return "Error: Please upload a CSV with " +  "Specified Net Id column named: " + app.config['NET_ID_IDENTIFIER'], 400 

    add_codes_df = pd.DataFrame()
    add_codes_df['SIS Login ID'] = temp_csv[app.config['NET_ID_IDENTIFIER']]
    add_codes_df['Student'] = temp_csv['Student']
    add_codes_df['Verification Code'] = generate_codes(temp_csv, len(temp_csv[app.config['NET_ID_IDENTIFIER']]), 8)
    add_codes_df.to_csv(file_path, index=False)
    
    parser.clean_up(file_path)
    
    course_info_data = [["Course", "Deadline", "Group Size"],
                    [course, deadline, group_size]]
    course_info_data_path = os.path.join(app.config['STORAGE_FOLDER'], course + '_data.csv')
   
    try:
        with open(course_info_data_path, 'w', newline='') as course_info_file:
            writer = csv.writer(course_info_file)
            writer.writerows(course_info_data)
            
            
    except Exception as e:
        return traceback.print_exc(), 500    
    emailer.send_email(file_path,course_info_data_path)
    return redirect('/frontend/success.html')

@app.route('/get-netids', methods=['GET'])
def get_netids():
    # Grab parameters from the URL
    studentCode = request.args.get('code')
    courseName = request.args.get('course') 
    classlist_file_path = app.config['STORAGE_FOLDER'] + '/' + courseName + '_Classlist.csv'
    pref_file_path = os.path.join(app.config['STORAGE_FOLDER'], secure_filename(courseName + '_prefs.csv'))
    courseInfo_file_path = os.path.join(app.config['STORAGE_FOLDER'], secure_filename(courseName + '_data.csv'))

    # Making sure the url link includes both course name and verification code
    if studentCode == "null" or courseName == "null":
        return jsonify("invalid link") # needs a page to display error
    
    # if the course instructor did not upload a classlist csv
    if not os.path.isfile(classlist_file_path):
        return jsonify("This course does not use the Optimal Groups survey") # needs a page to display error

    data = pd.read_csv(classlist_file_path)
    courseData = pd.read_csv(courseInfo_file_path)
    # Check if the student is in the uploaded classlist
    try:
        studentName = data.loc[data['Verification Code'] == studentCode,'Student'].iloc[0]
    except:
        return jsonify("Student is not in this class") # needs a page to display error
    
    if os.path.isfile(pref_file_path) :
        prefs_df = pd.read_csv(pref_file_path, header = None)
        recipient_netid = data.loc[data['Verification Code'] == studentCode, 'SIS Login ID'].iloc[0]

        # Ensures that a student won't retake the survey they already completed
        if recipient_netid in prefs_df[0].values:
            return jsonify("Survey has already been taken") # likely needs a page to display error
    
    currentDate = datetime.now()
    surveyDeadline = datetime.strptime(courseData.get("Deadline").iloc[0], '%Y-%m-%d %H:%M')

    if currentDate > surveyDeadline:
        return jsonify("Deadline has passed")    
    data = data.rename(columns={'SIS Login ID': 'netid', 'Student' : 'names'})
    
    # Removes the row containing the recipient student's name
    removedName = data['names'] == studentName
    data = data[~removedName]
    
    dataDict = {"students": data.to_dict(orient='records')}
    jsonData = jsonify(dataDict)
    return jsonData

@app.route('/submit-survey', methods=['POST'])
def submit():
        data = request.get_json()
        # recipient's survey results
        survey_results = data.get('teammateList')

        course = data.get('course')
        recipient_code = data.get('code')
    
        pref_file_path = os.path.join(app.config['STORAGE_FOLDER'], secure_filename(course + '_prefs.csv'))
        netid_file_path = os.path.join(app.config['STORAGE_FOLDER'], secure_filename(course + '_Classlist.csv'))

        classlist_df = pd.read_csv(netid_file_path)
        recipient_netid = classlist_df.loc[classlist_df['Verification Code'] == recipient_code, 'SIS Login ID'].iloc[0]
        
        # creates/updates the course prefs csv
        if os.path.exists(pref_file_path):
            prefs_df = pd.read_csv(pref_file_path, header=None)
            recipient_netid = classlist_df.loc[classlist_df['Verification Code'] == recipient_code, 'SIS Login ID'].iloc[0]

            # Ensures that a student won't retake the survey they already completed
            if recipient_netid in prefs_df[0].values:
                return "Survey has already been taken" # likely needs a page to display error
        else:
            prefs_df = pd.DataFrame()

        teammates_data = []
        ranking_data =[]

        for teammate in survey_results:
            pref_rank = teammate[-1]
            teammates_data.append(teammate[:-1])

            if pref_rank == '1':
                pref_rank = '4'
            elif pref_rank == '2':
                pref_rank = '3'
            elif pref_rank == '3':
                pref_rank = '2'
            elif pref_rank == '4':
                pref_rank = '1'
            elif pref_rank == '5':
                pref_rank = '-10'
            elif pref_rank == '6':
                pref_rank = '-10'
        
            ranking_data.append(pref_rank)
        # Example prefs csv has no column headers so this one won't either
        # 0 -> Recipient, 1 -> Teammate Chosen, 3 -> Preference Points
        new_survey_data = pd.DataFrame({
            0: [recipient_netid] * len(teammates_data),
            1: teammates_data,
            2: ranking_data
        })
        new_survey_data = new_survey_data.sort_values(2, ascending=False)
        prefs_df = pd.concat([prefs_df, new_survey_data], ignore_index=True)
        prefs_df.to_csv(pref_file_path,index=False, header=False)
        
        return redirect('/frontend/thanks.html')

if __name__ == '__main__':
    app.run(debug=True)
