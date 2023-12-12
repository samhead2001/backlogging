import cv2
from flask import Flask, jsonify, request
import numpy as np
from app.src import ocr
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for your Flask app

@app.route("/")
def home():
    return "Hello World!"

@app.route('/ocr', methods=['POST'])
def index():
    try:
        image_data = request.files['image']
        image_bytes = image_data.read()
        nparr = np.frombuffer(image_bytes, np.uint8)  # Use frombuffer instead of fromstring
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        result, image = ocr.opticalCharacterRecognition(img)
        return jsonify({"result": result, "image": image})
    except Exception as e:
        return jsonify({"error": str(e)})



# @app.route('/ocr', methods=['POST'])
# def index():
#     try:
#         image_data = request.files['image']
#         image_bytes = image_data.read()
#         nparr = np.frombuffer(image_bytes, np.uint8)  # Use frombuffer instead of fromstring
#         img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

#         # Call the two functions to get text and image separately
#         result_text= ocr.opticalCharacterRecognition(img)
#         print(result_text)
#         result_image= ocr.imageBase64(img)
#         print(result_image)

#         return jsonify({"result_text": result_text, "result_image": result_image})
#     except Exception as e:
#         return jsonify({"error": str(e)})


# @app.route('/ocr', methods=['POST'])
# def index():
#     try:
#         image_data = request.files['image']
#         if image_data:
#             image_bytes = image_data.read()
#             nparr = np.frombuffer(image_bytes, np.uint8)
#             img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

#             # Call the two functions to get text and image separately
#             result_text = ocr.opticalCharacterRecognition(img)
#             result_image = ocr.imageBase64function(img)

#             return jsonify({"result_text": result_text, "result_image": result_image})
#         else:
#             return jsonify({"error": "No image provided"})
#     except Exception as e:
#         return jsonify({"error": str(e)})

if __name__ == 'main':
    app.run(host='0.0.0.0', port=5001)