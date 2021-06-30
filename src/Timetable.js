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

    constructor() {
        super();

        this.tbody = document.createElement('tbody');
        this.appendChild(this.tbody);

        // the bottom row is fixed and unremovable. It contains the starting semester
        // value upon which the labels of the other semesters are calculated
        let tr = document.createElement('tr');
        let th = document.createElement('th');
        th.style = Timetable.headerStylesheet;
            // create the select for the semester  
            let semesterSelect = document.createElement('select');
            semesterSelect.style = Timetable.semesterNameStylesheet;
                let fallWinter = document.createElement('option');
                fallWinter.innerText = "Fall/Winter";
                let summer = document.createElement('option');
                summer.innerText = "Summer";
            semesterSelect.appendChild(fallWinter);
            semesterSelect.appendChild(summer);
            // create the select for the year
            let yearSelect = document.createElement('select');
            yearSelect.style = Timetable.semesterNameStylesheet;
            for (let year = 1950; year <= 2050; year++) {
                let yearOption = document.createElement('option');
                yearOption.innerText = year;
                yearSelect.appendChild(yearOption);
            }
            // rely on ordering of children to correctly set the option of the current year to default
            yearSelect.children[new Date().getFullYear() - 1950].selected = "selected";
        th.appendChild(semesterSelect);
        th.appendChild(yearSelect);
        
        tr.appendChild(th);
        tr.appendChild(th);
        // add 6 course slot containers
        for (let col = 0; col < 6; col++) {
            let td = document.createElement('td');
            let csc = new CourseSlotDiv();
            td.appendChild(csc);
            tr.appendChild(td);
        }

        this.tbody.appendChild(tr);
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
        // add 6 course slot containers
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


class SemesterHeader extends HTMLTableCellElement {
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

    }
}


customElements.define('depp-timetable', Timetable, {extends: 'table'});