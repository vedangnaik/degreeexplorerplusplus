import { GlobalCourseScheduleID, GlobalProgramScheduleID } from "./Constants.js";
import { CourseSlotDiv } from "./CourseSlotDiv.js";
import { Spacer } from "./Spacer.js";
import { CourseTile } from "./CourseTile.js";
import CourseData from "../resources/CourseData.js";
import ProgramData from "../resources/ProgramData.js";

export class ProfileControls extends HTMLDivElement {
    #courseSlot;
    #searchInput;

    constructor() {
        super();
        this.style = `
            display: flex;
            flex-direction: column;
        `;
            this.#searchInput = document.createElement('input');
            this.#searchInput.placeholder = "Search for Course/Program ID";
            this.#searchInput.style = `
                border: 1px solid grey; 
                border-radius: 5px;
            `;
        this.appendChild(this.#searchInput);
        this.appendChild(new Spacer({ "height": "0.5vw" }));
            const slotAndSearchDiv = document.createElement('div');
            slotAndSearchDiv.style.display = "flex";
                // Course slot to hold newly added courses. The bottom slot is deleted to prevent confusion.
                this.#courseSlot = new CourseSlotDiv();
                this.#courseSlot.removeChild(this.#courseSlot.lowerSlot);
                // The top slot's dragover and drop handlers are deleted to prevent the box being used as a storage for course tiles and potentially messing up the prerequisite data.
                this.#courseSlot.upperSlot.ondragover = () => {};
                this.#courseSlot.upperSlot.ondrop  = () => {};
                // We add this nice construcion-pattern looking gradient to emphasize that new courses will appear here ;)
                this.#courseSlot.style.background = "repeating-linear-gradient(135deg, #000000ab 0% 10%, #d7a21996 10% 20%)";
                this.#courseSlot.style.outline = "";
                
                const searchButton = document.createElement('button');
                searchButton.innerText = "Add Courses & PoSTs";
                searchButton.onclick = this.#searchCoursesAndPrograms.bind(this);
                searchButton.style = `
                    padding: 0.5vw; 
                    flex: 1;
                    font-size: 12px; 
                    border: 1px solid grey;
                `;
            slotAndSearchDiv.appendChild(this.#courseSlot);
            slotAndSearchDiv.appendChild(new Spacer({ "width": "0.5vw" }));
            slotAndSearchDiv.appendChild(searchButton);
        this.appendChild(slotAndSearchDiv);
        this.appendChild(new Spacer({ "height": "0.5vw" }));
            const evaluateProfileButton = document.createElement('button');
            evaluateProfileButton.innerText = "EVALUATE PROFILE";
            evaluateProfileButton.style = `
                border: 1px solid grey;
                padding: 0.15vw;
                border-radius: 5px;
                background-color: gold;
            `;
            evaluateProfileButton.onclick = this.#evaluateProfile.bind(this);
        this.appendChild(evaluateProfileButton);
    }

    #searchCoursesAndPrograms() {
        const id = this.#searchInput.value;
        if (id in CourseData) {
            // Delete any existing tiles in the slot, then add the new child
            this.#courseSlot.upperSlot.replaceChildren();
            this.#courseSlot.upperSlot.appendChild(new CourseTile(id));
        } else if (id in ProgramData) {
            document.getElementById(GlobalProgramScheduleID).addProgram(id);
        } else {
            // Flash the slot red for a second to indicate an error
            // TODO: Maybe change this into a smooth fadein/fadeout
            this.#courseSlot.style.backgroundColor = "#ff8080";
            setTimeout(() => {
               this.#courseSlot.style.backgroundColor = "transparent"; 
            }, 1000);
        }
    }

    #evaluateProfile() {
        const scheduledCourses = document.getElementById(GlobalCourseScheduleID).getCourseScheduleJSON()["scheduledCourses"];
        const scheduledPrograms = document.getElementById(GlobalProgramScheduleID).getProgramScheduleJSON();

        for (const courseID in scheduledCourses) {
            document.getElementById(courseID).evaluatePrerequisites(scheduledCourses, scheduledPrograms);
        }

        for (const programID in scheduledPrograms) {
            document.getElementById(programID).evaluateRequirements(scheduledCourses, scheduledPrograms);
        }
    }
}

customElements.define('depp-profile-controls', ProfileControls, {extends: 'div'});