import CourseData from "../resources/CourseData.js";
import { GlobalCourseInfoPanelID } from "./CourseInfoPanel.js";
import { CourseSlotDiv } from "./CourseSlotDiv.js";
import { CourseTile } from "./CourseTile.js";

export const GlobalTimetableID = "globalTimetableInstance";

// This is a generic empty timetableJSON structure created here to back up new profiles. It is not connected to the actual timetable class in any way. This is to keep the two classes as separated as possible.
export const NewProfileTimetableJSON = {
    "anchorSemester": "Fall/Winter",
    "anchorYear": new Date().getFullYear(),
    "numSemesters": 4,
    "scheduledCourses": {}
}

export class Timetable extends HTMLTableElement {
    static #headerStylesheet = `
        display: flex;
        width: 9vw; 
        height: 4vw;
        outline: 1px solid #909090;
        background-color: lightgrey;
    `;
    static #latestAnchorYear = 2050;
    static #earliestAnchorYear = 1950;

    #tbody;
    #semesterSelect;
    #yearSelect;
    #semesterObserver;

    constructor() {
        super();
        this.id = GlobalTimetableID;
        this.#tbody = document.createElement('tbody');
        this.appendChild(this.#tbody);

        // The bottom row is fixed and unremovable. It contains the starting semester value upon which the labels of the other semesters are calculated
        const tr = document.createElement('tr');
            const th = document.createElement('th');
            th.style = Timetable.#headerStylesheet;
                const addSemesterButton = document.createElement('button');
                addSemesterButton.innerText = '+';
                addSemesterButton.style = "flex: 1; background-color: forestgreen; font-weight: bold;"
                addSemesterButton.onclick = this.#addSemester.bind(this);
            th.appendChild(addSemesterButton);
                // This div is responsible for centering the two selectors on top of each other.
                const selectDiv = document.createElement('div');
                selectDiv.style = `
                    flex: 9; 
                    margin: auto;
                `;
                    this.#semesterSelect = document.createElement('select');
                    this.#semesterSelect.style = `
                        margin-left: auto;
                        background-color: transparent;
                        text-align-last: center;
                        font-weight: bold;
                        font-size: 0.83em;
                    `;
                        // Option for fall/winter
                        const fallWinterOption = document.createElement('option');
                        fallWinterOption.style.backgroundColor = "white";
                        fallWinterOption.value = "Fall/Winter";
                        fallWinterOption.innerText = "Fall/Winter";
                        // Option for summer
                        const summerOption = document.createElement('option');
                        summerOption.style.backgroundColor = "white";
                        summerOption.value = "Summer";
                        summerOption.innerText = "Summer";
                    this.#semesterSelect.appendChild(fallWinterOption);
                    this.#semesterSelect.appendChild(summerOption);
                    this.#semesterSelect.onchange = this.#refreshSemsters.bind(this);
                selectDiv.appendChild(this.#semesterSelect);
                    this.#yearSelect = document.createElement('select');
                    this.#yearSelect.style = `
                        margin-right: auto;
                        background-color: transparent;
                        text-align-last: center;
                        font-weight: bold;
                        font-size: 0.83em;
                    `;
                    for (let year = Timetable.#latestAnchorYear; year >= Timetable.#earliestAnchorYear; year--) {
                        const yearOption = document.createElement('option');
                        yearOption.style.backgroundColor = "white";
                        yearOption.value = year;
                        yearOption.innerText = year;
                        this.#yearSelect.appendChild(yearOption);
                    }
                    // rely on ordering of children to correctly set the option of the current year to default
                    this.#yearSelect.children[Timetable.#latestAnchorYear - new Date().getFullYear()].selected = "selected";
                    this.#yearSelect.onchange = this.#refreshSemsters.bind(this);
                selectDiv.appendChild(this.#yearSelect);
            th.appendChild(selectDiv);
        tr.appendChild(th);
        
        // add 6 course slot containers
        for (let _ = 0; _ < 6; _++) {
            const td = document.createElement('td');
            td.appendChild(new CourseSlotDiv());
            tr.appendChild(td);
        }
        this.#tbody.appendChild(tr);

        this.loadTimetableJSON(NewProfileTimetableJSON);

        // We use one observer on the tbody to tell us if any courses get moved around. If that happens, we reset the all the courses and clear the info panel.
        this.#semesterObserver = new MutationObserver(this.#refreshCoursesAndPanel.bind(this));
        this.#semesterObserver.observe(this.#tbody, { childList: true, subtree: true });
    }

    // This function converts the current state of the timetable into JSON, which can be stored and loaded back later. We want the coordiantes of all courses as well as the current value of the semesterSelect and yearSelect.
    getTimetableJSON() {
        let scheduledCourses = {};
        const semesterTrs = Array.prototype.slice.call(this.getElementsByTagName('tr'));
        const divs = Array.prototype.slice.call(this.getElementsByTagName('div'));

        // Filter out only the course-tiles 
        divs.filter(div => div.customTagName === "course-tile").forEach(courseTile => {
            const semesterTr = courseTile.closest('tr');
            const semesterTd = courseTile.closest('td');
            // The 'top' of the grid (0, 0) is the top left cell of the timetable. Although this means that the latest semester has a lower y coordinate, it makes calculations a bit simpler.
            // Get the y-coordinate - The base number is twice the row number, since each table tr contains two semesters
            let yCoord = 2 * semesterTrs.indexOf(semesterTr);
            // If the course is year-long, then it will be counted as the lower semester
            // Otherwise, we ask the CourseSlotContainer what slot this course is in, and add that to the base.
            yCoord += (courseTile.courseLength === 'Y') ? 1 : courseTile.parentElement.parentElement.getSlotNumber(courseTile);
            // Get the x coordinate - This doesn't make a difference to anything, it's only for stylistic purposes
            const xCoord = Array.prototype.slice.call(semesterTr.children).indexOf(semesterTd);

            scheduledCourses[courseTile.id] = {
                "x": xCoord,
                "y": yCoord
            };
        });

        // Append the anchor semester and year before returning
        return {
            "anchorSemester": this.#semesterSelect.value,
            "anchorYear": parseInt(this.#yearSelect.value),
            "numSemesters": this.#tbody.children.length,
            "scheduledCourses": scheduledCourses
        };
    }

    loadTimetableJSON(timetableJSON) {
        // Set the anchor year and semester
        this.#yearSelect.children[Timetable.#latestAnchorYear - timetableJSON["anchorYear"]].selected = "selected";
        this.#semesterSelect.value = timetableJSON["anchorSemester"];

        // Filter out and delete the existing course-tiles 
        const divs = Array.prototype.slice.call(this.getElementsByTagName('div'));
        divs.filter(div => div.customTagName === "course-tile").forEach(courseTile => {
            courseTile.parentElement.removeChild(courseTile);
        });

        // Add or delete semesters until you've equalled the number of semesters in the timetableJSON
        const currentNumSemesters = this.#tbody.children.length;
        const newNumSemesters = timetableJSON["numSemesters"];
        for (let _ = Math.min(currentNumSemesters, newNumSemesters); _ < Math.max(currentNumSemesters, newNumSemesters); _++) {
            if (currentNumSemesters < newNumSemesters) { this.#addSemester(); }
            else if (currentNumSemesters > newNumSemesters) { this.#deleteSemester(this.#tbody.children[0]); }
            else { /* do nothing, you're done. This should never happen in this loop */ }
        }

        // Add the new courses in
        Object.entries(timetableJSON["scheduledCourses"]).forEach(([courseID, {x, y}]) => {
            console.log(`${courseID} at ${x}, ${y}`);

            const td = this.#tbody.children[Math.floor(y/2)].children[x];
            const courseSlot = td.children[0];
            const newCourse = new CourseTile(courseID);
            y % 2 === 0 ? courseSlot.upperSlot.appendChild(newCourse) : courseSlot.lowerSlot.appendChild(newCourse);
        });

        // Refresh to get everyone caught up
        this.#refreshSemsters();
    }

    #addSemester() {
        const tr = document.createElement('tr');
            const th = document.createElement('th');
            th.style = Timetable.#headerStylesheet;
                const deleteSemesterButton = document.createElement('button');
                deleteSemesterButton.innerText = '✖';
                deleteSemesterButton.style = `
                    flex: 1;
                    background-color: #ff4d4d;
                `;
                deleteSemesterButton.onclick = this.#deleteSemester.bind(this, tr);
            th.appendChild(deleteSemesterButton);
                let semesterName = document.createElement('h5');
                semesterName.style = `
                    flex: 9;
                    margin: auto;
                `;
            th.appendChild(semesterName);
        tr.appendChild(th);

        for (let _ = 0; _ < 6; _++) {
            const td = document.createElement('td');
            td.appendChild(new CourseSlotDiv());
            tr.appendChild(td);
        }

        // Add the row to the top of the table so that the bottom one isn't disturbed
        this.#tbody.insertBefore(tr, this.#tbody.firstChild);

        this.#refreshSemsters();
    }

    #deleteSemester(tr) {
        this.#tbody.removeChild(tr);
        this.#refreshSemsters();
    }

    #refreshSemsters() {
        const semesters = this.#tbody.children;
        const anchorSemester = this.#semesterSelect.value;
        const anchorYear = parseInt(this.#yearSelect.value);

        for (let i = 1; i < semesters.length; i++) {
            const semester = semesters[semesters.length - 1 - i];
            const semesterHeader = semester.children[0];
            
            if (anchorSemester === 'Fall/Winter') {
                semesterHeader.children[1].innerText = i % 2 === 0 ?
                    `Fall/Winter ${anchorYear + (i / 2)}` :
                    `Summer ${anchorYear + Math.ceil(i / 2)}`;
            } else {
                semesterHeader.children[1].innerText = i % 2 === 0 ? 
                    `Summer ${anchorYear + (i / 2)}` : 
                    `Fall/Winter ${anchorYear + Math.ceil(i / 2)}`;
            }
        }
    }

    #refreshCoursesAndPanel() {
        for (const courseTile of this.#tbody.getElementsByTagName('div')) {
            if (courseTile.customTagName === "course-tile") { courseTile.resetCourse(); }
        }
        document.getElementById(GlobalCourseInfoPanelID).resetPanel();
    }
}

customElements.define('depp-timetable', Timetable, {extends: 'table'});