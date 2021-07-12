import { GlobalCourseInfoPanelID } from "./Constants.js";
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
                flex: 9;
                margin: auto;
                text-align: center;
            `;
            courseName.onclick = this.#displayPrerequisitesOnPanel.bind(this); // This needs to be bound here becuase otherwise clicking the delete button to remove the course also displays the course info lol
        this.appendChild(courseName);
            const deleteCourseButton = document.createElement('button');
            deleteCourseButton.innerText = '✖';
            deleteCourseButton.style = `
                flex: 1;
                background-color: #ff4d4d;
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
        document.getElementById(GlobalCourseInfoPanelID).printPrereqisiteInfo(this.id, this.#evaluatedPrerequisites);
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
        const prerequisites = CourseData[this.id]["prerequisites"];    
        Object.keys(prerequisites).forEach(prereqID => {
            if (!(prereqID in this.#evaluatedPrerequisites)) { 
                recursiveEvaluatePrerequisite(this.id, prereqID, courses, programs, this.#evaluatedPrerequisites);
            }
        });

        const statuses = Object.values(this.#evaluatedPrerequisites);
        if (statuses.includes(PrerequisiteStatuses.INCOMPLETE)) {
            this.style.backgroundColor = "#ff8080";
        } else if (statuses.includes(PrerequisiteStatuses.WARNING)) {
            this.style.backgroundColor = "lightyellow";
        } else {
            this.style.backgroundColor = "lightgreen";
        }

        return;

        /* 
        This is a super impure mildly recursive function which calculates the status for a given prerequisite and course.
        It modifies evaluatedPrequisites in-place with the status for prereqID
        */
        function recursiveEvaluatePrerequisite(courseID, prereqID, scheduledCourses, scheduledPrograms, evaluatedPrerequisites) {
            // Quick exit case: this ID has already been evaluated, so there's no need to do it again.
            if (prereqID in evaluatedPrerequisites) {
                return;
            }

            const prerequisiteObj = CourseData[courseID].prerequisites[prereqID];

            // If it's a NOTE, then we can just mark it complete and exit
            if (prerequisiteObj.type === "NOTE") {
                evaluatedPrerequisites[prereqID] =  PrerequisiteStatuses.COMPLETE;
                return;
            }
        
            switch(prerequisiteObj.countType) {
                case 'REQUISITES': {
                    switch(prerequisiteObj.type) {
                        case 'MINIMUM': {
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
                                    // return early to not waste time
                                    return;
                                }
                            }
    
                            evaluatedPrerequisites[prereqID] = PrerequisiteStatuses.INCOMPLETE;
                            return;
                        }
                        case 'MAXIMUM': {
                            console.log(`${courseID}, ${prereqID}: Unimplemented type REQUISITE MAXIMUM`);
                            evaluatedPrerequisites[prereqID] = PrerequisiteStatuses.INCOMPLETE;
                            return;
                        }
                        case 'LIST': {
                            console.log(`${courseID}, ${prereqID}: Unimplemented type REQUISITE LIST`);
                            evaluatedPrerequisites[prereqID] = PrerequisiteStatuses.INCOMPLETE;
                            return;
                        }
                        default: {
                            console.log(`${courseID}, ${prereqID}: Unknown REQUISITE type: ${prerequisiteObj.type}`);
                            evaluatedPrerequisites[prereqID] = PrerequisiteStatuses.INCOMPLETE;
                            return;
                        }
                    }
                }
                case 'COURSES': // Don't ask me why there is more than one label for this :(
                case 'FCES': {
                    switch (prerequisiteObj.type) {
                        case 'MINIMUM': {
                            evaluatedPrerequisites[prereqID] = (prerequisiteObj.count <= prerequisiteObj.requisiteItems
                                .filter(dependent_courseID => 
                                    dependent_courseID in scheduledCourses && 
                                    scheduledCourses[courseID]["y"] < scheduledCourses[dependent_courseID]["y"])
                                .map(dependent_courseID => dependent_courseID[6] === 'H' ? 0.5 : 1)
                                .reduce((x, y) => x + y, 0)) ? PrerequisiteStatuses.COMPLETE : PrerequisiteStatuses.INCOMPLETE;
                            return;
                        }
                        case 'LIST': {
                            evaluatedPrerequisites[prereqID] = (prerequisiteObj.requisiteItems
                                .filter(dependent_courseID => 
                                    !(dependent_courseID in scheduledCourses) || 
                                    scheduledCourses[courseID]["y"] < scheduledCourses[dependent_courseID]["y"])
                                .length === 0) ? PrerequisiteStatuses.COMPLETE : PrerequisiteStatuses.INCOMPLETE;
                            return;
                        }
                        case 'MAXIMUM': {
                            evaluatedPrerequisites[prereqID] = (prerequisiteObj.count >= prerequisiteObj.requisiteItems
                                .filter(dependent_courseID => 
                                    dependent_courseID in scheduledCourses && 
                                    scheduledCourses[courseID]["y"] < scheduledCourses[dependent_courseID]["y"])
                                .map(dependent_courseID => dependent_courseID[6] === 'H' ? 0.5 : 1)
                                .reduce((x, y) => x + y, 0)) ? PrerequisiteStatuses.COMPLETE : PrerequisiteStatuses.INCOMPLETE;
                            return;
                        }
                        default: {
                            console.log(`${courseID}, ${prereqID}: Unknown FCES type: ${prerequisiteObj.type}`);
                            evaluatedPrerequisites[prereqID] = PrerequisiteStatuses.INCOMPLETE;
                            return;
                        }
                    }
                }
                case 'GRADE': {
                    evaluatedPrerequisites[prereqID] = PrerequisiteStatuses.WARNING;
                    return;
                }
                case 'SUBJECT_POSTS': {
                    switch (prerequisiteObj.type) {
                        case 'MINIMUM': {
                            evaluatedPrerequisites[prereqID] = (prerequisiteObj.count <= prerequisiteObj.requisiteItems
                                .filter(dependent_programID => dependent_programID in scheduledPrograms)
                                .reduce((x, y) => x + y, 0)) ? PrerequisiteStatuses.COMPLETE : PrerequisiteStatuses.INCOMPLETE;
                            return;
                        }
                        default: {
                            console.log(`${courseID}, ${prereqID}: Unknown SUBJECT_POSTS type: ${prerequisiteObj.type}`);
                            evaluatedPrerequisites[prereqID] = PrerequisiteStatuses.INCOMPLETE;
                            return;
                        }
                    }
                }
                default: {
                    console.log(`${courseID}, ${prereqID}: Unknown COUNTTYPE: ${prerequisiteObj.countType}`);
                    evaluatedPrerequisites[prereqID] = PrerequisiteStatuses.INCOMPLETE;
                    return;
                }
            }
        }
    }
}


customElements.define('depp-course-tile', CourseTile, {extends: 'div'});
