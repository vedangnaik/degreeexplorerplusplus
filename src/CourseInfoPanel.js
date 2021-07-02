import CourseData from "../resources/CourseData.js";
import { Spacer } from "./Spacer.js";
import { PrerequisiteStatuses } from "./CourseTile.js";

export class CourseInfoPanel extends HTMLDivElement {
    static stylesheet = `
        background-color: lightgrey;
        width: 28vw;
        outline: grey solid thin;
    `;

    static tableHeaderStylesheet = `
        width: 7%;
        writing-mode: vertical-lr;
        text-align: center;
        border: 1px solid black;
        padding: 0.5vw;
    `;

    static requisiteCellStylesheet = `
        border: 1px solid black;
        padding: 0.5vw;
    `;

    constructor(id) {
        super();

        this.id = id;
        this.style = CourseInfoPanel.stylesheet;

        this.courseTitleHeader = document.createElement('h3');
        this.courseTitleHeader.style.textAlign = "center";
        this.courseTitleHeader.innerText = "Course ID";

        this.courseDescriptionP = document.createElement('h4');
        this.courseDescriptionP.style.textAlign = "center";
        this.courseDescriptionP.innerText = "Course Description";

        let courseInfoTable = document.createElement('table');
        courseInfoTable.style = "border-style: hidden; margin: 0.5vw;";
            let tbody = document.createElement('tbody');
                let tr = document.createElement('tr')
                    let prerequisiteHeader = document.createElement('th');
                    prerequisiteHeader.innerText = "Prerequisites";
                    prerequisiteHeader.style = CourseInfoPanel.tableHeaderStylesheet;
                    this.prerequisiteCell = document.createElement('td');
                    this.prerequisiteCell.style = CourseInfoPanel.requisiteCellStylesheet;
                tr.appendChild(prerequisiteHeader);
                tr.appendChild(this.prerequisiteCell);
            tbody.appendChild(tr);
                tr = document.createElement('tr')
                    let corequisiteHeader = document.createElement('th');
                    corequisiteHeader.innerText = "Corequisites";
                    corequisiteHeader.style = CourseInfoPanel.tableHeaderStylesheet;
                    this.corequisiteCell = document.createElement('td');
                    this.corequisiteCell.style = CourseInfoPanel.requisiteCellStylesheet;
                tr.appendChild(corequisiteHeader);
                tr.appendChild(this.corequisiteCell);
            tbody.appendChild(tr);
        courseInfoTable.appendChild(tbody);

        this.appendChild(this.courseTitleHeader);
        this.appendChild(this.courseDescriptionP);
        this.appendChild(new Spacer({"height": "0.5vw"}));
        this.appendChild(courseInfoTable);
    }

    printPrereqisiteInfo(courseID, prerequisitesTracker) {
        this.courseTitleHeader.innerText = courseID;
        this.courseDescriptionP.innerText = CourseData[courseID].title;
        this.prerequisiteCell.replaceChildren();

        for (let prereqID in prerequisitesTracker) {
            let p = document.createElement('p');
            p.innerText = `${prereqID}: ${CourseData[courseID].prerequisites[prereqID].description}`;
            switch (prerequisitesTracker[prereqID]) {
                case PrerequisiteStatuses.COMPLETE:
                    p.style.color = "green";
                    break;
                case PrerequisiteStatuses.INCOMPLETE:
                    p.style.color = "red";
                    break;
                case PrerequisiteStatuses.NA:
                    p.style.color = "grey";
                    break;
                case PrerequisiteStatuses.WARNING:
                    p.style.color = "yellow";
                    break;
            }
            this.prerequisiteCell.appendChild(p);
        }
    }
}

customElements.define('depp-course-info-panel', CourseInfoPanel, {extends: 'div'});