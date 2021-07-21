import { INCOMPLETE_COLOR, GLOBAL_COURSE_INFO_PANEL_ID, COMPLETE_COLOR, WARNING_COLOR, STATUSES } from "./Constants.js";
import CourseData from "../resources/CourseData.js";
import { Spacer } from "./Spacer.js";


export class CourseInfoPanel extends HTMLDivElement {
    #courseInfoDiv;
    #placeholderP;

    #courseTitleH2;
    #courseDescriptionH3;

    #prerequisitesDiv;
    #corequisitesDiv;
    #exclusionsDiv;

    constructor() {
        super();
        this.id = GLOBAL_COURSE_INFO_PANEL_ID
        // The last three are required for the panel to expand and fit the height of the timetable.
        this.style = `
            background-color: lightgrey;
            border: 1px solid grey;
            width: 26vw;
            display: flex;
            overflow-y: scroll;
            padding: 1vw;
        `;

        // This div contains the actual panel.
        this.#courseInfoDiv = document.createElement('div');
        this.#courseInfoDiv.style = `
            width: 100%;
            display; none;
        `;
            this.#courseTitleH2 = document.createElement('h2');
            this.#courseTitleH2.style.textAlign = "center";
            this.#courseTitleH2.innerText = "Course ID";
        this.#courseInfoDiv.appendChild(this.#courseTitleH2);
            this.#courseDescriptionH3 = document.createElement('h3');
            this.#courseDescriptionH3.style.textAlign = "center";
            this.#courseDescriptionH3.innerText = "Course Description";
        this.#courseInfoDiv.appendChild(this.#courseDescriptionH3);
        this.#courseInfoDiv.appendChild(new Spacer({"height": "0.5vw"}));
            this.#prerequisitesDiv = new RequisiteDiv("PREREQUISITES");
        this.#courseInfoDiv.appendChild(this.#prerequisitesDiv);
        // this.#courseInfoDiv.appendChild(new Spacer({"height": "0.25vw"}));
            this.#corequisitesDiv = new RequisiteDiv("COREQUISITES");
        this.#courseInfoDiv.appendChild(this.#corequisitesDiv);
        // this.#courseInfoDiv.appendChild(new Spacer({"height": "0.25vw"}));
            this.#exclusionsDiv = new RequisiteDiv("EXCLUSIONS");
        this.#courseInfoDiv.appendChild(this.#exclusionsDiv);
        
        // This paragraph contains the placeholder text that appears when no course has been selected
        this.#placeholderP = document.createElement('p');
        this.#placeholderP.innerText = "Click a course to see stuff here";
        this.#placeholderP.style.margin = "auto";
        
        this.appendChild(this.#courseInfoDiv);
        this.appendChild(this.#placeholderP);
    }

    printPrereqisiteInfo(courseID, prerequisitesTracker) {
        this.#courseInfoDiv.style.display = "revert";
        this.#placeholderP.style.display = "none";

        this.#courseTitleH2.innerText = courseID;
        this.#courseDescriptionH3.innerText = CourseData[courseID].title;
        this.#prerequisitesDiv.bodyDiv.replaceChildren();

        // This loop actually goes over prerequisite defined for the course, and then applies the color based on whether that prerequisite was evaluated in the passed-in argument. This is to allow courses which have not been evaluated yet to still show their prerequisite info.
        for (let prereqID in CourseData[courseID].prerequisites) {
            const p = document.createElement('p');
            p.innerText = `${prereqID}: ${CourseData[courseID].prerequisites[prereqID].description}`;
            switch (prerequisitesTracker[prereqID]) {
                case STATUSES.COMPLETE:
                    p.style.color = COMPLETE_COLOR;
                    break;
                case STATUSES.INCOMPLETE:
                    p.style.color = INCOMPLETE_COLOR;
                    break;
                case STATUSES.WARNING:
                    p.style.color = WARNING_COLOR;
                    break;
                case STATUSES.NA:
                default:
                    p.style.color = "revert";
            }
            this.#prerequisitesDiv.bodyDiv.appendChild(p);
        }
    }

    resetPanel() {
        this.#courseInfoDiv.style.display = "none";
        this.#placeholderP.style.display = "revert";
    }
}

// This is a template div that is cloned thrice, once each for the prerequisites, corequisites, and exclusions. The styles are the same in each case - only the text is different. It also provides cleaner access to the header and body divs for styling.
class RequisiteDiv extends HTMLDivElement {
    constructor(headerText) {
        super();
        this.style = `
            display: flex;
        `
            this.headerDiv = document.createElement('div');
            this.headerDiv.style = `
                display: flex;
                justify-content: center;
                align-content: center;
                flex-direction: column;
                writing-mode: vertical-lr;
                text-align: center;
                border: 1px solid grey;
                padding: 0.5vw;
                font-weight: bold;
            `;
            this.headerDiv.innerText = headerText;
        this.appendChild(this.headerDiv);
        // this.appendChild(new Spacer({"width": "0.25vw"}));
            // This body contains a table to which rows can be added for each requisite item.
            this.bodyDiv = document.createElement('div');
            this.bodyDiv.style = `
                border: 1px solid grey;
                padding: 0.5vw;
                width: 100%;
            `;
        this.appendChild(this.bodyDiv)
    }
}

customElements.define('depp-course-info-panel-requisite-div', RequisiteDiv, {extends: 'div'});
customElements.define('depp-course-info-panel', CourseInfoPanel, {extends: 'div'});