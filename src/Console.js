import { CourseSlotDiv } from "./CourseSlotDiv.js";
import { Spacer } from "./Spacer.js";
import { CourseTile } from "./CourseTile.js";
import { GlobalTimetableID } from "./Timetable.js";
import CourseData from "../resources/CourseData.js";


export class Console extends HTMLDivElement {
    static stylesheet = `
        display: flex;
        flex-direction: column;
    `;

    static searchButtonStylesheet = `
        padding: 0.5vw; 
        flex: 1;
        font-size: 12px; 
        outline: 1px solid grey;
    `;

    static evaluateProfileButtonStylesheet = `
        border: 1px solid grey;
        padding: 0.15vw;
        border-radius: 5px;
        background-color: gold;
    `;

    constructor() {
        super();
        this.style = Console.stylesheet;
        // First, the stuff for searching for courses and programs and evaluating profiles
            this.searchInput = document.createElement('input');
            this.searchInput.style = "border: 1px solid black; border-radius: 5px;";
        this.appendChild(this.searchInput);
        this.appendChild(new Spacer({ "height": "0.5vw" }));
            const slotAndSearchDiv = document.createElement('div');
            slotAndSearchDiv.style = "display: flex";
                // Course slot to hold newly added courses. The bottom slot is deleted to prevent confusion.
                this.courseSlot = new CourseSlotDiv();
                this.courseSlot.removeChild(this.courseSlot.lowerSlot);
                // The top slot's dragover and drop handlers are deleted to prevent the box being used as a storage for course tiles and potentially messing up the prerequisite data.
                this.courseSlot.upperSlot.ondragover = () => {};
                this.courseSlot.upperSlot.ondrop  = () => {};
                
                this.searchButton = document.createElement('button');
                this.searchButton.innerText = "Add Courses & PoSTs";
                this.searchButton.onclick = this.searchCourse.bind(this);
                this.searchButton.style = Console.searchButtonStylesheet;
            slotAndSearchDiv.appendChild(this.courseSlot);
            slotAndSearchDiv.appendChild(new Spacer({ "width": "0.5vw" }));
            slotAndSearchDiv.appendChild(this.searchButton);
        this.appendChild(slotAndSearchDiv);
        this.appendChild(new Spacer({ "height": "0.5vw" }));
            this.evaluateProfileButton = document.createElement('button');
            this.evaluateProfileButton.innerText = "EVALUATE PROFILE";
            this.evaluateProfileButton.style = Console.evaluateProfileButtonStylesheet;
            this.evaluateProfileButton.onclick = this.evaluateProfile.bind(this);
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

        for (const courseID in scheduledCourses) {
            document.getElementById(courseID).evaluatePrerequisites(scheduledCourses, scheduledPrograms);
        }
    }
}

customElements.define('depp-console', Console, {extends: 'div'});