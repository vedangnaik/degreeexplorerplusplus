# Degree Explorer++
University of Toronto's Degree Explorer, but better. Written completely from scratch to give you control, speed, and flexibility.

![image](https://user-images.githubusercontent.com/25436568/128601724-c02910d1-e6a3-49ba-955a-4a24a86978d1.png)


## Features
* **Fluid UX**: Instantly add courses, switch profiles, evaluate programs, manipulate semesters, and more with zero buffering.
* **Clean, minimalist UI**: Enjoy a fresh, modal-less UI layout, completely redesigned to improve information density and clarity.
* **Rich Profiles**: Take your schedules with you and manipulate them as you desire - quick downloads in the standardized JSON format allow for easy offline editing and extensibility.
* **Unlocked semesters**: Plan degrees years in advance or roleplay the decades past with completely unlocked start years and full course customizability.
* **Scratchpad**: Easily move courses between multiple profiles with the shared course scratchpad, featuring smooth drag and drop.

## Scope
Degree Explorer++ supports nearly 5000 undergraduate courses and 400 programs from UofT's Faculty of Arts and Sciences, St. George campus. Currently, I (@vedangnaik) do not plan to expand this scope. However, if someone wishes to do this, please don't hesitate to contact me! Possible directions to take would include adding support for graduate courses, courses at Missisauga and Scarborough, courses in other faculties, etc.

## Contributing
Contributions are handled via the forking model. Please make a fork of this repository, then follow the steps below to set up the site locally. To submit your changes, make a pull request back to this repository.

### Build
#### Docker
The provided `Dockerfile` creates a Python image and automatically installs all the necessary requirements to run the `utils` scripts, as well as start up the Python HTTP server for development. Clone this repository, build the image, and start a container with the repo mounted to `/root/Desktop/degreeexplorerplusplus` and serving on http://localhost:8000/.
```
$ git clone https://github.com/vedangnaik/degreeexplorerplusplus.git
$ cd degreeexplorerplusplus
$ docker build .
$ docker run -d -t -p 8000:8000 --mount type=bind,source=<absolute path to degreeexplorerplusplus>,target="/root/Desktop/degreeexplorerplusplus" <image id>
```

#### Normal
Degree Explorer++ itself has zero dependencies, so if you just want to work on the website itself, you can simply clone this repository and start up your server of choice. The Python server via `python -m http.server` is one choice, as is Visual Studio Code's [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension. 

If you wish to use the `utils` scripts for scraping data from UofT's Degree Explorer, please install the requirements via `pip install -r utils/requirements.txt` and download the driver for your browser of choice. See the [depp-utils](https://github.com/vedangnaik/depp-utils) repository for more details.

Thank you for your contributions! ❤️

## Disclaimer
Degree Explorer++ is an **UNOFFICIAL** tool. It is not affiliated with or endorsed by the University of Toronto in any way. @vedangnaik and other contributors are not responsible for any adverse effects such as loss of enrollment spots, etc. caused by decisions taken based on this tool's information.
