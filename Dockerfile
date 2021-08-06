FROM python
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && apt-get -y upgrade

# Just in case ;)
RUN apt-get install -y nano

# Upgrade pip
RUN python -m pip install --upgrade pip

# Start python's server to serve the webpage on localhost:8000
EXPOSE 8000
CMD ["python", "-m", "http.server", "-d", "/root/Desktop/degreeexplorerplusplus"]