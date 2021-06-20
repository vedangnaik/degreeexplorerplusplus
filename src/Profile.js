import { CourseSlotDiv } from "./CourseSlotDiv.js";
import { Scheduler } from "./Scheduler.js";

export class Profile extends HTMLDivElement {
    constructor() {
        super();

        // the timetable bit
        this.scheduler = new Scheduler();
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
                    let searchInput = document.createElement('input');
                    searchInput.type = "text";
                    searchInput.style = "flex: 1;"
                    let searchButton = document.createElement('button');
                    searchButton.innerText = "Search";
                    searchButton.style = "flex: 1;"
                controlsDiv.append(searchInput);
                controlsDiv.append(searchButton);
                // course slot
                let cs = new CourseSlotDiv();
            addCoursesAndProgramsDiv.appendChild(controlsDiv);
            addCoursesAndProgramsDiv.appendChild(cs);

            // evalute profile button
            let evaluateButton = document.createElement('button');
            evaluateButton.innerText = "Evaluate Profile";
            evaluateButton.onclick = this.scheduler.evaluateProfile.bind(this.scheduler);
        toolbar.appendChild(addSemesterButton);
        toolbar.appendChild(addCoursesAndProgramsDiv);
        toolbar.appendChild(evaluateButton);
        // this.programManager = new programManager(); 
        // TODO

        this.appendChild(this.scheduler);
        this.appendChild(toolbar);
        // this.appendChild(programManager);
    }
}


customElements.define('depp-profile', Profile, {extends: 'div'});