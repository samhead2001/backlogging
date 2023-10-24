# pull official base image
FROM python:3.10-slim
 # Allow statements and log messages to immediately appear in the Knative logs
ENV PYTHONUNBUFFERED True
# WORKDIR /usr/src/app

ENV APP_HOME /app
WORKDIR $APP_HOME

# Set the module name
ENV MODULE app

# Service must listen to $PORT environment variable.
ENV PORT 8080
 
COPY src/requirements.txt ./
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

RUN pip install -U Flask
RUN pip install -U flask-cors
# RUN pip install flask-stubs
# RUN pip install flask-cors-stubs
RUN pip install types-flask-cors

# Install Gunicorn
RUN pip install gunicorn

# Bundle app source
COPY __init__.py $APP_HOME/$MODULE/
COPY src $APP_HOME/$MODULE/src

# COPY src/frontend $APP_HOME/$MODULE/src
#COPY tests $APP_HOME/$MODULE/tests
 
# COPY . .
 
# EXPOSE 80
 
# Run the web service on container startup. Here we use the gunicorn
# webserver, with one worker process and 8 threads.
# For environments with multiple CPU cores, increase the number of workers
# to be equal to the cores available.
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 $MODULE.src.app:app