import { Spacer } from "./Spacer.js";

export class Serializer extends HTMLDivElement {
    static loadAndSaveStylesheet = `
        flex: 1;
        outline: 1px solid grey;    
    `;

    constructor() {
        super();
        // Array to hold profile data for ones the user loads in
        this.loadedProfiles = [];
        // Loading and saving stuff goes here
            const loadAndSaveDiv = document.createElement('div');
            loadAndSaveDiv.style = "display: flex";
                this.saveProfileButton = document.createElement('button');
                this.saveProfileButton.innerHTML = "Save Profile";
                this.saveProfileButton.style = Serializer.loadAndSaveStylesheet

                this.loadProfileButton = document.createElement('button');
                this.loadProfileButton.innerHTML = "Load Profile";
                this.loadProfileButton.style = Serializer.loadAndSaveStylesheet
            loadAndSaveDiv.appendChild(this.saveProfileButton)
            loadAndSaveDiv.appendChild(new Spacer( {"width": "0.5vw"} ));
            loadAndSaveDiv.appendChild(this.loadProfileButton)
        this.appendChild(loadAndSaveDiv);
        this.appendChild(new Spacer({ "height": "0.5vw" }));
            const loadedProfilesDiv = document.createElement('div');
                const defaultProfileInput = document.createElement('input');
                defaultProfileInput.type = "radio";
                defaultProfileInput.value = "0";
            loadedProfilesDiv.appendChild(defaultProfileInput);
        this.appendChild(loadedProfilesDiv);
    }
}

customElements.define('depp-serializer', Serializer, {extends: 'div'});