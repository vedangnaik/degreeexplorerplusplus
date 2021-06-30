import CourseData from "../resources/CourseData.js";
import { CourseSlotDiv } from "./CourseSlotDiv.js";


export class Timetable extends HTMLTableElement {
    static headerStylesheet = `
        overflow: hidden;
        display: flex;
        width: 11vw; 
        height: 4vw;
        background-color: #4d9900;
        border-radius: 7px;
    `;

    static semesterNameStylesheet = `
        flex: 11;
        margin: auto;
    `;

    static deleteSemesterButtonStyleSheet = `
        flex: 1;
        background-color: #ff4d4d; 
    `;

    constructor() {
        super();

        this.tbody = document.createElement('tbody');
        this.appendChild(this.tbody);

        this.addSemester();
        this.addSemester();
        this.addSemester();
        this.addSemester();        
    }

    addSemester() {
        // create new row
        let tr = document.createElement('tr');
        // header for row based on current number of semesters
        let th = document.createElement('th');
        th.style = Timetable.headerStylesheet;
            let deleteSemesterButton = document.createElement('button');
            deleteSemesterButton.innerText = '✖';
            deleteSemesterButton.style = Timetable.deleteSemesterButtonStyleSheet;
            deleteSemesterButton.onclick = this.deleteSemester.bind(tr);
            let semesterName = document.createElement('h3');
            semesterName.innerText = "Semester " + (this.tbody.children.length + 1);
            semesterName.style = Timetable.semesterNameStylesheet;
        th.appendChild(deleteSemesterButton);
        th.appendChild(semesterName);

        tr.appendChild(th);
        // add 8 course slot containers
        for (let col = 0; col < 6; col++) {
            let td = document.createElement('td');
            let csc = new CourseSlotDiv();
            td.appendChild(csc);
            tr.appendChild(td);
        }
        // append row
        this.tbody.insertBefore(tr, this.tbody.firstChild);
    }

    deleteSemester() {
        this.parentElement.removeChild(this);
    }
}


customElements.define('depp-timetable', Timetable, {extends: 'table'});