export class CourseTile extends HTMLDivElement {
    static courseTileStylesheet = `
        overflow: hidden;
        width: 8vw;
        height: 2vw;
        background-color: grey;
        border-radius: 7px;
        z-index: 1;
        display: flex;
    `;

    static courseNameStylesheet = `
        flex: 11;
        margin: auto;
        text-align: center;
    `;

    static deleteCourseButtonStylesheet = `
        flex: 1;
        background-color: #ff4d4d;
    `;

    constructor(courseID) {
        super();
        this.id = courseID;
        this.customTagName = "course-tile"
        this.style = CourseTile.courseTileStylesheet;
        this.draggable = true;
        this.ondragstart = this.onDragStart.bind(this);

        // course name header
        let courseName = document.createElement('h3');
        courseName.innerText = courseID;
        courseName.style = CourseTile.courseNameStylesheet;
        let deleteCourseButton = document.createElement('button');
        deleteCourseButton.innerText = '✖';
        deleteCourseButton.style = CourseTile.deleteCourseButtonStylesheet;
        deleteCourseButton.onclick = this.deleteCourse.bind(this);
        this.appendChild(courseName);
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
                console.log("Unsupported course length, defaulting to 'H'");
        }
    }

    onDragStart(ev) {
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

    evaluatePrerequisites(courses, programs) {
        let prerequisites = CourseData["CSC488H1"]["prerequisites"];
        let prerequisitesTracker = {}
    
        for (let prereqID in prerequisites) {
            if (!(prereqID in prerequisitesTracker)) { 
                prerequisitesTracker[prereqID] = recursiveEvaluatePrerequisite(courses, programs, prereqID);
            }
        }
    
        return prerequisitesTracker; // TODO use this to change the colour and return true/false
    
        function recursiveEvaluatePrerequisite(courses, programs, prereqID) {
            let prerequisite = prerequisites[prereqID]
        
            if (prerequisite.type == "NOTE") {
                return true;
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
                                } else if (recursiveEvaluatePrerequisite(courses, prerequisites, dependent_prereqID)) {
                                    usedPrereqs.push(dependent_prereqID);
                                    count += 1;
                                    prerequisitesTracker[dependent_prereqID] = true;
                                } else {
                                    prerequisitesTracker[dependent_prereqID] = false;
                                }
    
                                if (count >= prerequisite.count) {
                                    prerequisite.requisiteItems
                                        .filter(dependent_prereqID => !usedPrereqs.includes(dependent_prereqID))
                                        .forEach(dependent_prereqID => prerequisitesTracker[dependent_prereqID] = 'N/A');
                                    return true;
                                }
                            }
    
                            return false;
                        }
                        case 'MAXIMUM': {
                            console.log('prereq maximum');
                            return false;
                        }
                        case 'LIST': {
                            console.log('prereq list');
                            return false;
                        }
                        default: {
                            console.log('prereq unknown type: ' + prerequisite.type);
                            return false;
                        }
                    }
                }
                case 'FCES': {
                    switch (prerequisite.type) {
                        case 'MINIMUM': {
                            return prerequisite.count >= prerequisite.requisiteItems
                                .filter(courseID => courseID in courses)
                                .map(courseID => courseID[6] == 'H' ? 0.5 : 1)
                                .reduce((x, y) => x + y, 0);
                        }
                        case 'LIST': {
                            return prerequisite.requisiteItems.filter(courseID => !(courseID in courses)).length == 0;
                        }
                        case 'MAXIMUM': {
                            return prerequisite.count <= prerequisite.requisiteItems
                                .filter(courseID => courseID in courses)
                                .map(courseID => courseID[6] == 'H' ? 0.5 : 1)
                                .reduce((x, y) => x + y, 0);
                        }
                        default: {
                            console.log('unknown fces type: ' + prerequisites.type);
                            return false;
                        }
                    }
                }
                case 'GRADES': {
                    return true;
                }
                case 'SUBJECT_POSTS': {
                    switch (prerequisite.type) {
                        case 'MINIMUM': {
                            return prerequisite.count >= prerequisite.requisiteItems
                                .filter(postID => postID in programs)
                                .reduce((x, y) => x + y, 0);
                        }
                        default: {
                            console.log('unknown subject post type: ' + prerequisite.type);
                            return false;
                        }
                    }
                }
                default: {
                    console.log(prerequisite.countType);
                }
            }
        }
    }
}


customElements.define('depp-course-tile', CourseTile, {extends: 'div'});
