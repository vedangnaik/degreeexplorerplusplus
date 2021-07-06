import { CourseSlotDiv } from "./CourseSlotDiv.js";
import { Spacer } from "./Spacer.js";
import { CourseTile } from "./CourseTile.js";
import { GlobalTimetableID } from "./Timetable.js";
import CourseData from "../resources/CourseData.js";


export class Toolbar extends HTMLDivElement {
    static stylesheet = `
        width: 13vw; 
        display: flex; 
        flex-direction: column;
    `;

    static searchButtonStylesheet = `
        padding: 0.5vw; 
        width: 4.5vw; 
        font-size: 12px; 
        outline: 1px solid grey;
    `;

    constructor() {
        super();
        this.style = Toolbar.stylesheet;

        this.searchInput = document.createElement('input');
        this.searchInput.style = "border: 1px solid black; border-radius: 5px;";

        let div = document.createElement('div');
        div.style = "display: flex"
            // Course slot to hold newly added course. The bottom slot is deleted to prevent confusion
            this.courseSlot = new CourseSlotDiv();
            this.courseSlot.removeChild(this.courseSlot.lowerSlot);
            
            this.searchButton = document.createElement('button');
            this.searchButton.innerText = "Add Courses & PoSTs";
            this.searchButton.onclick = this.searchCourse.bind(this);
            this.searchButton.style = Toolbar.searchButtonStylesheet;
        div.appendChild(this.courseSlot);
        div.appendChild(new Spacer({ "width": "0.5vw" }));
        div.appendChild(this.searchButton);
        
        this.evaluateProfileButton = document.createElement('button');
        this.evaluateProfileButton.innerText = "Evaluate Profile";
        this.evaluateProfileButton.style = "outline: 1px solid grey; padding: 0.15vw";
        this.evaluateProfileButton.onclick = this.evaluateProfile.bind(this);

        this.appendChild(this.searchInput);
        this.appendChild(new Spacer({ "height": "0.5vw" }));
        this.appendChild(div);
        this.appendChild(new Spacer({ "height": "0.5vw" }));
        this.appendChild(this.evaluateProfileButton);
    }

    searchCourse() {
        const id = this.searchInput.value;
        if (CourseData[id]) {
            // Delete any existing tiles in the slot, then add the new child
            this.courseSlot.upperSlot.replaceChildren();
            this.courseSlot.upperSlot.appendChild(new CourseTile(id));
        } else {
            // Flash the slot red for a second to indicate an error
            // TODO: Maybe change this into a smooth fadein/fadeout
            this.courseSlot.style.backgroundColor = "#ff8080";
            setTimeout(() => {
               this.courseSlot.style.backgroundColor = "transparent"; 
            }, 1000);
        }
    }

    evaluateProfile() {
        const scheduledCourses = document.getElementById(GlobalTimetableID).getTimetableJSON()["scheduledCourses"];
        const scheduledPrograms = {};

        for (let courseID in scheduledCourses) {
            document.getElementById(courseID).evaluatePrerequisites(scheduledCourses, scheduledPrograms);
        }
    }
}

customElements.define('depp-toolbar', Toolbar, {extends: 'div'});