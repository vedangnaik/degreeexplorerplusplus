import { Spacer } from "./Spacer.js";
import { GlobalTimetableID } from "./Timetable.js";

// This is a generic empty profile file structure created here to back up new profiles. It is not connected to the actual classes like timetable in any way. This is to keep everything as separated as possible
export const NewProfileJSON = {
    "name": "New Profile", // The name of the profile, displayed in the left bar. This does not need to be unique, it's just an identifier
    "programs": {}, // TODO: Create the empty program structure based on how that turns out
    "timetable": { // For now, the empty timetable structure that has evolved
        "anchorSemester": "Fall/Winter",
        "anchorYear": new Date().getFullYear(),
        "numSemesters": 4,
        "scheduledCourses": {}
    }
}

export class Serializer extends HTMLDivElement {
    static #controlButtonsStylesheet = `
        flex: 1;
        outline: 1px solid grey;    
    `;

    #loadedProfiles;
    #loadedProfilesDiv;
    #currentProfileNumber;
    #loadProfileInput;

    constructor() {
        super();
        // Array to hold profile data for ones the user loads in
        this.#loadedProfiles = [];
        this.#currentProfileNumber = 0;
            const mainControlPanelDiv = document.createElement('div');
            mainControlPanelDiv.style.display = "flex";
                const loadAndSaveDiv = document.createElement('div');
                loadAndSaveDiv.style = `
                    display: flex; 
                    flex-direction: 
                    column; width: 8vw;
                `;
                    const saveProfileButton = document.createElement('button');
                    saveProfileButton.innerHTML = "Save Profile";
                    saveProfileButton.style = Serializer.#controlButtonsStylesheet;
                    saveProfileButton.onclick = this.#saveProfile.bind(this);

                    // This is a input of type file which is used for selecting the profile. It is hidden since it cannot be styled easily. Instead, another button forwards any clicks it receives to this input, which handles the file stuff behind the scenes. Partially inspired by https://stackoverflow.com/a/36248168. A similar thing can also been found on the MDN docs somewhere
                    this.#loadProfileInput = document.createElement('input');
                    this.#loadProfileInput.type = "file";
                    this.#loadProfileInput.accept = ".de++";
                    this.#loadProfileInput.style.display = "none";
                    this.#loadProfileInput.onchange = this.#loadProfile.bind(this);

                    const loadProfileButton = document.createElement('button');
                    loadProfileButton.innerHTML = "Load Profile";
                    loadProfileButton.style = Serializer.#controlButtonsStylesheet
                    loadProfileButton.onclick = () => { this.#loadProfileInput.click(); }
                loadAndSaveDiv.appendChild(saveProfileButton);
                loadAndSaveDiv.appendChild(new Spacer({ "height": "0.5vw" }));
                loadAndSaveDiv.appendChild(loadProfileButton);
                loadAndSaveDiv.appendChild(this.#loadProfileInput);
            mainControlPanelDiv.appendChild(loadAndSaveDiv)
            mainControlPanelDiv.appendChild(new Spacer( {"width": "0.5vw"} ));
                const newProfileButton = document.createElement('button');
                newProfileButton.innerText = "New Profile";
                newProfileButton.style = Serializer.#controlButtonsStylesheet;
                newProfileButton.onclick = this.#addNewProfile.bind(this, NewProfileJSON);
            mainControlPanelDiv.appendChild(newProfileButton);
        this.appendChild(mainControlPanelDiv);
        this.appendChild(new Spacer({ "height": "0.5vw" }));
            this.#loadedProfilesDiv = document.createElement('div');
            this.#loadedProfilesDiv.style = `
                display: flex; 
                flex-direction: column;
            `;
        this.appendChild(this.#loadedProfilesDiv);

        this.#addNewProfile(NewProfileJSON);
    }

    #switchProfile() {
        const inputs = Array.prototype.slice.call(this.#loadedProfilesDiv.getElementsByTagName('div'));
        const selectedProfile = inputs.filter(div => div.getCheckedState())[0];
        const newProfileNumber = inputs.indexOf(selectedProfile);
        
        // save the old profile's information to the array
        this.#loadedProfiles[this.#currentProfileNumber]["timetable"] = {
            "name": this.#loadedProfilesDiv.children[this.#currentProfileNumber].nameInput.value,
            "programs": {}, // TODO: Get this from the program manager
            "timetable": document.getElementById(GlobalTimetableID).getTimetableJSON()
        }

        // copy the new profile's information to the relevant places
        this.#loadedProfilesDiv.children[newProfileNumber].nameInput.value = this.#loadedProfiles[newProfileNumber]["name"]
        document.getElementById(GlobalTimetableID).loadTimetableJSON(this.#loadedProfiles[newProfileNumber]["timetable"]);
        // TODO: Ask the program manager to load the program based on this.#loadedProfiles[newProfileNumber]["programs"] (or whatever)
        
        this.#currentProfileNumber = newProfileNumber;
    }

    #addNewProfile(profileObj) {
        const newProfileSelector = new LoadedProfileSelector(profileObj["name"], this.#switchProfile.bind(this));
        // The new selector must apparently be attached to a parent before the event listeners work
        this.#loadedProfilesDiv.appendChild(newProfileSelector);
        // Append the new timetable object to the array
        this.#loadedProfiles.push(profileObj);
        // Select the selector to have the timetable switch to it
        newProfileSelector.select();
    }

    #loadProfile() {
        const reader = new FileReader();
        reader.onload = (evt) => {
            // TODO: Way more error checking, and separating out program and timetable code
            this.#addNewProfile(JSON.parse(evt.target.result));
        };

        reader.readAsText(this.#loadProfileInput.files[0]);
    }

    #saveProfile() {
        // We manually select the curent profile again to trigger #switchProfile() and get the latest versions of the timetable and program in the array
        // this.#switchProfile();
        
        // Since the file format is JSON but with a different extension, we will mark it as such for the constructor
        const profileFileName = `${this.#loadedProfiles[this.#currentProfileNumber]["name"]}.de++`;
        const profile = new File([JSON.stringify(this.#loadedProfiles[this.#currentProfileNumber])], profileFileName, { "type": "text/json" });

        // To save the file, we create a downloadable <a> element and embed the URI of the file into it, the append and click it. This will open a dialog box for the user
        const a = document.createElement('a');
        a.href = URL.createObjectURL(profile);
        // Make it invisble, just so that it doesn't get rendered and flash
        a.style.display = "none"; 
        a.download = profileFileName;

        // Temporarily append it to the body, and then remove it afterwards
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}


class LoadedProfileSelector extends HTMLDivElement {
    #radioInput;

    nameInput;

    constructor(profileName, onInputFunc) {
        super();
        this.style = "display: flex;";
            this.#radioInput = document.createElement('input');
            this.#radioInput.type = "radio";
            this.#radioInput.name = "😃" // This name must be constant across all the radio buttons :)
            this.#radioInput.oninput = onInputFunc;
        this.appendChild(this.#radioInput);
            this.nameInput = document.createElement('input');
            this.nameInput.style.border = "1px solid green";
            this.nameInput.type = "text";
            this.nameInput.value = profileName;
        this.appendChild(this.nameInput);
    }

    getCheckedState () {
        return this.#radioInput.checked;
    }

    select() {
        this.#radioInput.click();
    }
}


customElements.define('depp-loaded-profile-selector', LoadedProfileSelector, {extends: 'div'});
customElements.define('depp-serializer', Serializer, {extends: 'div'});