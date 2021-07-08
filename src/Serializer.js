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

    constructor() {
        super();
        // Array to hold profile data for ones the user loads in
        this.#loadedProfiles = [];
        this.#currentProfileNumber = 0;
            const mainControlPanelDiv = document.createElement('div');
            mainControlPanelDiv.style = "display: flex";
                const loadAndSaveDiv = document.createElement('div');
                loadAndSaveDiv.style = "display: flex; flex-direction: column; width: 8vw;";
                    this.saveProfileButton = document.createElement('button');
                    this.saveProfileButton.innerHTML = "Save Profile";
                    this.saveProfileButton.style = Serializer.#controlButtonsStylesheet;

                    this.loadProfileButton = document.createElement('button');
                    this.loadProfileButton.innerHTML = "Load Profile";
                    this.loadProfileButton.style = Serializer.#controlButtonsStylesheet
                loadAndSaveDiv.appendChild(this.saveProfileButton);
                loadAndSaveDiv.appendChild(new Spacer({ "height": "0.5vw" }));
                loadAndSaveDiv.appendChild(this.loadProfileButton);
            mainControlPanelDiv.appendChild(loadAndSaveDiv)
            mainControlPanelDiv.appendChild(new Spacer( {"width": "0.5vw"} ));
                const newProfileButton = document.createElement('button');
                newProfileButton.innerText = "New Profile";
                newProfileButton.style = Serializer.#controlButtonsStylesheet;
                newProfileButton.onclick = this.#addNewProfile.bind(this);
            mainControlPanelDiv.appendChild(newProfileButton);
        this.appendChild(mainControlPanelDiv);
        this.appendChild(new Spacer({ "height": "0.5vw" }));
            this.#loadedProfilesDiv = document.createElement('div');
            this.#loadedProfilesDiv.style = "display: flex; flex-direction: column;";
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

    #addNewProfile() {
        const newProfileSelector = new LoadedProfileSelector(
            `New Profile ${this.#loadedProfilesDiv.children.length + 1}`, 
            this.#switchProfile.bind(this)
        );
        // The new selector must apparently be attached to a parent before the event listeners work
        this.#loadedProfilesDiv.appendChild(newProfileSelector);
        // Append the new timetable object to the array
        this.#loadedProfiles.push(NewProfileTimetableJSON);
        // Select the selector to have the timetable switch to it
        newProfileSelector.select();
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
            nameInput.style = "border: 1px solid green";
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