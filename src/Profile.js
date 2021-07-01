import { CourseSlotDiv } from "./CourseSlotDiv.js";
import { Timetable } from "./Timetable.js";
import { CourseTile } from "./CourseTile.js";
import { Program } from "./Program.js";
import CourseData from "../resources/CourseData.js";
import { CourseInfoPanel } from "./CourseInfoPanel.js";
import { Spacer } from "./Spacer.js";

export class Profile extends HTMLDivElement {
    constructor() {
        super();
        // array to hold all programs
        this.programs = []

        // this convoluted pattern is required to get the main div to follow the height of the timetable and not expand to fit the height of the course info panel. See this link: https://stackoverflow.com/questions/34194042/one-flex-grid-item-sets-the-size-limit-for-siblings. The names of these elements have been chosen to match the solution.
        let main = document.createElement('div');
        main.style = "display: flex;";
            let timetableSection = document.createElement('section');
            timetableSection.style = "display: flex; flex-direction: column;";
                this.timetable = new Timetable();
            timetableSection.appendChild(this.timetable);
            let courseInfoPanelSection = document.createElement('section');
            courseInfoPanelSection.style = "display: flex; flex-direction: column;";
                this.courseInfoPanel = new CourseInfoPanel();
                // extra properties needed for the height thing 
                this.courseInfoPanel.style.flexBasis = "0px";
                this.courseInfoPanel.style.flexGrow = "1";
                this.courseInfoPanel.style.overflowY = "scroll";
            courseInfoPanelSection.appendChild(this.courseInfoPanel);
        main.appendChild(timetableSection);
        main.appendChild(new Spacer({"width": "1vw"}));
        main.appendChild(courseInfoPanelSection);

        // the toolbar with the buttons and stuff
        let toolbar = document.createElement('div');
        toolbar.style = "display: flex; justify-content: space-between;";
            // add semester button
            let addSemesterButton = document.createElement('button');    
            addSemesterButton.innerText = "Add Semester";
            addSemesterButton.onclick = this.timetable.addSemester.bind(this.timetable);
            
            // this div contains the course/program search buttons plus the slot
            let addCoursesAndProgramsDiv = document.createElement('div');
            addCoursesAndProgramsDiv.style = "display: flex;";
                // controls div - contains all course and program search stuff
                let controlsDiv = document.createElement('div');
                controlsDiv.style = "display: flex; flex-direction: column; height: 100%;";
                    this.searchInput = document.createElement('input');
                    this.searchInput.type = "text";
                    this.searchInput.style = "flex: 1;"
                    let searchButton = document.createElement('button');
                    searchButton.innerText = "Search";
                    searchButton.style = "flex: 1;";
                    searchButton.onclick = this.searchCourse.bind(this);
                controlsDiv.append(this.searchInput);
                controlsDiv.append(searchButton);
                // course slot
                this.cs = new CourseSlotDiv();
                // this.cs.firstElementChild.style = ""; // hide one of the slots by making it width 0; TODO fix this, kinda hacky
            addCoursesAndProgramsDiv.appendChild(controlsDiv);
            addCoursesAndProgramsDiv.appendChild(this.cs);

            let evaluateProfileButton = document.createElement('button');
            evaluateProfileButton.innerText = "Check CS Specialist Requirements"
            evaluateProfileButton.onclick = this.evaluateProfile.bind(this)
        toolbar.appendChild(addSemesterButton);
        toolbar.appendChild(addCoursesAndProgramsDiv);
        toolbar.appendChild(evaluateProfileButton);

        // TODO Temp, just for checking if programs work
        let program = new Program("ASSPE1689");
        this.programs.push(program);

        this.appendChild(main);
        this.appendChild(new Spacer({ "height": "1vw" }));
        this.appendChild(toolbar);
        this.appendChild(new Spacer({ "height": "1vw" }));
        this.appendChild(program);

        // TODO Temp remove this, only for testing
        let ct = new CourseTile("CSC148H1");
        let t = this.cs.childNodes[1];
        if (t.children.length > 0) { t.removeChild(t.childNodes[0]); }
        t.appendChild(ct);
    }

    searchCourse() {
        const id = this.searchInput.value;
        if (CourseData[id]) {
            let ct = new CourseTile(id);
            let t = this.cs.childNodes[0];
            if (t.children.length > 0) { t.removeChild(t.childNodes[0]); }
            t.appendChild(ct);
        } else {
            console.log(`course '${id}' not found`);
        }
    }

    evaluateProfile() {
        let courses = this.getScheduledCourses();
        let programs = {} // TODO get this

        for (let courseID in courses) {
            courseDiv = document.getElementById(courseID);
            courseDiv.evaluatePrerequisites(courses, programs);
            // TODO check that this actually returns true
        }

        for (let program of this.programs) {
            program.evaluateRequirements(courses);
        }
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

        return plan;
    }
}


customElements.define('depp-profile', Profile, {extends: 'div'});