import { CourseSlotDiv } from "./CourseSlotDiv.js";
import { Timetable } from "./Timetable.js";
import { CourseTile } from "./CourseTile.js";
import CourseData from "../resources/CourseData.js";
import ProgramData from "../resources/ProgramData.js";

export class Profile extends HTMLDivElement {
    constructor() {
        super();

        // the timetable bit
        this.timetable = new Timetable();
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

            // check prereqs button
            let checkPrereqsButton = document.createElement('button');
            checkPrereqsButton.innerText = "Check Prerequisites";
            checkPrereqsButton.onclick = this.timetable.checkPrereqs.bind(this.timetable);

            // check program reqs button
            let checkProgramReqsButton = document.createElement('button');
            checkProgramReqsButton.innerText = "Check CS Specialist Requirements"
            checkProgramReqsButton.onclick = this.TEMP.bind(this)
        toolbar.appendChild(addSemesterButton);
        toolbar.appendChild(addCoursesAndProgramsDiv);
        toolbar.appendChild(checkPrereqsButton);
        toolbar.appendChild(checkProgramReqsButton);
        // program manager - TODO
        // this.programManager = new programManager(); 

        this.appendChild(this.timetable);
        this.appendChild(toolbar);
        // this.appendChild(programManager); TODO

        // TODO Temp remove this, only for testing
        let ct = new CourseTile("CSC148H1", "CSC148H1", "", 'H');
        let t = this.cs.childNodes[1];
        if (t.children.length > 0) { t.removeChild(t.childNodes[0]); }
        t.appendChild(ct);
    }

    searchCourse() {
        const id = this.searchInput.value;
        if (CourseData[id]) {
            let ct = new CourseTile(id, id, "", id[6]);
            let t = this.cs.childNodes[0];
            if (t.children.length > 0) { t.removeChild(t.childNodes[0]); }
            t.appendChild(ct);
        } else {
            console.log(`course '${id}' not found`);
        }
    }

    TEMP() {
        // let courses = this.timetable.getScheduledCourses();
        let courses = {"CSC108H1": 1, "CSC148H1": 1, "CSC165H1": 1, "CSC207H1": 1, "CSC209H1": 1, "CSC236H1": 1, "CSC258H1": 1, "CSC263H1": 1, "CSC309H1": 1, "CSC311H1": 1, "CSC324H1": 1, "CSC336H1": 1, "CSC343H1": 1, "CSC367H1": 1, "CSC369H1": 1, "CSC373H1": 1, "CSC436H1": 1, "CSC443H1": 1, "CSC448H1": 1, "CSC456H1": 1, "CSC457H1": 1, "CSC458H1": 1, "CSC469H1": 1, "CSC488H1": 1, "GGR101H1": 1, "HPS390H1": 1, "HPS391H1": 1, "MAT137Y1": 1, "MAT223H1": 1, "MAT224H1": 1, "MAT237Y1": 1, "PCL102H1": 1, "PHL100Y1": 1, "PHY131H1": 1, "STA247H1": 1, "STA248H1": 1}
        for (let constraintFunc of ProgramData["ASSPE1689"]["completion"]) {
            if (!constraintFunc(courses)) {
                console.log(constraintFunc);
                return false;
            }
        }
        return true;
    }
}


customElements.define('depp-profile', Profile, {extends: 'div'});