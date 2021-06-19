import { CreateCourseSlot } from "./CourseSlot.js";
import { CreateCourseTile } from "./CourseTile.js";


export function CreateCoursePlan(profileID) {
    let p = document.createElement('table', {is: 'course-plan'});
    p.id = profileID;
    return p;
}


class CoursePlan extends HTMLTableElement {
    constructor() {
        super();
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
        th.innerText = "Semester " + this.tbody.children.length;
        tr.appendChild(th);
        // add 8 course slots
        for (let col = 0; col < 8; col++) {
            let cs = CreateCourseSlot();
            tr.appendChild(cs);
        }
        // append row
        this.tbody.insertBefore(tr, this.tbody.firstChild);
    }

    evaluate() {
        let courses = this.tbody.getElementsByTagName('course-tile');
        console.log(courses);
        
        // let semesters = document.getElementById('scheduler').firstElementChild.children;
        // for (let course of profile) {
        //     // let course = "CSC207H1";
        //     const prereqs = CourseData[course]["prerequisites"];
        //     let courseTile = document.getElementById(course);
        //     let semester = Array.prototype.indexOf.call(semesters, courseTile.parentElement.parentElement);

        //     const booleanANDReducer = (accumulator, currentValue) => accumulator && currentValue;
        //     const satisfied = !prereqs || prereqs.map(ORCourseGroup => {
        //         const booleanORReducer = (accumulator, currentValue) => accumulator || currentValue;
        //         return ORCourseGroup.map(ORPrereq => {
        //             return profile.includes(ORPrereq) && semester < Array.prototype.indexOf.call(
        //                 semesters, 
        //                 document.getElementById(ORPrereq).parentElement.parentElement
        //             );
        //         }).reduce(booleanORReducer);
        //     }).reduce(booleanANDReducer);
            
        //     document.getElementById(course).style.backgroundColor = satisfied ? "green" : "red";
        // }
    }
}


customElements.define('course-plan', CoursePlan, {extends: 'table'});