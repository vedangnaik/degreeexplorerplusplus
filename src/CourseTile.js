import CourseData from "../resources/CourseData.js";
import { GlobalCourseInfoPanelID } from "./CourseInfoPanel.js";

export const PrerequisiteStatuses = Object.freeze({
    COMPLETE: Symbol("COMPLETE"),
    INCOMPLETE: Symbol("INCOMPLETE"),
    NA: Symbol("NA"),
    WARNING: Symbol("WARNING")
});

export class CourseTile extends HTMLDivElement {
    #prerequisitesTracker = {};

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
            let courseName = document.createElement('h3');
            courseName.innerText = courseID;
            courseName.style = `
                flex: 9;
                margin: auto;
                text-align: center;
            `;
            courseName.onclick = this.#displayPrerequisitesOnPanel.bind(this); // This needs to be bound here becuase otherwise clicking the delete button to remove the course also displays the course info lol
        this.appendChild(courseName);
            let deleteCourseButton = document.createElement('button');
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

        // Set the draggable event handlers and sending prerequisites to the panel
        this.draggable = true;
        this.ondragstart = this.#onDragStart.bind(this);
    }

    #displayPrerequisitesOnPanel() {
        document.getElementById(GlobalCourseInfoPanelID).printPrereqisiteInfo(this.id, this.#prerequisitesTracker);
    }

    #onDragStart(ev) {
        ev.dataTransfer.effectAllowed = "move";
        ev.dataTransfer.setData("id", this.id);
        // for anyone who needs the starting coords
        // mainly for the scratchpad
        ev.dataTransfer.setData("dragstartx", ev.offsetX);
        ev.dataTransfer.setData("dragstarty", ev.offsetY);
    }

    deleteCourse() {
        // This appears to work but idk if it's legit or not
        this.parentElement.removeChild(this);
    }

    resetCourse() {
        this.#prerequisitesTracker = {};
        this.style.backgroundColor = "lightblue";
    }

    evaluatePrerequisites(courses, programs) {
        let prerequisites = CourseData[this.id]["prerequisites"];    
        Object.keys(prerequisites).forEach(prereqID => {
            if (!(prereqID in this.#prerequisitesTracker)) { 
                this.#prerequisitesTracker[prereqID] = recursiveEvaluatePrerequisite(this.id, prereqID, courses, programs);
            }
        });

        this.style.backgroundColor = "lightgreen";
        Object.entries(this.#prerequisitesTracker).forEach(([_, prereqStatus]) => {
            if (prereqStatus === PrerequisiteStatuses.INCOMPLETE) { 
                this.style.backgroundColor = "#ff8080";
                return;
            };
            if (prereqStatus === PrerequisiteStatuses.WARNING) { 
                this.style.backgroundColor = "lightyellow";
            }
        });


        function recursiveEvaluatePrerequisite(courseID, prereqID, scheduledCourses, scheduledPrograms) {
            let prerequisite = CourseData[courseID]["prerequisites"][prereqID]
        
            if (prerequisite.type === "NOTE") {
                return PrerequisiteStatuses.COMPLETE;
            }
        
            switch(prerequisite.countType) {
                case 'REQUISITES': {
                    switch(prerequisite.type) {
                        case 'MINIMUM': {
                            let usedPrereqs = [];
                            let count = 0;
                            for (let dependent_prereqID of prerequisite.requisiteItems) {
                                if (dependent_prereqID in prerequisitesTracker && prerequisitesTracker[dependent_prereqID]) {
                                    usedPrereqs.push(dependent_prereqID);
                                    count += 1;
                                } else if (recursiveEvaluatePrerequisite(courseID, dependent_prereqID, scheduledCourses, scheduledPrograms)) {
                                    usedPrereqs.push(dependent_prereqID);
                                    count += 1;
                                    prerequisitesTracker[dependent_prereqID] = PrerequisiteStatuses.COMPLETE;
                                } else {
                                    prerequisitesTracker[dependent_prereqID] = PrerequisiteStatuses.INCOMPLETE;
                                }
    
                                if (prerequisite.count <= count) {
                                    prerequisite.requisiteItems
                                        .filter(dependent_prereqID => !usedPrereqs.includes(dependent_prereqID))
                                        .forEach(dependent_prereqID => prerequisitesTracker[dependent_prereqID] = PrerequisiteStatuses.NA);
                                    return PrerequisiteStatuses.COMPLETE;
                                }
                            }
    
                            return PrerequisiteStatuses.INCOMPLETE;
                        }
                        case 'MAXIMUM': {
                            console.log('REQUISITE MAXIMUM');
                            return PrerequisiteStatuses.INCOMPLETE;
                        }
                        case 'LIST': {
                            console.log('REQUISITE LIST');
                            return PrerequisiteStatuses.INCOMPLETE;
                        }
                        default: {
                            console.log('Unknown REQUISITE type: ' + prerequisite.type);
                            return PrerequisiteStatuses.INCOMPLETE;
                        }
                    }
                }
                case 'COURSES': // Don't ask me why there is more than one label for this :(
                case 'FCES': {
                    switch (prerequisite.type) {
                        case 'MINIMUM': {
                            return (prerequisite.count <= prerequisite.requisiteItems
                                .filter(dependent_courseID => 
                                    dependent_courseID in scheduledCourses && 
                                    scheduledCourses[courseID]["y"] < scheduledCourses[dependent_courseID]["y"])
                                .map(dependent_courseID => dependent_courseID[6] === 'H' ? 0.5 : 1)
                                .reduce((x, y) => x + y, 0)) ? PrerequisiteStatuses.COMPLETE : PrerequisiteStatuses.INCOMPLETE;
                        }
                        case 'LIST': {
                            return (prerequisite.requisiteItems.filter(dependent_courseID => { 
                                return !(dependent_courseID in scheduledCourses && scheduledCourses[courseID]["y"] < scheduledCourses[dependent_courseID]["y"]);
                            }).length === 0) ? PrerequisiteStatuses.COMPLETE : PrerequisiteStatuses.INCOMPLETE;
                        }
                        case 'MAXIMUM': {
                            return (prerequisite.count >= prerequisite.requisiteItems
                                .filter(dependent_courseID => 
                                    dependent_courseID in scheduledCourses && 
                                    scheduledCourses[courseID]["y"] < scheduledCourses[dependent_courseID]["y"])
                                .map(dependent_courseID => dependent_courseID[6] === 'H' ? 0.5 : 1)
                                .reduce((x, y) => x + y, 0)) ? PrerequisiteStatuses.COMPLETE : PrerequisiteStatuses.INCOMPLETE;
                        }
                        default: {
                            console.log('Unknown FCES type: ' + prerequisites.type);
                            return PrerequisiteStatuses.INCOMPLETE;
                        }
                    }
                }
                case 'GRADE': {
                    return PrerequisiteStatuses.WARNING;
                }
                case 'SUBJECT_POSTS': {
                    switch (prerequisite.type) {
                        case 'MINIMUM': {
                            return (prerequisite.count <= prerequisite.requisiteItems
                                .filter(dependent_programID => dependent_programID in scheduledPrograms)
                                .reduce((x, y) => x + y, 0)) ? PrerequisiteStatuses.COMPLETE : PrerequisiteStatuses.INCOMPLETE;
                        }
                        default: {
                            console.log('Unknown subject post type: ' + prerequisite.type);
                            return PrerequisiteStatuses.INCOMPLETE;
                        }
                    }
                }
                default: {
                    console.log(`Unknown countType: ${prerequisite.countType}`);
                    return PrerequisiteStatuses.INCOMPLETE;
                }
            }
        }
    }
}


customElements.define('depp-course-tile', CourseTile, {extends: 'div'});
