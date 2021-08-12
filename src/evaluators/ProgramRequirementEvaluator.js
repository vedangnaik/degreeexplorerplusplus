import { STATUSES } from "../Constants.js";
import { ProgramData, CourseCategoriesData } from "../../resources/exports.js";

// case "NO_REUSE": {
//     // Evaluate all requirements this one depends on first
//     let dependentReqs = {};
//     for (const dependentReq of requirementObj.requisiteItems) {
//         dependentReqs = {...dependentReqs, ...evaluateProgramRequirement(programID, dependentReq["code"], scheduledCourses, scheduledPrograms)};
//     }
//     // Get all the used courses
//     let allUsedCourses = [];
//     for (const dependentReqID in dependentReqs) {
//         allUsedCourses.push(dependentReqs[dependentReqID].usedCourses);
//     }
//     // Get the intersection of all the used courses using this snippet from MDN.
//     const usedCoursesIntersection = allUsedCourses.reduce((usedCoursesArrayA, usedCoursesArrayB) => {
//         const setA = new Set(usedCoursesArrayA);
//         const setB = new Set(usedCoursesArrayB);
//         let intersection = new Set();
//         for (let elem of setB) {
//             if (setA.has(elem)) {
//                 intersection.add(elem);
//             }
//         }
//         return intersection;
//     }, []);
//     // If the intersection is empty, return COMPLETE, else INCOMPLETE.
//     return {
//         ...dependentReqs,
//         [reqID]: {
//             "status": usedCoursesIntersection.size === 0 ? STATUSES.COMPLETE : STATUSES.INCOMPLETE,
//             "usedCourses": []
//         }
//     };
// }


/**
 * @param {Array} scheduledCourses Courses in the user's schedule.
 * @param {Array} listedCourses Courses that should be checked against the schedule.
 * @returns courses from listedCourses that are also in scheduledCourses i.e. set intersection.
 */
function getAllCoursesFromScheduledListInCoursesList(scheduledCourses, listedCourses) {
    return listedCourses.filter(courseID => scheduledCourses.includes(courseID));
}

function getAllCoursesFromScheduledListInCategoriesList(scheduledCourses, listedCategories) {
    // Check whether all the categories in here are validatable. If they aren't, then there's no point checking the others, since the requirement cannot be validated anyway.
    const validatable = listedCategories
        .map(categoryID => CourseCategoriesData[categoryID]["validatable"])
        .reduce((x, y) => x && y, true);
    if (validatable) {
        const coursesInSchedule = [];
        listedCategories
            .forEach(categoryID => {
                const categoryRegex = new RegExp(CourseCategoriesData[categoryID]["regex"]);
                scheduledCourses
                    .filter(courseID => !coursesInSchedule.includes(courseID) && categoryRegex.test(courseID))
                    .forEach(courseID => coursesInSchedule.push(courseID));
            });
        return [validatable, coursesInSchedule];
    } else {
        return [validatable, []];
    }
}

/**
 * Marks reqID and all its dependents/children as NA in requirementStatuses.
 * @param {string} programID id of program the requirement belongs to. Needed to recursively get dependents at all levels.
 * @param {string} reqID id of requirement to be NAed.
 * @param {object} requirementStatuses object of reqIDs to STATUSES.
 */
function markRequirementAsNA(programID, reqID, requirementStatuses) {
    requirementStatuses[reqID] = {
        "status": STATUSES.NA,
        "usedCourses": []
    };
    const requirementObj = ProgramData[programID]["detailAssessments"][reqID];
    if ("dependentReqs" in requirementObj) {
        for (const dependentReqID in requirementObj["dependentReqs"]) {
            markRequirementAsNA(programID, dependentReqID, requirementStatuses);
        }
    }
}

/**
 * @param {Array} courses Courses to calculate total number of credits of.
 * @returns Total credits worth of courses.
 */
function getTotalCreditsOfCoursesList(courses) {
    return courses
        .map(courseID => courseID[6] == 'Y' ? 1.0 : 0.5)
        .reduce((x, y) => x + y, 0.0);
}

export function evaluateProgramRequirement(programID, reqID, scheduledCourses) {
    const requirementObj = ProgramData[programID].detailAssessments[reqID];
    switch(requirementObj["type"]) {
        case "UNVERIFIABLE/./.":
        case "UNVERIFIABLE/././RECURS": {
            return {
                [reqID]: {
                    "status": STATUSES.UNVERIFIABLE,
                    "usedCourses": []
                }
            };
        }

        // NUM is redundant here really - everything in the "courses" must be fulfilled.
        case "COURSES/NUM/LIST/RECURS": // "/RECURS" is useless here.
        case "COURSES/NUM/LIST": {
            const coursesInSchedule = getAllCoursesFromScheduledListInCoursesList(scheduledCourses, requirementObj["courses"]);
            const satisfied = requirementObj["courses"]
                .map(courseID => coursesInSchedule.includes(courseID))
                .reduce((x, y) => x && y, true);
            return {
                [reqID]: {
                    "status": satisfied ? STATUSES.COMPLETE : STATUSES.INCOMPLETE,
                    "usedCourses": requirementObj["courses"]
                }
            };
        }

        // At least "count" credits in courses belonging to "courses".
        case "COURSES/FCES/MIN": {
            const coursesInSchedule = getAllCoursesFromScheduledListInCoursesList(scheduledCourses, requirementObj["courses"]);
            const numCredits = getTotalCreditsOfCoursesList(coursesInSchedule);
            return {
                [reqID]: {
                    "status": numCredits >= requirementObj["count"] ? STATUSES.COMPLETE : STATUSES.INCOMPLETE,
                    usedCourses: numCredits >= requirementObj["count"] ? coursesInSchedule : []
                }
            };
        }

        case "COURSES_CATEGORIES/FCES/MIN/RECURS": {
            let coursesInSchedule = []
            coursesInSchedule = coursesInSchedule.concat(getAllCoursesFromScheduledListInCoursesList(scheduledCourses, requirementObj["courses"]));
            coursesInSchedule = coursesInSchedule.concat(getAllCoursesFromScheduledListInCategoriesList(scheduledCourses, requirementObj["categories"])[1]);

            const numCredits = getTotalCreditsOfCoursesList(coursesInSchedule);
            let recursReqs = {};
            if (numCredits >= requirementObj["count"]) {
                // We need to recurse here to check
            } else {
                // We can return false immediately. None of other requirements can do anything anyway. However, we still need to check the other requirements, since the user can use that information to see how to fulfill this one.
                for (const recursReqID of requirementObj["recursReqs"]) {
                    recursReqs = {...recursReqs, ...evaluateProgramRequirement(programID, recursReqID, coursesInSchedule)};
                }
                return {
                    ...recursReqs,
                    [reqID]: {
                        "status": STATUSES.INCOMPLETE,
                        "usedCourses": coursesInSchedule
                    }
                }
            }
        }
        
        case "NOTE/./.":
        case "NOTE/././RECURS": {
            return {
                [reqID]: {
                    "status": STATUSES.NOTE,
                    "usedCourses": []
                }
            }
        }

        // At least count requirements from the list.
        case "REQUIREMENTS/REQS/MIN": {
            // Evaluate all requirements this one depends on first
            let dependentReqs = {};
            for (const dependentReqID of requirementObj["dependentReqs"]) {
                dependentReqs = {...dependentReqs, ...evaluateProgramRequirement(programID, dependentReqID, scheduledCourses)};
            }

            // Go through them and see if there are enough to satisfy this one.
            let usedPrereqs = [];
            let usedCourses = [];
            let count = 0;
            for (const dependentReqID in dependentReqs) {
                const dependentStatus = dependentReqs[dependentReqID]["status"];
                if (dependentStatus !== STATUSES.INCOMPLETE && dependentStatus !== STATUSES.UNIMPLEMENTED) {
                    usedPrereqs.push(dependentReqID);
                    usedCourses.concat(dependentReqs[dependentReqID]["usedCourses"]);
                    count += 1;
                }
            }
            // Return INCOMPLETE on failure, but don't touch the dependents.
            if (requirementObj["count"] > count) {
                return {
                    ...dependentReqs,
                    [reqID]: {
                        "status": STATUSES.INCOMPLETE,
                        "usedCourses": []
                    }
                }
            }
            // Else set all the others to NA and return COMPLETE
            else {
                for (const dependentReqID in dependentReqs) {
                    if (!usedPrereqs.includes(dependentReqID)) {
                        markRequirementAsNA(programID, dependentReqID, dependentReqs);
                    }
                }
                return {
                    ...dependentReqs,
                    [reqID]: {
                        "status": STATUSES.COMPLETE,
                        "usedCourses": usedCourses
                    }
                };
            }
        }

        case "COMPLETE/./.": {
            return {
                [reqID]: {
                    "status": STATUSES.COMPLETE,
                    "usedCourses": []
                }
            }
        }

        case "CATEGORIES/FCES/GROUPMAX":
        case "CATEGORIES/FCES/GROUPMIN":
        case "CATEGORIES/FCES/GROUPMIN/RECURS":
        case "CATEGORIES/FCES/MIN":
        case "CATEGORIES/FCES/MIN/RECURS":
        case "CATEGORIES/NUM/GROUPMIN":
        case "CATEGORIES/NUM/MIN":
        case "COURSES/FCES/GROUPMAX":
        case "COURSES/FCES/GROUPMIN":
        case "COURSES/FCES/GROUPMIN/RECURS":
        case "COURSES/FCES/MIN/RECURS":
        case "COURSES/NUM/GROUPMAX":
        case "COURSES/NUM/GROUPMIN":
        case "COURSES/NUM/LIST/RECURS":
        case "COURSES/NUM/MIN":
        case "COURSES/NUM/MIN/RECURS":
        case "COURSES_CATEGORIES/FCES/GROUPMIN":
        case "COURSES_CATEGORIES/FCES/MIN":
        case "COURSES_CATEGORIES/FCES/MIN/RECURS":
        case "REQUIREMENTS/NUM/NO_REUSE":
        case "REQUIREMENTS/REQS/MIN/RECURS": { 
            return {
                [reqID]: {
                    "status": STATUSES.UNIMPLEMENTED,
                    "usedCourses": []
                }
            };
        }
    }
}