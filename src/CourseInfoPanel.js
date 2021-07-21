import { INCOMPLETE_COLOR, GLOBAL_COURSE_INFO_PANEL_ID, COMPLETE_COLOR, WARNING_COLOR, STATUSES } from "./Constants.js";
import CourseData from "../resources/CourseData.js";
import { Spacer } from "./Spacer.js";


export class CourseInfoPanel extends HTMLDivElement {
    #courseTitleHeader;
    #courseDescriptionP;
    #prerequisiteCell;
    #courseInfoDiv;
    #placeholderP;

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
        `;

        // This div contains the actual panel.
        this.#courseInfoDiv = document.createElement('div');
        this.#courseInfoDiv.style.width = "100%";
            this.#courseTitleHeader = document.createElement('h3');
            this.#courseTitleHeader.style.textAlign = "center";
            this.#courseTitleHeader.innerText = "Course ID";

            this.#courseDescriptionP = document.createElement('h4');
            this.#courseDescriptionP.style.textAlign = "center";
            this.#courseDescriptionP.innerText = "Course Description";

            let courseInfoTable = document.createElement('table');
            courseInfoTable.style = `
                border-style: hidden; 
                margin: 0.5vw;
            `;
                let tbody = document.createElement('tbody');
                    let tr = document.createElement('tr')
                        let prerequisiteHeader = document.createElement('th');
                        prerequisiteHeader.innerText = "Prerequisites";
                        prerequisiteHeader.style = `
                            width: 7%;
                            writing-mode: vertical-lr;
                            text-align: center;
                            border: 1px solid black;
                            padding: 0.5vw;
                        `;
                        this.#prerequisiteCell = document.createElement('td');
                        this.#prerequisiteCell.style = `
                            border: 1px solid black;
                            padding: 0.5vw;
                        `;
                    tr.appendChild(prerequisiteHeader);
                    tr.appendChild(this.#prerequisiteCell);
                tbody.appendChild(tr);
            courseInfoTable.appendChild(tbody);
        this.#courseInfoDiv.appendChild(this.#courseTitleHeader);
        this.#courseInfoDiv.appendChild(this.#courseDescriptionP);
        this.#courseInfoDiv.appendChild(new Spacer({"height": "0.5vw"}));
        this.#courseInfoDiv.appendChild(courseInfoTable);
        this.#courseInfoDiv.style.display = "none";
        
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

        this.#courseTitleHeader.innerText = courseID;
        this.#courseDescriptionP.innerText = CourseData[courseID].title;
        this.#prerequisiteCell.replaceChildren();

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
            this.#prerequisiteCell.appendChild(p);
        }
    }

    resetPanel() {
        this.#courseInfoDiv.style.display = "none";
        this.#placeholderP.style.display = "revert";
    }
}

customElements.define('depp-course-info-panel', CourseInfoPanel, {extends: 'div'});