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
    // Mark any dependent reqs as NA
    if ("dependentReqs" in requirementObj) {
        for (const dependentReqID of requirementObj["dependentReqs"]) {
            markRequirementAsNA(programID, dependentReqID, requirementStatuses);
        }
    }
    // Mark any recursive reqs as NA
    if ("recursReqs" in requirementObj) {
        for (const recursReqID of requirementObj["recursReqs"]) {
            markRequirementAsNA(programID, recursReqID, requirementStatuses);
        }
    }
}

/**
 * @param {Array} courses List of courses from which to choose numCredits worth of courses. 
 * @param {Number} numCredits Number of credits worth of courses to choose.
 * @returns [true, [...]] if the desired worth of courses has been found, else [false, [...]].
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
    return [false, usedCourses];
}

/**
 * @param {Array} courses List of courses to determine credits worth of.
 * @returns Total number of credits in courses
 */
function getNumCreditsInList(courses) {
    return courses
        .map(courseID => courseID[6] === "H" ? 0.5 : 1.0)
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

        // Mistake in data.
        case "COURSES/NUM/LIST/RECURS":
        // NUM is redundant here - everything in "courses" must be fulfilled.
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

        // At least "count" credits in courses belonging to "categories".
        case "CATEGORIES/FCES/MIN": {
            const [validatable, coursesInSchedule] = getAllCoursesFromScheduledListInCategoriesList(scheduledCourses, requirementObj["categories"]);
            if (validatable) {
                const [satisfied, usedCourses] = getNumCreditsWorthOfCoursesFromList(coursesInSchedule, requirementObj["count"]);
                return {
                    [reqID]: {
                        "status": satisfied ? STATUSES.COMPLETE : STATUSES.INCOMPLETE,
                        "usedCourses": usedCourses
                    }
                };
            } else {
                return {
                    [reqID]: {
                        "status": STATUSES.UNVERIFIABLE,
                        "usedCourses": []
                    }
                }
            }
        }

        // At least "count" number of courses from "categories"
        case "CATEGORIES/NUM/MIN": {
            const [validatable, coursesInSchedule] = getAllCoursesFromScheduledListInCategoriesList(scheduledCourses, requirementObj["categories"]);
            return {
                [reqID]: {
                    "status": validatable ? (coursesInSchedule.length >= requirementObj["count"] ? STATUSES.COMPLETE : STATUSES.INCOMPLETE) : STATUSES.UNVERIFIABLE,
                    "usedCourses": validatable ? coursesInSchedule.slice(0, requirementObj["count"]) : []
                }
            };
        }

        // At least "count" credits worth of courses from "courses".
        case "COURSES/FCES/MIN": {
            const coursesInSchedule = getAllCoursesFromScheduledListInCoursesList(scheduledCourses, requirementObj["courses"]);
            const [satisfied, usedCourses] = getNumCreditsWorthOfCoursesFromList(coursesInSchedule, requirementObj["count"]);
            return {
                [reqID]: {
                    "status": satisfied ? STATUSES.COMPLETE : STATUSES.INCOMPLETE,
                    "usedCourses": satisfied ? usedCourses : []
                }
            };
        }

        // At least "count" number of courses from "courses".
        case "COURSES/NUM/MIN": {
            const coursesInSchedule = getAllCoursesFromScheduledListInCoursesList(scheduledCourses, requirementObj["courses"]);
            return {
                [reqID]: {
                    "status": coursesInSchedule.length >= requirementObj["count"] ? STATUSES.COMPLETE : STATUSES.INCOMPLETE,
                    "usedCourses": coursesInSchedule.slice(0, requirementObj["count"])
                }
            };
        }

         // At least "count" credits worth of courses in "courses" and "categories".
        case "COURSES_CATEGORIES/FCES/MIN": {
            // Grab all the courses from "courses" and "categories".
            let coursesInSchedule = [];
            coursesInSchedule = coursesInSchedule.concat(getAllCoursesFromScheduledListInCoursesList(scheduledCourses, requirementObj["courses"]));
            const [validatable, coursesFromCategories] = getAllCoursesFromScheduledListInCategoriesList(scheduledCourses, requirementObj["categories"]);
            coursesInSchedule = coursesInSchedule.concat(coursesFromCategories);
            // If validatable, check the number of credits.
            const [satisfied, usedCourses] = validatable ? getNumCreditsWorthOfCoursesFromList(coursesInSchedule, requirementObj["count"]) : [false, []];

            return {
                [reqID]: {
                    "status": validatable ? (satisfied ? STATUSES.COMPLETE : STATUSES.INCOMPLETE) : STATUSES.UNVERIFIABLE,
                    "usedCourses": usedCourses
                }
            };
        }

        // At least "count" credits worth of courses in "courses" and "categories", with additional restrictions based on requirements in "recursReqs".
        case "COURSES_CATEGORIES/FCES/MIN/RECURS": {
            let coursesInSchedule = []
            let recursReqs = {};

            coursesInSchedule = coursesInSchedule.concat(getAllCoursesFromScheduledListInCoursesList(scheduledCourses, requirementObj["courses"]));
            const [validatable, coursesFromCategories] = getAllCoursesFromScheduledListInCategoriesList(scheduledCourses, requirementObj["categories"]);
            coursesInSchedule = coursesInSchedule.concat(coursesFromCategories);

            if (validatable) {
                // Evaluate each recurs requirement. These recursReqs are always going to be either GROUPMAX or GROUPMIN. coursesInSchdule will be modifed in place by the recursive calls.
                for (const recursReqID of requirementObj["recursReqs"]) {
                    recursReqs = {...recursReqs, ...evaluateProgramRequirement(programID, recursReqID, coursesInSchedule)};
                }
                // Now that we have the final list, check if it has enough credits.
                const [satisfied, usedCourses] = getNumCreditsWorthOfCoursesFromList(coursesInSchedule, requirementObj["count"]);
                return {
                    ...recursReqs,
                    [reqID]: {
                        "status": satisfied ? STATUSES.COMPLETE : STATUSES.INCOMPLETE,
                        "usedCourses": usedCourses
                    }
                }
            } else {
                // Else, just mark each child as not needed and return UNVERIFIABLE.
                requirementObj["recursReqs"].forEach(recursReqID => recursReqs[recursReqID] = {
                    "status": STATUSES.NA,
                    "usedCourses": []
                });
                return {
                    ...recursReqs,
                    [reqID]: {
                        "status": STATUSES.UNVERIFIABLE,
                        "usedCourses": []
                    }
                };
            }
        }

        // At least "count" courses from "courses", with additional restrictions based on requirements in "recursReqs".
        case "COURSES/NUM/MIN/RECURS": {
            let coursesInSchedule = getAllCoursesFromScheduledListInCoursesList(scheduledCourses, requirementObj["courses"]);

            let recursReqs = {};
            for (const recursReqID of requirementObj["recursReqs"]) {
                recursReqs = {...recursReqs, ...evaluateProgramRequirement(programID, recursReqID, coursesInSchedule)};
            }

            return {
                ...recursReqs,
                [reqID]: {
                    "status": coursesInSchedule.length >= requirementObj["count"] ? STATUSES.COMPLETE : STATUSES.INCOMPLETE,
                    "usedCourses": coursesInSchedule.slice(0, requirementObj["count"])
                }
            }
        }

        // At most "count" credits worth of courses in "courses" - excess is removed from scheduledCourses. Always returns COMPLETE.
        case "COURSES/FCES/GROUPMAX": {
            // Get all the courses which we are supposed to put a GROUPMAX on from scheduledCourses.
            const coursesToFilter = getAllCoursesFromScheduledListInCoursesList(scheduledCourses, requirementObj["courses"]);
            // If this list has more credits than allowed, start popping them one by one from both this list and scheduledCourses.
            while (getNumCreditsInList(coursesToFilter) > requirementObj["count"]) {
                scheduledCourses.splice(scheduledCourses.indexOf(coursesToFilter.pop()), 1);
            }
            // Return COMPLETE with whatever's left.
            return {
                [reqID]: {
                    "status": STATUSES.COMPLETE,
                    "usedCourses": coursesToFilter
                }
            };
        }

        // At most "count" credits worth of courses in "categories" - excess is removed from scheduledCourses. Returns COMPLETE or UNVERIFIABLE.
        case "CATEGORIES/FCES/GROUPMAX": {
            // Get all the courses which we are supposed to put a GROUPMAX on from scheduledCourses.
            const [validatable, coursesToFilter] = getAllCoursesFromScheduledListInCategoriesList(scheduledCourses, requirementObj["categories"])
            // If it's validatable, remove any excess courses
            if (validatable) {
                while (getNumCreditsInList(coursesToFilter) > requirementObj["count"]) {
                    scheduledCourses.splice(scheduledCourses.indexOf(coursesToFilter.pop()), 1);
                }
                return {
                    [reqID]: {
                        "status": STATUSES.COMPLETE,
                        "usedCourses": coursesToFilter
                    }
                };
            } else {
                return {
                    [reqID]: {
                        "status": STATUSES.UNVERIFIABLE,
                        "usedCourses": []
                    }
                };
            }
        }
        
        // Mistake in data.
        case "NOTE/././RECURS":
        // 'Requirement' used to inform the user of some information.
        case "NOTE/./.": {
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
                if (dependentReqs[dependentReqID]["status"] === STATUSES.COMPLETE) {
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

        // Requirements calculated to be impossible to fail.
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
        case "CATEGORIES/FCES/MIN/RECURS":
        case "CATEGORIES/NUM/GROUPMIN":
        case "COURSES/FCES/GROUPMIN":
        case "COURSES/FCES/GROUPMIN/RECURS":
        case "COURSES/FCES/MIN/RECURS":
        case "COURSES/NUM/GROUPMIN":
        case "COURSES_CATEGORIES/FCES/GROUPMIN":
        case "REQUIREMENTS/NUM/NO_REUSE":
        case "COURSES/NUM/GROUPMAX":
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