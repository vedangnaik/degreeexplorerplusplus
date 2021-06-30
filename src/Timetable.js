import CourseData from "../resources/CourseData.js";
import { CourseSlotDiv } from "./CourseSlotDiv.js";


export class Timetable extends HTMLTableElement {
    static headerStylesheet = `
        overflow: hidden;
        display: flex;
        width: 13vw; 
        height: 4vw;
        background-color: #4d9900;
        border-radius: 7px;
    `;
    
    static semesterSelectStylesheet = `
        margin-left: auto;
        background-color: #4d9900;
        text-align-last: center;
        font-weight: bold;
        font-size: 1em;
    `;

    static yearSelectStylesheet = `
        margin-right: auto;
        background-color: #4d9900;
        text-align-last: center;
        font-weight: bold;
        font-size: 1em;
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

        // the bottom row is fixed and unremovable. It contains the starting semester
        // value upon which the labels of the other semesters are calculated
        let tr = document.createElement('tr');
        let th = document.createElement('th');
        th.style = Timetable.headerStylesheet;
            // create the select for the semester  
            this.semesterSelect = document.createElement('select');
            this.semesterSelect.style = Timetable.semesterSelectStylesheet;
                // option for fall/winter
                let fallWinterOption = document.createElement('option');
                fallWinterOption.style.backgroundColor = "white";
                fallWinterOption.value = "Fall/Winter";
                fallWinterOption.innerText = "Fall/Winter";
                // option for summer
                let summerOption = document.createElement('option');
                summerOption.style.backgroundColor = "white";
                summerOption.value = "Summer";
                summerOption.innerText = "Summer";
            this.semesterSelect.appendChild(fallWinterOption);
            this.semesterSelect.appendChild(summerOption);
            this.semesterSelect.onchange = this.refreshSemsterNames.bind(this);
            // create the select for the year
            this.yearSelect = document.createElement('select');
            this.yearSelect.style = Timetable.yearSelectStylesheet;
            for (let year = 2050; year >= 1950; year--) {
                let yearOption = document.createElement('option');
                yearOption.style.backgroundColor = "white";
                yearOption.value = year;
                yearOption.innerText = year;
                this.yearSelect.appendChild(yearOption);
            }
            this.yearSelect.onchange = this.refreshSemsterNames.bind(this);
            // rely on ordering of children to correctly set the option of the current year to default
            this.yearSelect.children[2050 - new Date().getFullYear()].selected = "selected";
        th.appendChild(this.semesterSelect);
        th.appendChild(this.yearSelect);
        
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
            let semesterName = document.createElement('h4');
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

        this.refreshSemsterNames()
    }

    deleteSemester() {
        let temp_table = this.closest('table');
        this.parentElement.removeChild(this);
        temp_table.refreshSemsterNames();
    }

    refreshSemsterNames() {
        let semesters = this.tbody.children;
        let anchorSemester = this.semesterSelect.value;
        let anchorYear = parseInt(this.yearSelect.value);
        for (let i = 1; i < semesters.length; i++) {
            let semesterHeader = semesters[semesters.length - 1 - i].children[0];
            
            if (anchorSemester == 'Fall/Winter') {
                semesterHeader.children[1].innerText = i % 2 == 0 ? `Fall/Winter ${anchorYear + (i / 2)}` : `Summer ${anchorYear + Math.ceil(i / 2)}`;
            } else {
                let newBaseYear = 
                semesterHeader.children[1].innerText = i % 2 == 0 ? `Summer ${anchorYear + (i / 2)}` : `Fall/Winter ${anchorYear + Math.ceil(i / 2)}`;
            }
        }
    }
}

customElements.define('depp-timetable', Timetable, {extends: 'table'});