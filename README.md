# Degree Explorer++
University of Toronto's Degree Explorer, but better. Written completely from scratch to give you control, speed, and flexibility.

![image](https://user-images.githubusercontent.com/25436568/131528137-1be42e64-4c73-463e-9fe5-49d30f5c732f.png)


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

Thank you for your contributions! ❤️

### Development
Degree Explorer++ itself has zero dependencies, so if you just want to work on the website itself, you can simply clone this repository and start up your server of choice. The Python server via `python -m http.server` is one choice, as is Visual Studio Code's [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension. 

If you wish to use the `utils` scripts for scraping data from UofT's Degree Explorer, please install the requirements via `pip install -r utils/requirements.txt` and download the driver for your browser of choice. See the [depp-utils](https://github.com/vedangnaik/depp-utils) repository for more details.

## Deployment
The provided `prod.Dockerfile` can be used to build an image which serves Degree Explorer++ using a Python HTTP server at port 8000. Simply run `docker build . -f prod.Dockerfile` to build the image, and `docker run --rm -p 8000:8000 <image-name>` to serve it as http://localhost:8000.

## Disclaimer
Degree Explorer++ is an **UNOFFICIAL** tool. It is not affiliated with or endorsed by the University of Toronto in any way. @vedangnaik and other contributors are not responsible for any adverse effects such as loss of enrollment spots, etc. caused by decisions taken based on this tool's information.
