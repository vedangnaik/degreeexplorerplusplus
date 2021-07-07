import { Spacer } from "./Spacer.js";
import { GlobalTimetableID } from "./Timetable.js";

const LoadedProfileSelectorsGroupName = "test";

export class Serializer extends HTMLDivElement {
    static loadAndSaveStylesheet = `
        flex: 1;
        outline: 1px solid grey;    
    `;

    constructor() {
        super();
        // Array to hold profile data for ones the user loads in
        this.loadedProfiles = [];
        this.currentProfileNumber = 0;
            const loadAndSaveDiv = document.createElement('div');
            loadAndSaveDiv.style = "display: flex";
                this.saveProfileButton = document.createElement('button');
                this.saveProfileButton.innerHTML = "Save Profile";
                this.saveProfileButton.style = Serializer.loadAndSaveStylesheet;

                this.loadProfileButton = document.createElement('button');
                this.loadProfileButton.innerHTML = "Load Profile";
                this.loadProfileButton.style = Serializer.loadAndSaveStylesheet
            loadAndSaveDiv.appendChild(this.saveProfileButton)
            loadAndSaveDiv.appendChild(new Spacer( {"width": "0.5vw"} ));
            loadAndSaveDiv.appendChild(this.loadProfileButton)
        this.appendChild(loadAndSaveDiv);
        this.appendChild(new Spacer({ "height": "0.5vw" }));
            this.loadedProfilesDiv = document.createElement('div');
            this.loadedProfilesDiv.style = "display: flex; flex-direction: column;";
                for (let i = 0; i < 5; i++) {
                    this.loadedProfilesDiv.appendChild(
                        new LoadedProfileSelector("Profile " + i, this.switchProfile.bind(this))
                    );
                }
        this.appendChild(this.loadedProfilesDiv);

        this.loadedProfiles.push(document.getElementById(GlobalTimetableID));
    }

    switchProfile() {
        const inputs = Array.prototype.slice.call(this.loadedProfilesDiv.getElementsByTagName('div'));
        const selectedProfile = inputs.filter(div => div.getSelected())[0];
        const newProfileNumber = inputs.indexOf(selectedProfile);
        
        console.log(`current value ${this.currentProfileNumber}. new value ${newProfileNumber}`);
        
        this.currentProfileNumber = newProfileNumber;
    }
}


class LoadedProfileSelector extends HTMLDivElement {
    constructor(profileName, onInputFunc) {
        super();
        this.style = "display: flex;";
            this.radioInput = document.createElement('input');
            this.radioInput.type = "radio";
            this.radioInput.name = LoadedProfileSelectorsGroupName;
            this.radioInput.oninput = onInputFunc;
        this.appendChild(this.radioInput);
            const nameInput = document.createElement('input');
            nameInput.style = "border: 1px solid green";
            nameInput.type = "text";
            nameInput.value = profileName;
        this.appendChild(nameInput);
    }

    getSelected () {
        return this.radioInput.checked;
    }
}


customElements.define('depp-loaded-profile-selector', LoadedProfileSelector, {extends: 'div'});
customElements.define('depp-serializer', Serializer, {extends: 'div'});