import { STATUSES } from "../Constants.js";
import { ProgramData, CourseCategoriesData } from "../../resources/exports.js";


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
 * @param {Array} courses List of courses from which to choose numCredits worth of courses. 
 * @param {Number} numCredits Number of credits worth of courses to choose.
 * @returns [true, [...]] if the desired worth of courses has been found, else [false, []].
 */
function getNumCreditsWorthOfCoursesFromList(courses, numCredits) {
    let usedCourses = [];
    let count = 0;
    
    for (const courseID of courses) {
        usedCourses.push(courseID)
        count += courseID[6] === 'Y' ? 1.0 : 0.5;
        // The moment we hit the threshold, return.
        if (count >= numCredits) {
            return [true, usedCourses];
        }
    }
    return [false, []];
}

// /**
//  * @param {Array} courses Courses to calculate total number of credits of.
//  * @returns Total credits worth of courses.
//  */
// function getTotalCreditsOfCoursesList(courses) {
//     return courses
//         .map(courseID => courseID[6] == 'Y' ? 1.0 : 0.5)
//         .reduce((x, y) => x + y, 0.0);
// }

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
            const [satisfied, usedCourses] = getNumCreditsWorthOfCoursesFromList(coursesInSchedule, requirementObj["count"]);
            return {
                [reqID]: {
                    "status": satisfied ? STATUSES.COMPLETE : STATUSES.INCOMPLETE,
                    usedCourses: satisfied ? usedCourses : []
                }
            };
        }

        case "COURSES_CATEGORIES/FCES/MIN/RECURS": {
            let coursesInSchedule = []
            coursesInSchedule = coursesInSchedule.concat(getAllCoursesFromScheduledListInCoursesList(scheduledCourses, requirementObj["courses"]));
            coursesInSchedule = coursesInSchedule.concat(getAllCoursesFromScheduledListInCategoriesList(scheduledCourses, requirementObj["categories"])[1]);

            // These recursReqs are always going to be either GROUPMAX or GROUPMIN. coursesInSchdule will be modifed in place by the recursive calls.
            let recursReqs = {};
            for (const recursReqID of requirementObj["recursReqs"]) {
                recursReqs = {...recursReqs, ...evaluateProgramRequirement(programID, recursReqID, coursesInSchedule)};
            }

            const [satisfied, usedCourses] = getNumCreditsWorthOfCoursesFromList(coursesInSchedule, requirementObj["count"]);
            return {
                ...recursReqs,
                [reqID]: {
                    "status": satisfied ? STATUSES.COMPLETE : STATUSES.INCOMPLETE,
                    usedCourses: usedCourses
                }
            }
        }

        case "COURSES/FCES/GROUPMAX": {
            const coursesToFilterWith = getAllCoursesFromScheduledListInCoursesList(scheduledCourses, requirementObj["courses"]);
            let usedCourses = scheduledCourses.filter(courseID => coursesToFilterWith.includes(courseID));
            while (usedCourses.length > requirementObj["count"]) {
                const courseToRemove = usedCourses.pop();
                scheduledCourses.splice(scheduledCourses.indexOf(courseToRemove), 1);
            }
            return {
                [reqID]: {
                    "status": STATUSES.COMPLETE,
                    "usedCourses": usedCourses
                }
            }
        }

        case "CATEGORIES/FCES/GROUPMAX": {
            // Get the courses we are supposed to remove the excesses from.
            const [validatable, coursesToFilterWith] = getAllCoursesFromScheduledListInCategoriesList(scheduledCourses, requirementObj["categories"])
            // If we have all valid categories, grab their intersection with scheduledCourses. Else, return empty.
            let usedCourses = validatable ? scheduledCourses.filter(courseID => coursesToFilterWith.includes(courseID)) : [];
            // Remove an excess courses from both the usedCourses and scheduledCourses, mutating both in place
            while (usedCourses.length > requirementObj["count"]) {
                const courseToRemove = usedCourses.pop();
                scheduledCourses.splice(scheduledCourses.indexOf(courseToRemove), 1);
            }
            return {
                [reqID]: {
                    "status": validatable ? STATUSES.COMPLETE : STATUSES.UNVERIFIABLE,
                    "usedCourses": usedCourses
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
                    usedCourses = usedCourses.concat(dependentReqs[dependentReqID]["usedCourses"]);
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

        case "CATEGORIES/FCES/GROUPMIN":
        case "CATEGORIES/FCES/GROUPMIN/RECURS":
        case "CATEGORIES/FCES/MIN":
        case "CATEGORIES/FCES/MIN/RECURS":
        case "CATEGORIES/NUM/GROUPMIN":
        case "CATEGORIES/NUM/MIN":
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