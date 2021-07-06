import { Timetable } from "./Timetable.js";
import { Program } from "./Program.js";
import { CourseInfoPanel } from "./CourseInfoPanel.js";
import { Spacer } from "./Spacer.js";

export class Profile extends HTMLDivElement {
    constructor() {
        super();
    }

    evaluateProfile() {
        let courses = this.getScheduledCourses();
        let programs = {} // TODO check the programs

        for (let courseID in courses) {
            document.getElementById(courseID).evaluatePrerequisites(courses, programs);
            // TODO check that this actually returns true
        }

        // TODO check the programs
    }

    getScheduledCourses() {
        let plan = {}; // TODO: Maybe make this a Map
        const semesters = Array.prototype.slice.call(this.timetable.getElementsByTagName('tr'));
        const divs = Array.prototype.slice.call(this.timetable.tbody.getElementsByTagName('div'));
        // Transform the list of divs into a profile representation
        // First, filter out only the course-tiles 
        divs.filter(div => {
            return div.customTagName === "course-tile";
        // Then, assign a semester number to each.
        }).forEach(courseTile => {
            let semesterNum = 2 * semesters.indexOf(courseTile.closest('tr')); // The base number is twice the row number
            // If the course is year-long, then it will be counted as the lower semester
            if (courseTile.courseLength === 'Y') {
                semesterNum += 1;
            // Otherwise, we ask the CourseSlotContainer what slot this course is in, and add that to the base.
            } else {
                semesterNum += courseTile.parentElement.parentElement.getSlotNumber(courseTile);
            }
            plan[courseTile.id] = semesterNum;
        });

        return plan;
    }
}


customElements.define('depp-profile', Profile, {extends: 'div'});