import { Spacer } from "./Spacer.js";
import { GlobalTimetableID } from "./Timetable.js";

const LoadedProfileSelectorsGroupName = "test";

export class Serializer extends HTMLDivElement {
    static #loadAndSaveStylesheet = `
        flex: 1;
        outline: 1px solid grey;    
    `;

    #loadedProfiles;
    #currentProfileNumber;

    constructor() {
        super();
        // Array to hold profile data for ones the user loads in
        this.#loadedProfiles = [];
        this.#currentProfileNumber = 0;
            const loadAndSaveDiv = document.createElement('div');
            loadAndSaveDiv.style = "display: flex";
                this.saveProfileButton = document.createElement('button');
                this.saveProfileButton.innerHTML = "Save Profile";
                this.saveProfileButton.style = Serializer.#loadAndSaveStylesheet;

                this.loadProfileButton = document.createElement('button');
                this.loadProfileButton.innerHTML = "Load Profile";
                this.loadProfileButton.style = Serializer.#loadAndSaveStylesheet
            loadAndSaveDiv.appendChild(this.saveProfileButton)
            loadAndSaveDiv.appendChild(new Spacer( {"width": "0.5vw"} ));
            loadAndSaveDiv.appendChild(this.loadProfileButton)
        this.appendChild(loadAndSaveDiv);
        this.appendChild(new Spacer({ "height": "0.5vw" }));
            this.loadedProfilesDiv = document.createElement('div');
            this.loadedProfilesDiv.style = "display: flex; flex-direction: column;";
                const defaultProfileSelector = new LoadedProfileSelector("New Profile 1", this.#switchProfile.bind(this));
                defaultProfileSelector.setCheckedState(true);
            this.loadedProfilesDiv.appendChild(defaultProfileSelector);
        this.appendChild(this.loadedProfilesDiv);

        this.#loadedProfiles.push(document.getElementById(GlobalTimetableID));
    }

    #switchProfile() {
        const inputs = Array.prototype.slice.call(this.loadedProfilesDiv.getElementsByTagName('div'));
        const selectedProfile = inputs.filter(div => div.getCheckedState())[0];
        const newProfileNumber = inputs.indexOf(selectedProfile);
        
        this.#loadedProfiles[this.#currentProfileNumber] = document.getElementById(GlobalTimetableID).getTimetableJSON();
        document.getElementById(GlobalTimetableID).loadTimetableJSON(this.#loadedProfiles[newProfileNumber]);
        
        this.#currentProfileNumber = newProfileNumber;
    }
}


class LoadedProfileSelector extends HTMLDivElement {
    #radioInput;

    constructor(profileName, onInputFunc) {
        super();
        this.style = "display: flex;";
            this.#radioInput = document.createElement('input');
            this.#radioInput.type = "radio";
            this.#radioInput.name = LoadedProfileSelectorsGroupName;
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

    setCheckedState(state) {
        this.#radioInput.checked = state;
    }
}


customElements.define('depp-loaded-profile-selector', LoadedProfileSelector, {extends: 'div'});
customElements.define('depp-serializer', Serializer, {extends: 'div'});