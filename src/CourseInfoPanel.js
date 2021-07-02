import { Spacer } from "./Spacer.js";

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
        text-align: justify;
        border: 1px solid black;
        padding: 0.5vw;
    `;

    constructor(id) {
        super();

        this.id = id;
        this.style = CourseInfoPanel.stylesheet;

        this.courseTitleHeader = document.createElement('h3');
        this.courseTitleHeader.style.textAlign = "center";
        this.courseTitleHeader.innerText = "CSC165H1";

        this.courseDescriptionP = document.createElement('h4');
        this.courseDescriptionP.style.textAlign = "center";
        this.courseDescriptionP.innerText = "Mathematical Expression and Reasoning for Computer Science";

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
}

customElements.define('depp-course-info-panel', CourseInfoPanel, {extends: 'div'});