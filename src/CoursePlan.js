import CourseData from "../resources/CourseData.js";
import { CourseSlotContainer } from "./CourseSlot.js";
import { CourseTile } from "./CourseTile.js";


export class CoursePlan extends HTMLTableElement {
    constructor(profileID) {
        super();
        this.id = profileID;
        this.style = "border-collapse: collapse;"
        // create table head to store add semester button
        let thead = document.createElement('thead');
        this.appendChild(thead);
        // create add semester button and rebind callback
        let addSemesterButton = document.createElement('button');
        addSemesterButton.innerText = "Add Semester";
        addSemesterButton.onclick = this.addSemester.bind(this);
        thead.appendChild(addSemesterButton);
        // create evaluate button and rebind callback
        let evaluateButton = document.createElement('button');
        evaluateButton.innerText = "Evaluate Plan";
        evaluateButton.onclick = this.evaluate.bind(this);
        thead.appendChild(evaluateButton);

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
        th.innerText = "Semester " + (this.tbody.children.length + 1);
        tr.appendChild(th);
        // add 8 course slot containers
        for (let col = 0; col < 8; col++) {
            let td = document.createElement('td');
            let csc = new CourseSlotContainer();
            td.appendChild(csc);
            tr.appendChild(td);
        }
        // append row
        this.tbody.insertBefore(tr, this.tbody.firstChild);
    }

    evaluate() {
        let profile = {}; // TODO: Maybe make this a Map
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
            profile[courseTile.id] = semesterNum;
        });

        // Evaluate the courses
        for (let id in profile) {
            const prereqs = CourseData[id]["prerequisites"];

            const booleanANDReducer = (accumulator, currentValue) => accumulator && currentValue;
            const satisfied = !prereqs || prereqs.map(ORCourseGroup => {
                const booleanORReducer = (accumulator, currentValue) => accumulator || currentValue;
                return ORCourseGroup.map(ORPrereq => {
                    return profile[ORPrereq] && profile[id] < profile[ORPrereq];
                }).reduce(booleanORReducer);
            }).reduce(booleanANDReducer);
            
            document.getElementById(id).style.backgroundColor = satisfied ? "green" : "red";
        }
    }
}


// class Semester extends HTMLTableRowElement {
//     constructor() {
//         super();
//         // create new rows
//         let tr1 = document.createElement('tr');
//         let tr2 = document.createElement('tr');
        
//         // header for row based on current number of semesters
//         let th = document.createElement('th');
//         th.innerText = "Semester " + (this.tbody.children.length + 1);
//         th.rowSpan = 2;
//         t1.appendChild(th);

//         // add 8 course slots to each row
//         for (let col = 0; col < 8; col++) {
//             let td = document.createElement('td');
//             let cs = new CourseSlot();
//             td.appendChild(cs);

//             tr1.appendChild(td);
//             tr2.appendChild(td.cloneNode(true));
//         }
//         // append row
//         this.tbody.insertBefore(tr, this.tbody.firstChild);
//     }
// }


customElements.define('course-plan', CoursePlan, {extends: 'table'});