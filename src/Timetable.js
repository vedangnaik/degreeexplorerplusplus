import CourseData from "../resources/CourseData.js";
import { CourseSlotDiv } from "./CourseSlotDiv.js";


export class Timetable extends HTMLTableElement {
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
        th.style = "display: flex;"; 
            let name = document.createElement('div');
            name.innerText = "Semester " + (this.tbody.children.length + 1);
            name.style = "flex: 0 0 90%;"
            let b = document.createElement('button');
            b.innerText = 'X';
            b.style = "flex: 1";
            b.onclick = this.deleteSemester.bind(tr);

        th.appendChild(name);
        th.appendChild(b);

        tr.appendChild(th);
        // add 8 course slot containers
        for (let col = 0; col < 8; col++) {
            let td = document.createElement('td');
            let csc = new CourseSlotDiv();
            td.appendChild(csc);
            tr.appendChild(td);
        }
        // append row
        this.tbody.insertBefore(tr, this.tbody.firstChild);
    }

    evaluatePrerequisites(courses) {
        let allSatisfied = true;
        for (let id in courses) {
            const prereqs = CourseData[id]["prerequisites"];

            const booleanANDReducer = (accumulator, currentValue) => accumulator && currentValue;
            const satisfied = !prereqs || prereqs.map(ORCourseGroup => {
                const booleanORReducer = (accumulator, currentValue) => accumulator || currentValue;
                return ORCourseGroup.map(ORPrereq => {
                    return courses[ORPrereq] && courses[id] < courses[ORPrereq];
                }).reduce(booleanORReducer);
            }).reduce(booleanANDReducer);

            if (!satisfied) { allSatisfied = false; }
            
            document.getElementById(id).style.backgroundColor = satisfied ? "green" : "red";
        }

        return allSatisfied;
    }

    deleteSemester() {
        this.parentElement.removeChild(this);
    }
}


customElements.define('depp-timetable', Timetable, {extends: 'table'});