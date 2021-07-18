import { GlobalCourseScheduleID } from "./Constants.js";
import { CourseSlotDiv } from "./CourseSlotDiv.js";
import { CourseTile } from "./CourseTile.js";


export class CourseSchedule extends HTMLTableElement {
    static #headerStylesheet = `
        display: flex;
        width: 9vw; 
        height: 4vw;
        outline: 1px solid grey;
        background-color: lightgrey;
    `;
    static #latestAnchorYear = 2050;
    static #earliestAnchorYear = 1950;

    #tbody;
    #semesterSelect;
    #yearSelect;

    constructor() {
        super();
        this.id = GlobalCourseScheduleID;
        this.style = `
            border-collapse: collapse;
        `;
            this.#tbody = document.createElement('tbody');
                // The bottom row is fixed and unremovable. It contains the starting semester value upon which the labels of the other semesters are calculated
                const tr = document.createElement('tr');
                    const th = document.createElement('th');
                    th.style = CourseSchedule.#headerStylesheet;
                        const addSemesterButton = document.createElement('button');
                        addSemesterButton.innerText = '+';
                        addSemesterButton.style = `
                            flex: 1; 
                            background-color: forestgreen; 
                            font-weight: bold;
                        `;
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
                            for (let year = CourseSchedule.#latestAnchorYear; year >= CourseSchedule.#earliestAnchorYear; year--) {
                                const yearOption = document.createElement('option');
                                yearOption.style.backgroundColor = "white";
                                yearOption.value = year;
                                yearOption.innerText = year;
                                this.#yearSelect.appendChild(yearOption);
                            }
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
        this.appendChild(this.#tbody);
    }

    // This function converts the current state of the course schedule into JSON, which can be stored and loaded back later. We want the coordinates of all courses as well as the current value of the semesterSelect and yearSelect.
    getCourseScheduleJSON() {
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

    loadCourseScheduleJSON(scheduleJSON) {
        // Set the anchor year and semester
        this.#yearSelect.children[CourseSchedule.#latestAnchorYear - scheduleJSON["anchorYear"]].selected = "selected";
        this.#semesterSelect.value = scheduleJSON["anchorSemester"];

        // Filter out and delete the existing course-tiles 
        const divs = Array.prototype.slice.call(this.getElementsByTagName('div'));
        divs.filter(div => div.customTagName === "course-tile").forEach(courseTile => {
            courseTile.deleteCourse();
        });

        // Add or delete semesters until you've equalled the number of semesters in the timetableJSON
        const currentNumSemesters = this.#tbody.children.length;
        const newNumSemesters = scheduleJSON["numSemesters"];
        for (let _ = Math.min(currentNumSemesters, newNumSemesters); _ < Math.max(currentNumSemesters, newNumSemesters); _++) {
            if (currentNumSemesters < newNumSemesters) { this.#addSemester(); }
            else if (currentNumSemesters > newNumSemesters) { this.#deleteSemester(this.#tbody.children[0]); }
            else { /* do nothing, you're done. This should never happen in this loop */ }
        }

        // Add the new courses in
        Object.entries(scheduleJSON["scheduledCourses"]).forEach(([courseID, {x, y}]) => {
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
            th.style = CourseSchedule.#headerStylesheet;
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

    refreshCourses() {
        for (const courseTile of this.#tbody.getElementsByTagName('div')) {
            if (courseTile.customTagName === "course-tile") { courseTile.resetCourse(); }
        }
    }
}

customElements.define('depp-course-schedule', CourseSchedule, {extends: 'table'});