import CourseData from "../resources/CourseData.js";
import { CourseSlotDiv } from "./CourseSlotDiv.js";


export class Scheduler extends HTMLTableElement {
    constructor(profileID) {
        super();
        this.id = profileID;
        this.style = "border-collapse: collapse;"

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
        th.style.width = "100%";
        th.style.border = "1px solid black";
        th.innerText = "Semester " + (this.tbody.children.length + 1);
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

    evaluateProfile() {
        let plan = {}; // TODO: Maybe make this a Map
        const semesters = Array.prototype.slice.call(this.getElementsByTagName('tr'));
        const divs = Array.prototype.slice.call(this.tbody.getElementsByTagName('div'));
        // Transform the list of divs into a profile representation
        // First, filter out only the course-tiles 
        divs.filter(div => {
            return div.customTagName === "course-tile";
        // Then, assign a semester number to each.
        }).forEach(courseTile => {
            let semesterNum = 2 * semesters.indexOf(courseTile.closest('tr')); // The base number if twice the row number
            // If the course is year-long, then it will be counted as the lower semester
            if (courseTile.courseLength === 'Y') {
                semesterNum += 1;
            // Otherwise, we ask the CourseSlotContainer what slot this course is in, and add that tot he base.
            } else {
                semesterNum += courseTile.parentElement.parentElement.getSlotNumber(courseTile);
            }
            plan[courseTile.id] = semesterNum;
        });

        // Evaluate the courses
        for (let id in plan) {
            const prereqs = CourseData[id]["prerequisites"];

            const booleanANDReducer = (accumulator, currentValue) => accumulator && currentValue;
            const satisfied = !prereqs || prereqs.map(ORCourseGroup => {
                const booleanORReducer = (accumulator, currentValue) => accumulator || currentValue;
                return ORCourseGroup.map(ORPrereq => {
                    return plan[ORPrereq] && plan[id] < plan[ORPrereq];
                }).reduce(booleanORReducer);
            }).reduce(booleanANDReducer);
            
            document.getElementById(id).style.backgroundColor = satisfied ? "green" : "red";
        }
    }
}


customElements.define('depp-scheduler', Scheduler, {extends: 'table'});