import { Spacer } from "./Spacer.js";
import { GlobalTimetableID } from "./Timetable.js";
import { NewProfileTimetableJSON } from "./Timetable.js";

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
                newProfileButton.onclick = this.#addNewProfile.bind(this, NewProfileTimetableJSON);
            mainControlPanelDiv.appendChild(newProfileButton);
        this.appendChild(mainControlPanelDiv);
        this.appendChild(new Spacer({ "height": "0.5vw" }));
            this.#loadedProfilesDiv = document.createElement('div');
            this.#loadedProfilesDiv.style = `
                display: flex; 
                flex-direction: column;
            `;
        this.appendChild(this.#loadedProfilesDiv);

        this.#addNewProfile();
    }

    #switchProfile() {
        const inputs = Array.prototype.slice.call(this.#loadedProfilesDiv.getElementsByTagName('div'));
        const selectedProfile = inputs.filter(div => div.getCheckedState())[0];
        const newProfileNumber = inputs.indexOf(selectedProfile);
        
        this.#loadedProfiles[this.#currentProfileNumber] = document.getElementById(GlobalTimetableID).getTimetableJSON();
        document.getElementById(GlobalTimetableID).loadTimetableJSON(this.#loadedProfiles[newProfileNumber]);
        
        this.#currentProfileNumber = newProfileNumber;
    }

    #addNewProfile(profileObj) {
        const newProfileSelector = new LoadedProfileSelector(
            `New Profile ${this.#loadedProfilesDiv.children.length + 1}`, 
            this.#switchProfile.bind(this)
        );
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
            // TODO: Way more error checking
            this.#addNewProfile(JSON.parse(evt.target.result));
        };

        reader.readAsText(this.#loadProfileInput.files[0]);
    }

    #saveProfile() {
        // Get the latest state of the timetable for this particular profile
        this.#loadedProfiles[this.#currentProfileNumber] = document.getElementById(GlobalTimetableID).getTimetableJSON();

        const profile = new File([JSON.stringify(this.#loadedProfiles[this.#currentProfileNumber])], "test 2.de++", {
            "type": "text/json"
        });

        // To save the file, we create a downloadable <a> element and embed the URI of the file into it
        const a = document.createElement('a');
        a.href = URL.createObjectURL(profile);
        // Make it invisble, just so that it doesn't flash or anything
        a.style.display = "none"; 
        a.download = "test 2.de++";

        // We temporarily append it to the body, and then remove it afterwards
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}


class LoadedProfileSelector extends HTMLDivElement {
    #radioInput;

    constructor(profileName, onInputFunc) {
        super();
        this.style = "display: flex;";
            this.#radioInput = document.createElement('input');
            this.#radioInput.type = "radio";
            this.#radioInput.name = "😃" // This name must be constant across all the radio buttons :)
            this.#radioInput.oninput = onInputFunc;
        this.appendChild(this.#radioInput);
            const nameInput = document.createElement('input');
            nameInput.style.border = "1px solid green";
            nameInput.type = "text";
            nameInput.value = profileName;
        this.appendChild(nameInput);
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