import { Spacer } from "./Spacer.js";

export class CourseInfoPanel extends HTMLDivElement {
    static stylesheet = `
        background-color: lightgrey;
        width: 28vw;
        outline: grey solid thin;
    `;

    static tableHeaderStylesheet = `
        width: 10%;
        writing-mode: vertical-lr;
        text-align: center;
        border: 1px solid black;
        padding: 0.5vw;
    `;

    constructor() {
        super();

        this.style = CourseInfoPanel.stylesheet;

        this.courseTitleHeader = document.createElement('h3');
        this.courseTitleHeader.style.textAlign = "center";
        this.courseTitleHeader.innerText = "CSC165H1";

        this.courseDescriptionP = document.createElement('h5');
        this.courseDescriptionP.style.textAlign = "center";
        this.courseDescriptionP.innerText = "Mathematical Expression and Reasoning for Computer Science";

        let courseInfoTable = document.createElement('table');
        courseInfoTable.style.borderStyle = "hidden";
            let tbody = document.createElement('tbody');
                let tr = document.createElement('tr')
                    let prerequisiteHeader = document.createElement('th');
                    prerequisiteHeader.innerText = "Prerequisites";
                    prerequisiteHeader.style = CourseInfoPanel.tableHeaderStylesheet;

                    this.prerequisiteCell = document.createElement('td');
                    this.prerequisiteCell.style.textAlign = "justify";
                    this.prerequisiteCell.style.border = "1px solid black";
                    this.prerequisiteCell.style.padding = "0 0.75vw";
                    this.prerequisiteCell.innerText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et interdum libero. Ut in auctor dui, vel egestas velit. Etiam sodales fermentum hendrerit. Praesent eget neque efficitur, pulvinar purus ut, maximus arcu. Maecenas sit amet eleifend nunc, vitae blandit lectus. In hac habitasse platea dictumst. Nulla sed risus sed est luctus lacinia id quis dolor. Vestibulum tincidunt sem odio, ac molestie tortor ultricies ac. Mauris molestie lectus turpis, ut sodales dolor dictum sit amet. Ut semper fringilla accumsan. Duis quam justo, condimentum posuere porta vitae, tempor ac metus. Phasellus dolor risus, finibus sit amet urna a, blandit feugiat eros.";
                tr.appendChild(prerequisiteHeader);
                tr.appendChild(this.prerequisiteCell);
            tbody.appendChild(tr);
        courseInfoTable.appendChild(tbody);

        this.appendChild(this.courseTitleHeader);
        this.appendChild(this.courseDescriptionP);
        this.appendChild(new Spacer({"height": "1vw"}));
        this.appendChild(courseInfoTable);
    }
}

customElements.define('depp-course-info-panel', CourseInfoPanel, {extends: 'div'});