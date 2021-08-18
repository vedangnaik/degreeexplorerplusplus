import { CourseSlotDiv } from "./CourseSlotDiv.js";
import { Spacer } from "./Spacer.js";
import { CourseTile } from "./CourseTile.js";
import { GLOBAL_COURSE_INFO_PANEL_ID, GLOBAL_COURSE_SCHEDULE_ID, GLOBAL_PROGRAM_SCHEDULE_ID } from "../Constants.js";
import { CourseData, ProgramData } from "../../resources/exports.js";



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
            this.#searchInput.placeholder = "CSC404H1, ASSPE1689, etc.";
            this.#searchInput.style = `
                border: 1px solid grey;
                border-radius: 5px;
                font-size: 1.25em;
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
                searchButton.innerText = "Add Course or PoST";
                searchButton.onclick = this.#searchCoursesAndPrograms.bind(this);
                searchButton.style = `
                    padding: 0.5vw; 
                    flex: 1;
                    border: 1px solid grey;
                    background-color: silver;
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
                padding: 0.25vw 0.15vw;
                border-radius: 5px;
                background-color: gold;
                font-size: 1.5em;
            `;
            evaluateProfileButton.onclick = this.#evaluateProfile.bind(this);
        this.appendChild(evaluateProfileButton);
    }

    #searchCoursesAndPrograms() {
        const id = this.#searchInput.value;

        if (document.getElementById(id) !== null) {
            // Ensure this hasn't already been added.
            // TODO: Passing in any string which is a valid id will trigger this. Perhaps this should be changed?
            this.#flashCourseSlot();
        } else if (id in CourseData) {
            // Check the courses. Delete any existing tiles in the slot if it exists, then add the new child.
            this.#courseSlot.upperSlot.replaceChildren();
            this.#courseSlot.upperSlot.appendChild(new CourseTile(id));
        } else if (id in ProgramData) {
            // Check the programs and add if exists.
            document.getElementById(GLOBAL_PROGRAM_SCHEDULE_ID).addProgram(id);
        } else {
            this.#flashCourseSlot();
        }
    }

    /**
     * Flashes the course slot to indicate an error.
     * TODO: Maybe change this into a smooth fadein/fadeout
     */
    #flashCourseSlot() {
        this.#courseSlot.style.backgroundColor = "#ff8080";
        setTimeout(() => {
           this.#courseSlot.style.backgroundColor = "revert"; 
        }, 1000);
    }

    #evaluateProfile() {
        // Grab the user's courses and programs from here.
        const scheduledCourses = document.getElementById(GLOBAL_COURSE_SCHEDULE_ID).getCourseScheduleJSON()["scheduledCourses"];
        const scheduledPrograms = document.getElementById(GLOBAL_PROGRAM_SCHEDULE_ID).getProgramScheduleJSON();

        // Reset the course info panel so it doesn't look like nothing happened.
        document.getElementById(GLOBAL_COURSE_INFO_PANEL_ID).setContentsVisibility(false);

        for (const courseID in scheduledCourses) {
            document.getElementById(courseID).evaluatePrerequisites(scheduledCourses, scheduledPrograms);
        }

        // Program requirements don't need to know about the other programs you're taking.
        for (const programID of scheduledPrograms) {
            document.getElementById(programID).evaluateRequirements(Object.keys(scheduledCourses));
        }
    }
}

customElements.define('depp-profile-controls', ProfileControls, {extends: 'div'});