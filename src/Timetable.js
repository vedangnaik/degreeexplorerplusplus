import CourseData from "../resources/CourseData.js";
import { CourseSlotDiv } from "./CourseSlotDiv.js";


export class Timetable extends HTMLTableElement {
    static headerStylesheet = `
        display: flex;
        width: 8vw; 
        height: 4vw;
        outline: 1px solid white;
        background-color: rgba(255, 255, 255, 0.5);
    `;
    
    static semesterSelectStylesheet = `
        margin-left: auto;
        background-color: transparent;
        text-align-last: center;
        font-weight: bold;
        font-size: 0.83em;
    `;

    static yearSelectStylesheet = `
        margin-right: auto;
        background-color: transparent;
        text-align-last: center;
        font-weight: bold;
        font-size: 0.83em;
    `;

    static semesterNameStylesheet = `
        flex: 9;
        margin: auto;
    `;

    static deleteSemesterButtonStyleSheet = `
        flex: 1;
        background-color: #ff4d4d;
    `;

    static fallWinterGradient = "linear-gradient(5deg, #fdbb2da0, #f44336a0, #42a5f5a0)";
    static summerGradient = "linear-gradient(5deg, #42a5f5a0, #22c1c3a0, #fdbb2da0)";

    constructor() {
        super();
        this.tbody = document.createElement('tbody');
        this.appendChild(this.tbody);

        // the bottom row is fixed and unremovable. It contains the starting semester
        // value upon which the labels of the other semesters are calculated
        let tr = document.createElement('tr');
        tr.style.background = "linear-gradient(35deg, #03a9f4, #ffeb3b)";
            let th = document.createElement('th');
            th.style = Timetable.headerStylesheet;
                let deleteSemesterButton = document.createElement('button');
                deleteSemesterButton.innerText = '+';
                deleteSemesterButton.style = "flex: 1; background-color: forestgreen; font-weight: bold;"
                deleteSemesterButton.onclick = this.addSemester.bind(this);
            th.appendChild(deleteSemesterButton);
                // This div is responsible for centering the two selectors on top of each other.
                let selectDiv = document.createElement('div');
                selectDiv.style = "flex: 9; margin: auto;"
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
                selectDiv.appendChild(this.semesterSelect);
                    this.yearSelect = document.createElement('select');
                    this.yearSelect.style = Timetable.yearSelectStylesheet;
                    for (let year = 2050; year >= 1950; year--) {
                        let yearOption = document.createElement('option');
                        yearOption.style.backgroundColor = "white";
                        yearOption.value = year;
                        yearOption.innerText = year;
                        this.yearSelect.appendChild(yearOption);
                    }
                    // rely on ordering of children to correctly set the option of the current year to default
                    this.yearSelect.children[2050 - new Date().getFullYear()].selected = "selected";
                selectDiv.appendChild(this.yearSelect);
            th.appendChild(selectDiv);
        tr.appendChild(th);
        
        // add 6 course slot containers
        for (let _ = 0; _ < 6; _++) {
            let td = document.createElement('td');
            td.appendChild(new CourseSlotDiv());
            tr.appendChild(td);
        }
        this.tbody.appendChild(tr);

        this.addSemester();
        this.addSemester();
        this.addSemester();
        this.addSemester();

        // We use a single observer on the tbody to tell us if any rows get added or deleted. This will account for adding and deleting semesters. The selects do not affect the DOM so these need to be hooked up explicitly to the function via JS.
        this.semesterObserver = new MutationObserver(this.refreshSemstersInfo.bind(this));
        this.semesterObserver.observe(this.tbody, { childList: true });
        this.semesterSelect.onchange = this.refreshSemstersInfo.bind(this);
        this.yearSelect.onchange = this.refreshSemstersInfo.bind(this);

        // Add one last semester to get the refreshSemesterNames to fire and give all the previous semesters the correct name. This is a bit of a pointless micro-optimization but hey, why not right
        this.addSemester();
    }

    addSemester() {
        let tr = document.createElement('tr');
        tr.style.background = "linear-gradient(25deg, #03a9f4, #ffeb3b)";
            let th = document.createElement('th');
            th.style = Timetable.headerStylesheet;
                let deleteSemesterButton = document.createElement('button');
                deleteSemesterButton.innerText = '✖';
                deleteSemesterButton.style = Timetable.deleteSemesterButtonStyleSheet;
                deleteSemesterButton.onclick = this.deleteSemester.bind(tr);
            th.appendChild(deleteSemesterButton);
                let semesterName = document.createElement('h5');
                semesterName.style = Timetable.semesterNameStylesheet;
            th.appendChild(semesterName);
        tr.appendChild(th);

        for (let _ = 0; _ < 6; _++) {
            let td = document.createElement('td');
            td.appendChild(new CourseSlotDiv());
            tr.appendChild(td);
        }

        // Add the row to the top of the table so that the bottom one isn't disturbed
        this.tbody.insertBefore(tr, this.tbody.firstChild);
    }

    deleteSemester() {
        this.parentElement.removeChild(this);
    }

    refreshSemstersInfo() {
        // TODO: Add the differential row styling based on the season
        let semesters = this.tbody.children;
        let anchorSemester = this.semesterSelect.value;
        let anchorYear = parseInt(this.yearSelect.value);

        // Set only the gradient for the very first semester
        semesters[semesters.length - 1].style.background = anchorSemester === 'Fall/Winter' ? Timetable.fallWinterGradient : Timetable.summerGradient;

        for (let i = 1; i < semesters.length; i++) {
            let semester = semesters[semesters.length - 1 - i];
            let semesterHeader = semester.children[0];
            
            if (anchorSemester === 'Fall/Winter') {
                semesterHeader.children[1].innerText = i % 2 === 0 ? `Fall/Winter ${anchorYear + (i / 2)}` : `Summer ${anchorYear + Math.ceil(i / 2)}`;
                semester.style.background = i % 2 === 0 ? Timetable.fallWinterGradient : Timetable.summerGradient;
            } else {
                let newBaseYear = 
                semesterHeader.children[1].innerText = i % 2 === 0 ? `Summer ${anchorYear + (i / 2)}` : `Fall/Winter ${anchorYear + Math.ceil(i / 2)}`;
                semester.style.background = i % 2 === 0 ? Timetable.summerGradient : Timetable.fallWinterGradient;
            }
        }
    }
}

customElements.define('depp-timetable', Timetable, {extends: 'table'});