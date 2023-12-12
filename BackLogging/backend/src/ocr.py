import base64
import os
import cv2
import pytesseract
import numpy as np
from difflib import SequenceMatcher

names = [
    "Assassins Creed III",
    "Tactical Espionage Action Metal Gear Solid",
    "The Last of Us",
    "Killzone 2",
    "Uncharted 2 Among Thieves",
    "Bioshock",
    "God of War",
    "Red Dead Redemption",
    "Irritating Stick",
    "Luigi's Mansion",
    "God Hand",
    "Remnant II",
    "P3 Persona 3",
    "Final Fantasy X",
    "Dead Rising",
    "Time Splitters",
    "Grand Theft Auto: Vice City",
    "NBA 2K14",
    "Silent Hill 2",
    "Duke Nukem Forever"
]

def grayscale(image):
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

def noise_removal(image):
    kernel = np.ones((1, 1), np.uint8)
    image = cv2.dilate(image, kernel, iterations=1)
    kernel = np.ones((1, 1), np.uint8)
    image = cv2.erode(image, kernel, iterations=1)
    image = cv2.morphologyEx(image, cv2.MORPH_CLOSE, kernel)
    image = cv2.medianBlur(image, 3)
    return (image)

def threshold(image, low, high):
    image = cv2.threshold(image, low, high, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    return (image)

def remove_borders(image):
    contours, heirarchy = cv2.findContours(image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cntSorted = sorted(contours, key=lambda x:cv2.contourArea(x))
    cnt = cntSorted[-1]
    x, y, w, h = cv2.boundingRect(cnt)
    crop = image[y:y+h, x:x+w]
    return (crop)

def white_expand(image): #Expands Whites
    image = cv2.bitwise_not(image)
    kernel = np.ones((2,2), np.uint8)
    image = cv2.erode(image, kernel, iterations=1)
    image = cv2.bitwise_not(image)
    return (image)

def black_expand(image): #Expands Blacks
    image = cv2.bitwise_not(image)
    kernel = np.ones((2,2), np.uint8)
    image = cv2.dilate(image, kernel, iterations=1)
    image = cv2.bitwise_not(image)
    return (image)

def invert(image):
    return cv2.bitwise_not(image)

def similar(a, b):
    return SequenceMatcher(None, a, b).ratio()

def train():
    totalValue = 0
    numPassed = 0
    for index in range(0, len(names)):
        #Get the image file
        
        imgFile = os.getcwd() + "/OCR/data/" + str(index+1) + ".png"
        print(imgFile)
        img = cv2.imread(imgFile)

        #Preprocessing with hyperparameters in threshold levels
        highest_accuracy = 0
        for high in range(0, 255):
            gray_image = grayscale(img)
            # cv2.imshow('bor', gray_image)
            # cv2.waitKey(0)
            noise_image = noise_removal(gray_image)
            # cv2.imshow('bor', noise_image)
            # cv2.imwrite('noise_image.png', noise_image)
            # cv2.waitKey(0)
            threshold_image = threshold(noise_image, 200, high)
            # cv2.imshow('bor', threshold_image)
            # cv2.imwrite('threshold_image' + str(high) + '.png', threshold_image)
            # cv2.waitKey(0)
            # border_image = remove_borders(threshold_image)
            inverted_image = invert(threshold_image)
            # cv2.imshow('bor', threshold_image)
            # cv2.imshow('inv', inverted_image)
            # cv2.waitKey(0)
            # white_image = white_expand(border_image)
            # black_image = black_expand(border_image)

            #Text Recognition
            normal_text = pytesseract.image_to_string(threshold_image)
            normal_text = normal_text.replace("\n", "")

            inverted_text = pytesseract.image_to_string(inverted_image)
            inverted_text = inverted_text.replace("\n", "")
            # print(image_text)
            normal_accuracy = similar(normal_text.lower(), names[index].lower())
            inverted_accuracy = similar(inverted_text.lower(), names[index].lower())
            if (normal_accuracy > inverted_accuracy):
                print("Normal Wins with " + normal_text)
                accuracy = normal_accuracy
                image_text = normal_text
            else:
                print("Inverted Wins with " + inverted_text)
                accuracy = inverted_accuracy
                image_text = inverted_text
            if (highest_accuracy <= accuracy):
                highest_accuracy = accuracy
                best_high = high
                best_image_text = image_text
        if (best_image_text != ""):
            numPassed = numPassed + 1
            totalValue = totalValue + best_high
        print("OCR found " + names[index] + " to be " + best_image_text + ". " + ", " + str(best_high) + ": " + str(accuracy))
    return totalValue / numPassed

# def opticalCharacterRecognition(image):
#     #Preprocessing with hyperparameters in threshold levels
#     highest_accuracy = 0
#     gray_image = grayscale(image)
#     noise_image = noise_removal(gray_image)
#     threshold_image = threshold(noise_image, 200, 185.05)
#     inverted_image = invert(threshold_image)

#     #Text Recognition
#     normal_text = pytesseract.image_to_string(threshold_image)
#     normal_text = normal_text.replace("\n", "")

#     inverted_text = pytesseract.image_to_string(inverted_image)
#     inverted_text = inverted_text.replace("\n", "")
#     return inverted_text

# # print("The average accuracy we got from this model is " + str(train()))



def opticalCharacterRecognition(image):
    # Preprocessing with hyperparameters in threshold levels
    gray_image = grayscale(image)
    noise_image = noise_removal(gray_image)
    threshold_image = threshold(noise_image, 200, 185.05)
    inverted_image = invert(threshold_image)

    # Text Recognition
    normal_text = pytesseract.image_to_string(threshold_image)
    normal_text = normal_text.replace("\n", "")

    inverted_text = pytesseract.image_to_string(inverted_image)
    inverted_text = inverted_text.replace("\n", "")

    image_with_boxes = image.copy()
    custom_config = r'--oem 3 --psm 6'
    details = pytesseract.image_to_boxes(threshold_image, config=custom_config)

    for detail in details.splitlines():
        b = detail.split()
        x, y, w, h = int(b[1]), int(b[2]), int(b[3]), int(b[4])
        cv2.rectangle(image_with_boxes, (x, image.shape[0] - h), (w, image.shape[0] - y), (0, 255, 0), 1)

    # Convert the processed image to base64
    _, img_encoded = cv2.imencode('.png', image_with_boxes)
    img_base64 = base64.b64encode(img_encoded).decode('utf-8')

    return inverted_text, img_base64
