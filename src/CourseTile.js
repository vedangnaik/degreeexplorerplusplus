import { INCOMPLETE_COLOR, GLOBAL_COURSE_INFO_PANEL_ID, COMPLETE_COLOR, WARNING_COLOR, DELETE_SYMBOL, DELETE_COLOR } from "./Constants.js";
import CourseData from "../resources/CourseData.js";

export const PrerequisiteStatuses = Object.freeze({
    COMPLETE: Symbol("COMPLETE"),
    INCOMPLETE: Symbol("INCOMPLETE"),
    NA: Symbol("NA"),
    WARNING: Symbol("WARNING")
});

export class CourseTile extends HTMLDivElement {
    #evaluatedPrerequisites = {};

    constructor(courseID) {
        super();
        this.id = courseID;
        this.customTagName = "course-tile" // Used to quickly identify this div subclass among other divs
        this.style = `
            width: 8vw;
            background-color: lightblue;
            z-index: 1;
            display: flex;
        `;
            const courseName = document.createElement('h3');
            courseName.innerText = courseID;
            courseName.style = `
                width: 7vw;
                margin: auto;
                text-align: center;
            `;
            courseName.onclick = this.#displayPrerequisitesOnPanel.bind(this); // This needs to be bound here becuase otherwise clicking the delete button to remove the course also displays the course info lol
        this.appendChild(courseName);
            const deleteCourseButton = document.createElement('button');
            deleteCourseButton.innerText = DELETE_SYMBOL;
            deleteCourseButton.style = `
                width: 1vw;
                background-color: ${DELETE_COLOR};
            `;
            deleteCourseButton.onclick = this.deleteCourse.bind(this);
        this.appendChild(deleteCourseButton);

        // change the length if required
        this.courseLength = courseID[6];
        switch(this.courseLength) {
            case 'Y':
                this.style.height = "4vw";
                break;
            case 'H':
                this.style.height = "2vw";
                break;            
            default:
                this.style.height = "2vw";
                console.log(`Unsupported course length ${this.courseLength} for id ${this.id}. Defaulting to H`);
        }

        // Set the draggable event handlers
        this.draggable = true;
        this.ondragstart = this.#onDragStart.bind(this);
    }

    #displayPrerequisitesOnPanel() {
        document.getElementById(GLOBAL_COURSE_INFO_PANEL_ID).printPrereqisiteInfo(this.id, this.#evaluatedPrerequisites);
    }

    #onDragStart(ev) {
        ev.dataTransfer.effectAllowed = "move";
        ev.dataTransfer.setData("id", this.id);
        // The starting coordinates of the mouse pointer when the drag was started, relative to the top left of the tile. Used by the scrathpad to properly position dragged tiles.
        ev.dataTransfer.setData("dragstartx", ev.offsetX);
        ev.dataTransfer.setData("dragstarty", ev.offsetY);
    }

    deleteCourse() {
        // This appears to work but idk if it's legit or not
        this.parentElement.removeChild(this);
    }

    resetCourse() {
        this.#evaluatedPrerequisites = {};
        this.style.backgroundColor = "lightblue";
    }

    evaluatePrerequisites(courses, programs) {
        Object.keys(CourseData[this.id]["prerequisites"]).forEach(prereqID => {
            if (!(prereqID in this.#evaluatedPrerequisites)) { 
                recursiveEvaluatePrerequisite(this.id, prereqID, courses, programs, this.#evaluatedPrerequisites);
            }
        });

        const statuses = Object.values(this.#evaluatedPrerequisites);
        if (statuses.includes(PrerequisiteStatuses.INCOMPLETE)) {
            this.style.backgroundColor = INCOMPLETE_COLOR;
        } else if (statuses.includes(PrerequisiteStatuses.WARNING)) {
            this.style.backgroundColor = WARNING_COLOR;
        } else {
            this.style.backgroundColor = COMPLETE_COLOR;
        }

        return;

        /* 
        This is a super impure mildly recursive function which calculates the status for a given prerequisite and course. It modifies evaluatedPrequisites in-place with the status for prereqID.
        All comments describing the prereq countTypes and types are not guaranteed to be accurate.
        */
        function recursiveEvaluatePrerequisite(courseID, prereqID, scheduledCourses, scheduledPrograms, evaluatedPrerequisites) {
            // Quick exit case: this ID has already been evaluated, so there's no need to do it again.
            if (prereqID in evaluatedPrerequisites) {
                return;
            }

            const prerequisiteObj = CourseData[courseID].prerequisites[prereqID];

            // If it's a NOTE, then we can just mark it complete and exit
            if (prerequisiteObj.type === "NOTE") {
                evaluatedPrerequisites[prereqID] =  PrerequisiteStatuses.NA;
                return;
            }
        
            switch(prerequisiteObj.countType) {
            // REQUISITES place a requirement upon other requisites. These are currently the only type upon which the function recurses, in order to determine those.
            case 'REQUISITES':
                switch(prerequisiteObj.type) {
                // At least count requisites
                case 'MINIMUM':
                    let usedPrereqs = [];
                    let count = 0;
                    for (const dependent_prereqID of prerequisiteObj.requisiteItems) {
                        // Evaluate the dependent prereqID and check if it's acceptable
                        recursiveEvaluatePrerequisite(courseID, dependent_prereqID, scheduledCourses, scheduledPrograms, evaluatedPrerequisites);
                        if ([PrerequisiteStatuses.COMPLETE, PrerequisiteStatuses.WARNING].includes(evaluatedPrerequisites[dependent_prereqID])) {
                            usedPrereqs.push(dependent_prereqID);
                            count += 1;
                        }

                        if (prerequisiteObj.count <= count) {
                            // We must mark all the unused prerequisites as NA to indicate to the user which ones were used.
                            prerequisiteObj.requisiteItems
                                .filter(dependent_prereqID => !usedPrereqs.includes(dependent_prereqID))
                                .forEach(dependent_prereqID => evaluatedPrerequisites[dependent_prereqID] = PrerequisiteStatuses.NA);
                            
                            evaluatedPrerequisites[prereqID] = PrerequisiteStatuses.COMPLETE;
                            return;
                        }
                    }
                    evaluatedPrerequisites[prereqID] = PrerequisiteStatuses.INCOMPLETE;
                    return;
                // Unimplemented
                case 'MAXIMUM':
                    console.log(`${courseID}, ${prereqID}: Unimplemented type REQUISITE MAXIMUM`);
                    evaluatedPrerequisites[prereqID] = PrerequisiteStatuses.INCOMPLETE;
                    return;
                // Unimplemented
                case 'LIST':
                    console.log(`${courseID}, ${prereqID}: Unimplemented type REQUISITE LIST`);
                    evaluatedPrerequisites[prereqID] = PrerequisiteStatuses.INCOMPLETE;
                    return;
                // To handle unknown/unimplemented cases
                default:
                    console.log(`${courseID}, ${prereqID}: Unknown REQUISITE type: ${prerequisiteObj.type}`);
                    evaluatedPrerequisites[prereqID] = PrerequisiteStatuses.INCOMPLETE;
                    return;
                }
            
            // COURSES places a restriction upon the *number* of courses that can be taken from a list. The number of credits these courses add up to is immaterial.
            case 'COURSES':
                switch (prerequisiteObj.type) {
                // At least count courses
                case 'MINIMUM':
                    evaluatedPrerequisites[prereqID] = (prerequisiteObj.requisiteItems
                        .filter(dependent_courseID => 
                            dependent_courseID in scheduledCourses && 
                            scheduledCourses[courseID]["y"] < scheduledCourses[dependent_courseID]["y"])
                        .length >= prerequisiteObj.count) ? PrerequisiteStatuses.COMPLETE : PrerequisiteStatuses.INCOMPLETE;
                    return;
                // All of the courses in the list
                case 'LIST':
                    evaluatedPrerequisites[prereqID] = (prerequisiteObj.requisiteItems
                        .filter(dependent_courseID => 
                            !(dependent_courseID in scheduledCourses) || 
                            scheduledCourses[courseID]["y"] >= scheduledCourses[dependent_courseID]["y"])
                        .length === 0) ? PrerequisiteStatuses.COMPLETE : PrerequisiteStatuses.INCOMPLETE;
                    return;
                // To handle unknown/unimplemented cases
                default:
                    console.log(`${courseID}, ${prereqID}: Unknown COURSES type: ${prerequisiteObj.type}`);
                    evaluatedPrerequisites[prereqID] = PrerequisiteStatuses.INCOMPLETE;
                    return;
                }
            
                // FCES places a restriction upon the *number of credits* worth of courses that can be taken from a list.
            case 'FCES':
                switch (prerequisiteObj.type) {
                // At least count credits
                case 'MINIMUM': 
                    evaluatedPrerequisites[prereqID] = (prerequisiteObj.count <= prerequisiteObj.requisiteItems
                        .filter(dependent_courseID => 
                            dependent_courseID in scheduledCourses && 
                            scheduledCourses[courseID]["y"] < scheduledCourses[dependent_courseID]["y"])
                        .map(dependent_courseID => dependent_courseID[6] === 'H' ? 0.5 : 1)
                        .reduce((x, y) => x + y, 0)) ? PrerequisiteStatuses.COMPLETE : PrerequisiteStatuses.INCOMPLETE;
                    return;
                // All of the courses in the list
                case 'LIST':
                    evaluatedPrerequisites[prereqID] = (prerequisiteObj.requisiteItems
                        .filter(dependent_courseID => 
                            !(dependent_courseID in scheduledCourses) || 
                            scheduledCourses[courseID]["y"] >= scheduledCourses[dependent_courseID]["y"])
                        .length === 0) ? PrerequisiteStatuses.COMPLETE : PrerequisiteStatuses.INCOMPLETE;
                    return;
                // At most count credits
                case 'MAXIMUM':
                    evaluatedPrerequisites[prereqID] = (prerequisiteObj.count >= prerequisiteObj.requisiteItems
                        .filter(dependent_courseID => 
                            dependent_courseID in scheduledCourses && 
                            scheduledCourses[courseID]["y"] < scheduledCourses[dependent_courseID]["y"])
                        .map(dependent_courseID => dependent_courseID[6] === 'H' ? 0.5 : 1)
                        .reduce((x, y) => x + y, 0)) ? PrerequisiteStatuses.COMPLETE : PrerequisiteStatuses.INCOMPLETE;
                    return;
                // To handle unknown/unimplemented cases
                default:
                    console.log(`${courseID}, ${prereqID}: Unknown FCES type: ${prerequisiteObj.type}`);
                    evaluatedPrerequisites[prereqID] = PrerequisiteStatuses.INCOMPLETE;
                    return;
                }
                
            // GRADE places a requirement on the grade in a course. These cannot be determined without access to student grades. Hence, these are marked with a warning for manual checking by the user.
            case 'GRADE':
                evaluatedPrerequisites[prereqID] = PrerequisiteStatuses.WARNING;
                return;
            
            // POST places a requirement on enrollment in a specific program.
            case 'SUBJECT_POSTS':
                switch (prerequisiteObj.type) {
                // At least these programs
                case 'MINIMUM':
                    evaluatedPrerequisites[prereqID] = (prerequisiteObj.count <= prerequisiteObj.requisiteItems
                        .filter(dependent_programID => dependent_programID in scheduledPrograms)
                        .reduce((x, y) => x + y, 0)) ? PrerequisiteStatuses.COMPLETE : PrerequisiteStatuses.INCOMPLETE;
                    return;
                // To handle unknown/unimplemented cases
                default:
                    console.log(`${courseID}, ${prereqID}: Unknown SUBJECT_POSTS type: ${prerequisiteObj.type}`);
                    evaluatedPrerequisites[prereqID] = PrerequisiteStatuses.INCOMPLETE;
                    return;
                }
                
            // To handle unknown/unimplemented cases
            default:
                console.log(`${courseID}, ${prereqID}: Unknown COUNTTYPE: ${prerequisiteObj.countType}`);
                evaluatedPrerequisites[prereqID] = PrerequisiteStatuses.INCOMPLETE;
                return;
            }
        }
    }
}


customElements.define('depp-course-tile', CourseTile, {extends: 'div'});
