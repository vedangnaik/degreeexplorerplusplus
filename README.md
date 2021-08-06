# Degree Explorer++
University of Toronto's Degree Explorer, but better. Written completely from scratch to give you control, speed, and flexibility.

## Contributing
Contributions are handled via the forking model. Please make a fork of this repository, then follow the steps below to set up the site locally. To submit your changes, make a pull request back to this repository.

There are two options to build this site.

### 1. Docker
The provided `Dockerfile` creates a Python image and automatically installs all the necessary requirements to run the `utils` scripts, as well as start up the Python HTTP server for development. Clone this repository, build the image, and start a container with the repo mounted to `/root/Desktop/degreeexplorerplusplus` and serving on http://localhost:8000/.
```
$ git clone https://github.com/vedangnaik/degreeexplorerplusplus.git
$ cd degreeexplorerplusplus
$ docker build .
$ docker run -d -t -p 8000:8000 --mount type=bind,source=<absolute path to degreeexplorerplusplus>,target="/root/Desktop/degreeexplorerplusplus" <image id>
```

### 2. Normal
Degree Explorer++ itself has zero dependencies, so if you just want to work on the website itself, you can simply clone this repository and start up your server of choice. The Python server via `python -m http.server` is one choice, as is Visual Studio Code's [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension. 

If you wish to use the `utils` scripts for scraping data from UofT's Degree Explorer, please install the requirements via `pip install -r utils/requirements.txt` and download the driver for your browser of choice. See the [depp-utils](https://github.com/vedangnaik/depp-utils) repository for more details.

Thank you for your contributions! ❤️
