import { GlobalTimetableID, NewProfileJSON } from "./Constants.js";
import { Spacer } from "./Spacer.js";


export class Serializer extends HTMLDivElement {
    static #controlButtonsStylesheet = `
        flex: 1;
        border: 1px solid grey;    
    `;
    
    #profilesDiv;
    #loadProfileInput;

    constructor() {
        super();
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
                    saveProfileButton.onclick = this.#saveCurrentProfile.bind(this);

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
                newProfileButton.onclick = this.#addProfile.bind(this, NewProfileJSON);
            mainControlPanelDiv.appendChild(newProfileButton);
        this.appendChild(mainControlPanelDiv);
        this.appendChild(new Spacer({ "height": "0.5vw" }));
            this.#profilesDiv = document.createElement('div');
            this.#profilesDiv.style = `
                display: flex; 
                flex-direction: column;
            `;
        this.appendChild(this.#profilesDiv);
    }

    #saveCurrentProfile() {
        if (ProfileSelector.currentProfileNum === null) {
            // TODO: Maybe flash the button red or something
            // Perhaps also make a new profile and save that
        } else {
            this.#profilesDiv.children[ProfileSelector.currentProfileNum].saveProfile();
        }
    }

    #addProfile(profileObj) {
        const newProfileSelector = new ProfileSelector(profileObj, this.#profilesDiv);
        this.#profilesDiv.appendChild(newProfileSelector);
    }

    #loadProfile() {
        const reader = new FileReader();
        reader.onload = (evt) => {
            // TODO: Way more error checking, and separating out program and timetable code
            this.#addProfile(JSON.parse(evt.target.result));
        };

        reader.readAsText(this.#loadProfileInput.files[0]);
    }
}


class ProfileSelector extends HTMLDivElement {
    static currentProfileNum = null;

    nameSpan;
    profileObj;

    #containerElem;

    constructor(profileObj, containerElem) {
        super();
        this.profileObj = Object.assign({}, profileObj); // deep copy the object - it appears that by default, these are shared, which causes major issues.
        this.#containerElem = containerElem;
        this.style = `
            display: flex;
            border: 1px solid grey;
            border-radius: 1em 0 0 1em;
            margin: 1px 0;
        `;
            // A label must be used here since an input nested with a label makes the input selectable even by clicking on the label elements.
            const inputLabel = document.createElement('label');
            inputLabel.style = "display: flex;";
                // This section implements a customizable 'radio button' which looks nicer than the defaults. Inspired by https://moderncss.dev/pure-css-custom-styled-radio-buttons/
                // This is the actual radio input element. It is hidden but is still focusable and checkable.
                const radioInput = document.createElement('input');
                radioInput.type = "radio";
                radioInput.name = "😃" // This name must be constant across all the radio buttons :)
                radioInput.style = `
                    width: 0; 
                    height: 0; 
                    opacity: 0
                `;
                radioInput.oninput = this.#switchProfile.bind(this);
                // This is the div which takes the place of the actual 'radio button' circular element. It's made into a circle by background-radius 50%, and has a default height and width equal to the font size of the elements in this row.
                const actualRadioButtonCircleDiv = document.createElement('div');
                actualRadioButtonCircleDiv.style = `
                    border-radius: 50% 0 0 50%;
                    border-right: 1px solid black;
                    width: 1vw;
                    height: 100%;
                    margin: auto;
                `;
                // This is the span which contains the label text. It needs to be in a span to ensure it comes after the input and div.
                this.nameSpan = document.createElement('span');
                this.nameSpan.innerText = this.profileObj["name"];
                this.nameSpan.contentEditable = "true";
                this.nameSpan.style = `
                    width: 10.75vw; 
                    outline: none;
                `;
            inputLabel.appendChild(radioInput);
            inputLabel.appendChild(actualRadioButtonCircleDiv);
            inputLabel.appendChild(new Spacer({"width": "0.25vw"}));
            inputLabel.appendChild(this.nameSpan);
        this.appendChild(inputLabel);
            // The delete profile button is outside the label to prevent the profile from being switched to when deleted.
            const deleteProfileButton = document.createElement('button');
            deleteProfileButton.innerText = '✖';
            deleteProfileButton.style = `
                background-color: #ff4d4d; 
                width: 1vw
            `;
            deleteProfileButton.onclick = this.#deleteProfile.bind(this);
        this.appendChild(deleteProfileButton);
            // This CSS style node changes actualRadioButtonCircleDiv's backgrond based on whether radioInput is checked or not. The immediate sibling selector (+) is being used for this.
            const styleNode = document.createElement('style');
            styleNode.innerText = `
                input:checked + div {
                    background-color: black;
                }
            `;
        this.appendChild(styleNode);
    }

    #switchProfile() {
        // If there is another profile being switched from, save the old profile's information to the array.
        // Otherwise, skip this and move on to restoring the selected profile's information.
        if (ProfileSelector.currentProfileNum !== null) {
            this.#containerElem.children[ProfileSelector.currentProfileNum].profileObj["name"] = this.#containerElem.children[ProfileSelector.currentProfileNum].nameSpan.innerText;
            this.#containerElem.children[ProfileSelector.currentProfileNum].profileObj["programs"] = {} // TODO change this once programs are done
            this.#containerElem.children[ProfileSelector.currentProfileNum].profileObj["timetable"] = document.getElementById(GlobalTimetableID).getTimetableJSON();
        }

        // Copy this profile's information to the timetable and other places
        // The 0th child of the label is the text it contains, while the 1st child is the radio input
        this.nameSpan.innerText = this.profileObj["name"];
        document.getElementById(GlobalTimetableID).loadTimetableJSON(this.profileObj["timetable"]);
        // TODO: Ask the program manager to load the program based on this
        
        // Update the currently selected profile's number with this guy's index
        ProfileSelector.currentProfileNum = Array.prototype.indexOf.call(this.#containerElem.children, this);
    }

    #deleteProfile() {
        if (ProfileSelector.currentProfileNum === Array.prototype.indexOf.call(this.#containerElem.getElementsByTagName('div'), this)) {
            ProfileSelector.currentProfileNum = null;
        }
        this.#containerElem.removeChild(this);
    }

    saveProfile() {
        // We manually select the curent profile again to trigger #switchProfile() and get the latest versions of the timetable and program in the array
        this.#switchProfile();
        
        // Since the file format is JSON but with a different extension, we will mark it as such for the constructor
        const profileFileName = `${this.profileObj["name"]}.de++`;
        const profile = new File([JSON.stringify(this.profileObj)], profileFileName, { "type": "text/json" });

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


customElements.define('depp-profile-selector', ProfileSelector, {extends: 'div'});
customElements.define('depp-serializer', Serializer, {extends: 'div'});