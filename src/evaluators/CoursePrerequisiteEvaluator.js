import { STATUSES } from "../Constants.js";
import { CourseData, CourseCategoriesData } from "../../resources/__exports__.js";


function getValidScheduledCoursesForPrerequisite(courses, categories, scheduledCoursesArray) {
    // First, we check that all the course categories are valid. If even one isn't, we can't be sure of this anyway
    for (const categoryID of categories) {
        if (!(categoryID in CourseCategoriesData && CourseCategoriesData[categoryID]["validatable"])) {
            return null
        }
    }

    let validScheduledCourses = []
    // Now, we apply each category's regex to all the scheduledcourses and extract the applicable ones
    categories.forEach(categoryID => {
        const regexObj = new RegExp(CourseCategoriesData[categoryID]["regex"])
        validScheduledCourses = validScheduledCourses.concat(scheduledCoursesArray.filter(courseID => regexObj.test(courseID)));
    })
    // Next, we filter everything from courses which is also in scheduledCoursesArray
    validScheduledCourses = validScheduledCourses.concat(courses.filter(courseID => scheduledCoursesArray.includes(courseID)))

    return validScheduledCourses;
}

export function evaluateCoursePrerequisite(courseID, prereqID, scheduledCourses, scheduledPrograms) {
    const prerequisiteObj = CourseData[courseID].prerequisites[prereqID];
    switch(prerequisiteObj.type) {
        case "UNVERIFIABLE": {
            return {
                [prereqID]: STATUSES.UNVERIFIABLE
            }
        }
        case "NOTE": {
            return {
                [prereqID]: STATUSES.NOTE
            }
        }
        case "REQUISITES_MIN": {
            // Evaluate all dependent prerequisites first
            let dependentPrereqs = {};
            for (const dependentPrereqID of prerequisiteObj["dependentPrereqs"]) {
                dependentPrereqs = {...dependentPrereqs, ...evaluateCoursePrerequisite(courseID, dependentPrereqID, scheduledCourses, scheduledPrograms)};
            }
            // Check if enough are complete to pass
            let usedPrereqs = []
            let count = 0;
            for (const dependentPrereqID of prerequisiteObj["dependentPrereqs"]) {
                if (dependentPrereqs[dependentPrereqID] !== STATUSES.INCOMPLETE && dependentPrereqs[dependentPrereqID] !== STATUSES.UNIMPLEMENTED) {
                    usedPrereqs.push(dependentPrereqID);
                    count += 1
                }

                if (prerequisiteObj.count <= count) { break; }
            }
            // Mark others NA if so
            if (prerequisiteObj["count"] <= count) {
                for (const dependentPrereqID of prerequisiteObj["dependentPrereqs"]) {
                    if (!usedPrereqs.includes(dependentPrereqID)) {
                        dependentPrereqs[dependentPrereqID] = STATUSES.NA;
                    }
                }
                return {
                    ...dependentPrereqs,
                    [prereqID]: STATUSES.COMPLETE
                };
            } else {
                return {
                    ...dependentPrereqs,
                    [prereqID]: STATUSES.INCOMPLETE
                }
            }
        }
        case "COURSES_MIN-RECURS": {
            let dependentPrereqs = {};
            const validScheduledCourses = getValidScheduledCoursesForPrerequisite(prerequisiteObj["courses"], prerequisiteObj["categories"], Object.keys(scheduledCourses));
            // If this one itself cannot be verified, mark all as unverifiable
            if (validScheduledCourses === null) {
                prerequisiteObj["dependentPrereqs"].forEach(dependentPrereqID => {
                    dependentPrereqs[dependentPrereqID] = STATUSES.UNVERIFIABLE;
                });
                return {
                    ...dependentPrereqs,
                    [prereqID]: STATUSES.UNVERIFIABLE
                }
            } else {
                let tentativeCourses = validScheduledCourses
                    .filter(dependentCourseID => scheduledCourses[courseID]["y"] < scheduledCourses[dependentCourseID]["y"]);
                // Get only that subset of scheduledCourses which includes those that are valid for this prereq. We ensure that this course's ID is kept in the scheduled list since it's being passes down one more stack.
                let tentativeScheduledCourses = Object.fromEntries(Object.entries(scheduledCourses)
                    .filter(([courseID, _]) => tentativeCourses.includes(courseID)));
                tentativeScheduledCourses[courseID] = scheduledCourses[courseID];
                // Pass this to every dependent prereq for further checks.
                for (const dependentPrereqID of prerequisiteObj["dependentPrereqs"]) {
                    dependentPrereqs = {...dependentPrereqs, ...evaluateCoursePrerequisite(courseID, dependentPrereqID, tentativeScheduledCourses, scheduledPrograms)}
                }
                // Note: Here, we do not change the status of the parent prereq even if its children have failed. This is because the prereq description usually doesn't indicate a relationship between them. TODO: Perhaps it'd be best to add a 'courses used' column to the prereqs as well?
                return {
                    ...dependentPrereqs,
                    [prereqID]: tentativeCourses.length >= prerequisiteObj["count"] ? 
                        STATUSES.COMPLETE:
                        STATUSES.INCOMPLETE
                };
            }
        }
        case "COURSES_GROUPMIN":
        case "COURSES_MIN": {
            const validScheduledCourses = getValidScheduledCoursesForPrerequisite(prerequisiteObj["courses"], prerequisiteObj["categories"], Object.keys(scheduledCourses));
            if (validScheduledCourses === null) {
                return {
                    [prereqID]: STATUSES.UNVERIFIABLE
                }
            } else {
                return {
                    [prereqID]: validScheduledCourses
                        .filter(dependentCourseID => scheduledCourses[courseID]["y"] < scheduledCourses[dependentCourseID]["y"])
                        .length >= prerequisiteObj["count"] ?
                        STATUSES.COMPLETE : 
                        STATUSES.INCOMPLETE
                }
            }
        }
        case "COURSES_LIST": {
            const validScheduledCourses = getValidScheduledCoursesForPrerequisite(prerequisiteObj["courses"], prerequisiteObj["categories"], Object.keys(scheduledCourses));
            if (validScheduledCourses === null) {
                return {
                    [prereqID]: STATUSES.UNVERIFIABLE
                }
            } else {
                let tentativeCourses = validScheduledCourses
                    .filter(dependent_courseID => scheduledCourses[courseID]["y"] < scheduledCourses[dependent_courseID]["y"]);
                let satisfied = true;
                // Check that every course listed is present here.
                for (const courseID of prerequisiteObj["courses"]) {
                    if (!tentativeCourses.includes(courseID)) { 
                        satisfied = false;
                        break;
                    }
                }
                // Currently, none of the prerequisites which use COURSES_LIST use the categories. Thus, they are ignored here.

                return {
                    // We map each course see if it's in the tentative list which has been filtered, then and all of them together to ensure they're all there.
                    [prereqID]: satisfied ? 
                            STATUSES.COMPLETE :
                            STATUSES.INCOMPLETE
                };
            }
        }
        case "FCES_GROUPMIN":
        case "FCES_MIN": {
            const validScheduledCourses = getValidScheduledCoursesForPrerequisite(prerequisiteObj["courses"], prerequisiteObj["categories"], Object.keys(scheduledCourses));
            if (validScheduledCourses === null) {
                return {
                    [prereqID]: STATUSES.UNVERIFIABLE
                }
            } else {
                return {
                    [prereqID]: (prerequisiteObj["count"] <= validScheduledCourses
                        .filter(dependentCourseID => scheduledCourses[courseID]["y"] < scheduledCourses[dependentCourseID]["y"])
                        .map(dependentCourseID => dependentCourseID[6] === 'H' ? 0.5 : 1)
                        .reduce((x, y) => x + y, 0)) ? 
                            STATUSES.COMPLETE : 
                            STATUSES.INCOMPLETE
                }
            }
        }
        // This is very similar to COURSES_MIN-RECURS: see it for more details.
        case "FCES_MIN-RECURS": {
            let dependentPrereqs = {};
            const validScheduledCourses = getValidScheduledCoursesForPrerequisite(prerequisiteObj["courses"], prerequisiteObj["categories"], Object.keys(scheduledCourses));
            // If this one itself cannot be verified, mark all as unverifiable
            if (validScheduledCourses === null) {
                prerequisiteObj["dependentPrereqs"].forEach(dependentPrereqID => {
                    dependentPrereqs[dependentPrereqID] = STATUSES.UNVERIFIABLE;
                });
                return {
                    ...dependentPrereqs,
                    [prereqID]: STATUSES.UNVERIFIABLE
                }
            } else {
                let tentativeCourses = validScheduledCourses
                    .filter(dependentCourseID => scheduledCourses[courseID]["y"] < scheduledCourses[dependentCourseID]["y"]);
                let tentativeScheduledCourses = Object.fromEntries(Object.entries(scheduledCourses)
                    .filter(([courseID, _]) => tentativeCourses.includes(courseID)));
                tentativeScheduledCourses[courseID] = scheduledCourses[courseID];
                // Pass this to every dependent prereq for further checks.
                for (const dependentPrereqID of prerequisiteObj["dependentPrereqs"]) {
                    dependentPrereqs = {...dependentPrereqs, ...evaluateCoursePrerequisite(courseID, dependentPrereqID, tentativeScheduledCourses, scheduledPrograms)}
                }
                return {
                    ...dependentPrereqs,
                    [prereqID]: tentativeCourses
                        .map(dependentCourseID => dependentCourseID[6] === 'H' ? 0.5 : 1)
                        .reduce((x, y) => x + y, 0) >= prerequisiteObj["count"] ? 
                            STATUSES.COMPLETE:
                            STATUSES.INCOMPLETE
                };
            }
        }
        case "FCES_LIST": {
            const validScheduledCourses = getValidScheduledCoursesForPrerequisite(prerequisiteObj["courses"], prerequisiteObj["categories"], Object.keys(scheduledCourses));
            if (validScheduledCourses === null) {
                return {
                    [prereqID]: STATUSES.UNVERIFIABLE
                }
            } else {
                // TODO: Currently, we do not check if every course in the categories is satisfied or not. This is becuase they're stored as regexes and not as the actual lists, so one would have to go through all 5000 courses to see what the actual category is.
                return {
                    [prereqID]: (validScheduledCourses
                        .filter(dependentCourseID => scheduledCourses[courseID]["y"] >= scheduledCourses[dependentCourseID]["y"])
                        .length === 0) ? 
                            STATUSES.COMPLETE : 
                            STATUSES.INCOMPLETE
                }
            }
        }
        case "FCES_MAX": {
            const validScheduledCourses = getValidScheduledCoursesForPrerequisite(prerequisiteObj["courses"], prerequisiteObj["categories"], Object.keys(scheduledCourses));
            if (validScheduledCourses === null) {
                return {
                    [prereqID] : STATUSES.UNVERIFIABLE
                }
            } else {
                return {
                    [prereqID]: (prerequisiteObj["count"] >= validScheduledCourses
                        .filter(dependentCourseID => 
                            scheduledCourses[courseID]["y"] < scheduledCourses[dependentCourseID]["y"])
                        .map(dependentCourseID => dependentCourseID[6] === 'H' ? 0.5 : 1)
                        .reduce((x, y) => x + y, 0)) ? 
                            STATUSES.COMPLETE : 
                            STATUSES.INCOMPLETE
                }
            }
        }
        case "PROGRAM_MIN": {
            return {
                [prereqID]: (prerequisiteObj["programs"]
                    .filter(dependentProgramID => scheduledPrograms.includes(dependentProgramID))
                    .length >= prerequisiteObj.count) ? 
                        STATUSES.COMPLETE : 
                        STATUSES.INCOMPLETE
            }
        }
        // Mainly for debugging
        default: {
            console.log(`${courseID}, ${prereqID}: Unknown type: ${prerequisiteObj.type}`);
            return {
                [prereqID]: STATUSES.UNIMPLEMENTED
            };
        }
    }
}