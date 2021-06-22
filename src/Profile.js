import { CourseSlotDiv } from "./CourseSlotDiv.js";
import { Timetable } from "./Timetable.js";
import { CourseTile } from "./CourseTile.js";
import CourseData from "../resources/CourseData.js";

export class Profile extends HTMLDivElement {
    constructor() {
        super();

        // the timetable bit
        this.scheduler = new Timetable();
        // the toolbar with the buttons and stuff
        let toolbar = document.createElement('div');
        toolbar.style = "display: flex; justify-content: space-between;";
            // add semester button
            let addSemesterButton = document.createElement('button');    
            addSemesterButton.innerText = "Add Semester";
            addSemesterButton.onclick = this.scheduler.addSemester.bind(this.scheduler);
            
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

            // evalute profile button
            let evaluateButton = document.createElement('button');
            evaluateButton.innerText = "Evaluate Profile";
            evaluateButton.onclick = this.scheduler.evaluateProfile.bind(this.scheduler);
        toolbar.appendChild(addSemesterButton);
        toolbar.appendChild(addCoursesAndProgramsDiv);
        toolbar.appendChild(evaluateButton);
        // program manager - TODO
        // this.programManager = new programManager(); 

        this.appendChild(this.scheduler);
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
            let t = this.cs.childNodes[1];
            if (t.children.length > 0) { t.removeChild(t.childNodes[0]); }
            t.appendChild(ct);
        } else {
            console.log(`course '${id}' not found`);
        }
    }
}


customElements.define('depp-profile', Profile, {extends: 'div'});