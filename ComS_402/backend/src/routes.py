from flask import Blueprint, request, redirect, send_from_directory
import os

routes = Blueprint('routes', __name__)

@routes.route('/')
def index():
    return redirect('frontend/upload.html')

@routes.route('/frontend/<path:filename>')
def serve_static(filename):
    return send_from_directory('frontend', filename)

