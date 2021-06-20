import CourseData from "../resources/CourseData.js";
import { CourseSlot } from "./CourseSlot.js";
import { CourseTile } from "./CourseTile.js";


export class CoursePlan extends HTMLTableElement {
    constructor(profileID) {
        super();
        this.id = profileID;
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
        // add 8 course slots
        for (let col = 0; col < 8; col++) {
            let td = document.createElement('td');
            let d = document.createElement('div');
            d.style = "display: flex; height: 4.1vmax; flex-direction: column;"
            let cs1 = new CourseSlot();
            let cs2 = new CourseSlot();
            d.appendChild(cs1);
            d.appendChild(cs2);
            td.appendChild(d);
            tr.appendChild(td);
        }
        // append row
        this.tbody.insertBefore(tr, this.tbody.firstChild);
    }

    evaluate() {
        let profile = {};
        const semesters = this.getElementsByTagName('tr');
        // don't ask
        Array.prototype.filter.call(this.tbody.getElementsByTagName('div'), div => {
                return div.customTagName === "course-tile"; // filter out only the course-tiles
            }).map(div => {
                profile[div.id] = Array.prototype.indexOf.call(semesters, div.closest('tr')) // the tr is the great-grandparent of the slot
            }
        );

        console.log(profile);

        for (let id in profile) {
            const prereqs = CourseData[id]["prerequisites"];
            let semester = profile[id];

            const booleanANDReducer = (accumulator, currentValue) => accumulator && currentValue;
            const satisfied = !prereqs || prereqs.map(ORCourseGroup => {
                const booleanORReducer = (accumulator, currentValue) => accumulator || currentValue;
                return ORCourseGroup.map(ORPrereq => {
                    return profile[ORPrereq] && profile[id] < Array.prototype.indexOf.call(semesters, document.getElementById(ORPrereq).closest('tr'));
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