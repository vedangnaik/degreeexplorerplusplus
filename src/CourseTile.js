import { INCOMPLETE_COLOR, GLOBAL_COURSE_INFO_PANEL_ID, COMPLETE_COLOR, UNVERIFIABLE_COLOR, DELETE_SYMBOL, DELETE_COLOR, STATUSES, NOT_EVALUATED_COLOR } from "./Constants.js";
const { default: CourseData } = await import("../resources/CourseData.js");
import { evaluateCoursePrerequisite } from "./Evaluators.js";

export class CourseTile extends HTMLDivElement {
    #evaluatedPrerequisites = {};

    constructor(courseID) {
        super();
        this.id = courseID;
        this.customTagName = "course-tile" // Used to quickly identify this div subclass among other divs
        this.style = `
            width: 8vw;
            background-color: ${NOT_EVALUATED_COLOR};
            z-index: 1;
            display: flex;
        `;
            const courseName = document.createElement('h3');
            courseName.innerText = courseID;
            courseName.style = `
                width: 7vw;
                margin: auto;
                text-align: center;
            `;
            courseName.onclick = this.#displayPrerequisitesOnPanel.bind(this); // This needs to be bound here becuase otherwise clicking the delete button to remove the course also displays the course info lol
        this.appendChild(courseName);
            const deleteCourseButton = document.createElement('button');
            deleteCourseButton.innerText = DELETE_SYMBOL;
            deleteCourseButton.style = `
                width: 1vw;
                background-color: ${DELETE_COLOR};
            `;
            deleteCourseButton.onclick = this.deleteCourse.bind(this);
        this.appendChild(deleteCourseButton);

        // change the length if required
        this.courseLength = courseID[6];
        switch(this.courseLength) {
            case 'Y':
                this.style.height = "4vw";
                break;
            case 'H':
                this.style.height = "2vw";
                break;            
            default:
                this.style.height = "2vw";
                console.log(`Unsupported course length ${this.courseLength} for id ${this.id}. Defaulting to H`);
        }

        // Set the draggable event handlers
        this.draggable = true;
        this.ondragstart = this.#onDragStart.bind(this);
    }

    #displayPrerequisitesOnPanel() {
        document.getElementById(GLOBAL_COURSE_INFO_PANEL_ID).printPrereqisiteInfo(this.id, this.#evaluatedPrerequisites);
    }

    #onDragStart(ev) {
        ev.dataTransfer.effectAllowed = "move";
        ev.dataTransfer.setData("id", this.id);
        // The starting coordinates of the mouse pointer when the drag was started, relative to the top left of the tile. Used by the scrathpad to properly position dragged tiles.
        ev.dataTransfer.setData("dragstartx", ev.offsetX);
        ev.dataTransfer.setData("dragstarty", ev.offsetY);
    }

    deleteCourse() {
        // This appears to work but idk if it's legit or not
        this.parentElement.removeChild(this);
    }

    resetCourse() {
        this.#evaluatedPrerequisites = {};
        this.style.backgroundColor = NOT_EVALUATED_COLOR;
    }

    evaluatePrerequisites(scheduledCourses, scheduledPrograms) {
        Object.keys(CourseData[this.id]["prerequisites"]).forEach(prereqID => {
            if (!(prereqID in this.#evaluatedPrerequisites)) {
                this.#evaluatedPrerequisites = {...this.#evaluatedPrerequisites, ...evaluateCoursePrerequisite(this.id, prereqID, scheduledCourses, scheduledPrograms)};
            }
        });

        // Flags used to decide the header's color. If any failure is detected, it's red. If there are no failures but some warnings/unimplemented prereqs, it's yellow. Otherwise, it's green.
        let incomplete = false;
        let warning = false;

        for (const prereqID in this.#evaluatedPrerequisites) {
            switch(this.#evaluatedPrerequisites[prereqID]) {
                case STATUSES.INCOMPLETE:
                    incomplete = true;
                    break;
                case STATUSES.UNVERIFIABLE:
                case STATUSES.UNIMPLEMENTED:
                    warning = true;
            }
        }

        if (incomplete) {
            this.style.backgroundColor = INCOMPLETE_COLOR;
        } else if (warning) {
            this.style.backgroundColor = UNVERIFIABLE_COLOR;
        } else {
            this.style.backgroundColor = COMPLETE_COLOR;
        }
    }
}


customElements.define('depp-course-tile', CourseTile, {extends: 'div'});
