import { Timetable } from "./Timetable.js";
import { Program } from "./Program.js";
import { CourseInfoPanel } from "./CourseInfoPanel.js";
import { Spacer } from "./Spacer.js";

export class Profile extends HTMLDivElement {
    constructor() {
        super();

        // this convoluted pattern is required to get the main div to follow the height of the timetable and not expand to fit the height of the course info panel. See this link: https://stackoverflow.com/questions/34194042/one-flex-grid-item-sets-the-size-limit-for-siblings. The names of these elements have been chosen to match the solution.
        let main = document.createElement('div');
        main.style = "display: flex;";
            let timetableSection = document.createElement('section');
            timetableSection.style = "display: flex; flex-direction: column;";
                this.timetable = new Timetable();
            timetableSection.appendChild(this.timetable);
            let courseInfoPanelSection = document.createElement('section');
            courseInfoPanelSection.style = "display: flex; flex-direction: column;";
                this.courseInfoPanel = new CourseInfoPanel("CourseInfoPanel");
                // extra properties needed for the height thing 
                this.courseInfoPanel.style.flexBasis = "0px";
                this.courseInfoPanel.style.flexGrow = "1";
                this.courseInfoPanel.style.overflowY = "scroll";
            courseInfoPanelSection.appendChild(this.courseInfoPanel);
        main.appendChild(timetableSection);
        main.appendChild(new Spacer({"width": "1vw"}));
        main.appendChild(courseInfoPanelSection);

        this.appendChild(main);
        // this.appendChild(new Spacer({ "height": "1vw" }));
        // TODO Temp remove this, only for testing
        // let program = new Program("ASSPE1689");
        // this.appendChild(program);

        // Connect all the MutationObservers
        this.timetableObserver = new MutationObserver(this.invalidatePrerequisitesAndClearInfoPanel.bind(this));
        this.timetableObserver.observe(this.timetable, { childList: true, subtree: true});
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

    invalidatePrerequisitesAndClearInfoPanel() {
        for (let div of this.timetable.tbody.getElementsByTagName('div')) {
            if (div.customTagName === "course-tile") { div.resetCourse(); }
        }
    }
}


customElements.define('depp-profile', Profile, {extends: 'div'});