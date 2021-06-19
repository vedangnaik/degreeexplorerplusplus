import CourseData from "./resources/CourseData.js"
import { CreateCourseSlot } from "./src/CourseSlot.js";


class CourseSlotFactory {
    static stylesheet = `
        width: 8.6vmax; 
        height: 52px; 
        border: 1px dotted red;
    `;

    static createCourseSlot() {
        let cs = document.createElement('td');
        cs.style = CourseSlotFactory.stylesheet;
        
        // create callbacks
        cs.ondragover = function(ev) {
            ev.preventDefault();
            ev.dataTransfer.dropEffect = "move";
        };
        cs.ondrop = function(ev) {
            ev.preventDefault();
            const id = ev.dataTransfer.getData("text/plain");
            const element = document.getElementById(id);
            ev.target.appendChild(element);
        }

        return cs;
    }
}




function evaluate_schedule() {
    // temp, get rid of this and move entire profile into separate class
    const profile = ["CSC108H1", "CSC148H1", "CSC165H1", "CSC207H1", "CSC236H1", "CSC209H1", "CSC258H1", "CSC263H1"];
    
    let semesters = document.getElementById('scheduler').firstElementChild.children;
    for (let course of profile) {
        // let course = "CSC207H1";
        const prereqs = CourseData[course]["prerequisites"];
        let courseTile = document.getElementById(course);
        let semester = Array.prototype.indexOf.call(semesters, courseTile.parentElement.parentElement);

        const booleanANDReducer = (accumulator, currentValue) => accumulator && currentValue;
        const satisfied = !prereqs || prereqs.map(ORCourseGroup => {
            const booleanORReducer = (accumulator, currentValue) => accumulator || currentValue;
            return ORCourseGroup.map(ORPrereq => {
                return profile.includes(ORPrereq) && semester < Array.prototype.indexOf.call(
                    semesters, 
                    document.getElementById(ORPrereq).parentElement.parentElement
                );
            }).reduce(booleanORReducer);
        }).reduce(booleanANDReducer);
        
        document.getElementById(course).style.backgroundColor = satisfied ? "green" : "red";
    }
}



// main
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById("evaluate-schedule").onclick = evaluate_schedule;
    const allCourseIDs = Object.keys(CourseData);

    // populate table with 5 semesters of classes
    let tbody = document.getElementById('scheduler').firstElementChild; 
    for (let row = 0; row < 5; row++) {
        let tr = document.createElement('tr');

        let th = document.createElement('th');
        th.innerText = "Semester " + row;
        tr.appendChild(th);

        for (let col = 0; col < 8; col++) {
            let cs = CourseSlotFactory.createCourseSlot();
            if (row < 2) {
                let randomID = allCourseIDs[Math.floor(Math.random() * allCourseIDs.length)];
                let ct = CreateCourseSlot(randomID, randomID, CourseData[randomID]["name"], randomID[6]);
                cs.appendChild(ct);
            }
            tr.appendChild(cs);
        }

        tbody.insertBefore(tr, tbody.firstChild);
    }
});