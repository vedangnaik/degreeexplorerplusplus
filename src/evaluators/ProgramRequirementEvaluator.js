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

export function evaluateProgramRequirement(programID, reqID, scheduledCourses, evaluatedRequirements) {
    const requirementObj = ProgramData[programID]["detailAssessments"][reqID];
    switch(requirementObj["type"]) {
        case "UNVERIFIABLE/./.": {
            evaluatedRequirements[reqID] = {
                "status": STATUSES.UNVERIFIABLE,
                "usedCourses": []
            }
            break;
        }

        // NUM is redundant here - everything in "courses" must be fulfilled.
        case "COURSES/NUM/LIST": {
            const coursesInSchedule = getAllCoursesFromScheduledListInCoursesList(scheduledCourses, requirementObj["courses"]);
            const satisfiedCourses = requirementObj["courses"]
                .filter(courseID => coursesInSchedule.includes(courseID));
            const satisfied = requirementObj["courses"]
                .map(courseID => coursesInSchedule.includes(courseID))
                .reduce((x, y) => x && y, true);
            
            evaluatedRequirements[reqID] = {
                "status": satisfied ? STATUSES.COMPLETE : STATUSES.INCOMPLETE,
                "usedCourses": satisfiedCourses
            };
            break;
        }

        // At least "count" credits in courses belonging to "categories".
        case "CATEGORIES/FCES/MIN": {
            const [validatable, coursesInSchedule] = getAllCoursesFromScheduledListInCategoriesList(scheduledCourses, requirementObj["categories"]);
            if (validatable) {
                evaluatedRequirements[reqID] = {
                    "status": getNumCreditsInList(coursesInSchedule) >= requirementObj["count"] ? STATUSES.COMPLETE : STATUSES.INCOMPLETE,
                    "usedCourses": coursesInSchedule
                };
                break;
            } else {
                evaluatedRequirements[reqID] = {
                    "status": STATUSES.UNVERIFIABLE,
                    "usedCourses": []
                };
                break;
            }
        }

        // At least "count" number of courses from "categories"
        case "CATEGORIES/NUM/MIN": {
            const [validatable, coursesInSchedule] = getAllCoursesFromScheduledListInCategoriesList(scheduledCourses, requirementObj["categories"]);
            
            evaluatedRequirements[reqID] = {
                "status": validatable ? (coursesInSchedule.length >= requirementObj["count"] ? STATUSES.COMPLETE : STATUSES.INCOMPLETE) : STATUSES.UNVERIFIABLE,
                "usedCourses": validatable ? coursesInSchedule : []
            };
            break;
        }

        // At least "count" credits worth of courses from "courses".
        case "COURSES/FCES/MIN": {
            const coursesInSchedule = getAllCoursesFromScheduledListInCoursesList(scheduledCourses, requirementObj["courses"]);

            evaluatedRequirements[reqID] = {
                "status": getNumCreditsInList(coursesInSchedule) >= requirementObj["count"] ? STATUSES.COMPLETE : STATUSES.INCOMPLETE,
                "usedCourses": coursesInSchedule
            }
            break;
        }

        // At least "count" number of courses from "courses".
        case "COURSES/NUM/MIN": {
            const coursesInSchedule = getAllCoursesFromScheduledListInCoursesList(scheduledCourses, requirementObj["courses"]);

            evaluatedRequirements[reqID] = {
                "status": coursesInSchedule.length >= requirementObj["count"] ? STATUSES.COMPLETE : STATUSES.INCOMPLETE,
                "usedCourses": coursesInSchedule
            };
            break;
        }

         // At least "count" credits worth of courses in "courses" and "categories".
        case "COURSES_CATEGORIES/FCES/MIN": {
            // Grab all the courses from "courses" and "categories".
            let coursesInSchedule = [];
            coursesInSchedule = coursesInSchedule.concat(getAllCoursesFromScheduledListInCoursesList(scheduledCourses, requirementObj["courses"]));
            const [validatable, coursesFromCategories] = getAllCoursesFromScheduledListInCategoriesList(scheduledCourses, requirementObj["categories"]);
            coursesInSchedule = coursesInSchedule.concat(coursesFromCategories);

            // If validatable, check number of credits.
            evaluatedRequirements[reqID] = {
                "status": validatable ? (getNumCreditsInList(coursesInSchedule) >= requirementObj["count"] ? STATUSES.COMPLETE : STATUSES.INCOMPLETE) : STATUSES.UNVERIFIABLE,
                "usedCourses": validatable ? coursesInSchedule : []
            };
            break;
        }

        // 'Requirement' used to inform the user of some information.
        case "NOTE/./.": {
            evaluatedRequirements[reqID] = {
                "status": STATUSES.NOTE,
                "usedCourses": []
            };
            break;
        }

        // At least count requirements from the list.
        case "REQUIREMENTS/REQS/MIN": {
            // Evaluate all requirements this one depends on first
            for (const dependentReqID of requirementObj["dependentReqs"]) {
                if (!(dependentReqID in evaluatedRequirements)) {
                    evaluateProgramRequirement(programID, dependentReqID, scheduledCourses, evaluatedRequirements);
                }
            }

            // Go through them and see if there are enough to satisfy this one.
            let usedPrereqs = [];
            let usedCourses = [];
            let count = 0;
            for (const dependentReqID of requirementObj["dependentReqs"]) {
                if (evaluatedRequirements[dependentReqID]["status"] === STATUSES.COMPLETE) {
                    usedPrereqs.push(dependentReqID);
                    usedCourses = usedCourses.concat(evaluatedRequirements[dependentReqID]["usedCourses"]);
                    count += 1;
                }
            }
            // Return INCOMPLETE on failure, but don't touch the dependents.
            if (requirementObj["count"] > count) {
                evaluatedRequirements[reqID] = {
                    "status": STATUSES.INCOMPLETE,
                    "usedCourses": []
                };
                break;
            }
            // Else set all the others to NA and return COMPLETE
            else {
                for (const dependentReqID of requirementObj["dependentReqs"]) {
                    if (!usedPrereqs.includes(dependentReqID)) {
                        markRequirementAsNA(programID, dependentReqID, evaluatedRequirements);
                    }
                }

                evaluatedRequirements[reqID] = {
                    "status": STATUSES.COMPLETE,
                    "usedCourses": usedCourses
                };
                break;
            }
        }



        // // At most "count" number of courses in "courses" - excess is removed from scheduledCourses. Always returns COMPLETE.
        // case "COURSES/NUM/GROUPMAX": {
        //     const coursesToFilter = getAllCoursesFromScheduledListInCoursesList(scheduledCourses, requirementObj["courses"]);
        //     return {
        //         [reqID]: {
        //             "status": STATUSES.COMPLETE,
        //             "usedCourses": coursesToFilter.slice(0, requirementObj["count"])
        //         }
        //     };
        // }

        // // At most "count" credits worth of courses in "courses" - excess is removed from scheduledCourses. Always returns COMPLETE.
        // case "COURSES/FCES/GROUPMAX": {
        //     // Get all the courses which we are supposed to put a GROUPMAX on from scheduledCourses.
        //     const coursesToFilter = getAllCoursesFromScheduledListInCoursesList(scheduledCourses, requirementObj["courses"]);
        //     // If this list has more credits than allowed, start popping them one by one from both this list and scheduledCourses.
        //     while (getNumCreditsInList(coursesToFilter) > requirementObj["count"]) {
        //         scheduledCourses.splice(scheduledCourses.indexOf(coursesToFilter.pop()), 1);
        //     }
        //     // Return COMPLETE with whatever's left.
        //     return {
        //         [reqID]: {
        //             "status": STATUSES.COMPLETE,
        //             "usedCourses": coursesToFilter
        //         }
        //     };
        // }

        // // At most "count" credits worth of courses in "categories" - excess is removed from scheduledCourses. Returns COMPLETE or UNVERIFIABLE.
        // case "CATEGORIES/FCES/GROUPMAX": {
        //     // Get all the courses which we are supposed to put a GROUPMAX on from scheduledCourses.
        //     const [validatable, coursesToFilter] = getAllCoursesFromScheduledListInCategoriesList(scheduledCourses, requirementObj["categories"])
        //     // If it's validatable, remove any excess courses
        //     if (validatable) {
        //         while (getNumCreditsInList(coursesToFilter) > requirementObj["count"]) {
        //             scheduledCourses.splice(scheduledCourses.indexOf(coursesToFilter.pop()), 1);
        //         }
        //         return {
        //             [reqID]: {
        //                 "status": STATUSES.COMPLETE,
        //                 "usedCourses": coursesToFilter
        //             }
        //         };
        //     } else {
        //         return {
        //             [reqID]: {
        //                 "status": STATUSES.UNVERIFIABLE,
        //                 "usedCourses": []
        //             }
        //         };
        //     }
        // }
        
        // There are some GROUPMAX requirements which apply to multiple requirements *simulatenously* e.g. some restriction on the combined usedCourses of both Req1 and Req2. Here, these are not being calculated, since currently there is no way to identify such GROUPMAXes. Thus, some requirements may not be correctly evaluated.
        // These two are combined since they're very similar
        case "COURSES/NUM/GROUPMAX":
        case "COURSES/FCES/GROUPMAX": {
            let usedCourses = [];

            // Evaluate all unevaluated recursReqs, then apply the GROUPMAX to each usedCourses of each recursReqs and rerun the check to get the new status.
            for (const recursReqID of requirementObj["recursReqs"]) {
                if (!(recursReqID in evaluatedRequirements)) {
                    evaluateProgramRequirement(programID, recursReqID, scheduledCourses, evaluatedRequirements);
                }
                
                let usedCoursesForThisReq = evaluatedRequirements[recursReqID]["usedCourses"];
                // Get all the courses which we are supposed to put a GROUPMAX on from usedCoursesForThisReq.
                const coursesToFilter = getAllCoursesFromScheduledListInCoursesList(usedCoursesForThisReq, requirementObj["courses"]);

                // From the usedCourses of this req, remove the excess, if any. Then, pass it back into the requirement for evaluation.
                // This is a bit of a compound "branchless" while loop to compactly choose the loop's condition based on the type. A little pointless, but eh.
                while (
                    (requirementObj["type"] === "COURSES/FCES/GROUPMAX" && getNumCreditsInList(coursesToFilter) > requirementObj["count"]) || 
                    (requirementObj["type"] === "COURSES/NUM/GROUPMAX"  && coursesToFilter.length > requirementObj["count"])
                ) {
                    usedCoursesForThisReq.splice(usedCoursesForThisReq.indexOf(coursesToFilter.pop()), 1);
                }                

                evaluateProgramRequirement(programID, recursReqID, usedCoursesForThisReq, evaluatedRequirements);
                
                // Save usedCourses for this req.
                usedCourses = usedCourses.concat(coursesToFilter);
            }

            evaluatedRequirements[reqID] = {
                "status": STATUSES.COMPLETE,
                "usedCourses": [...new Set(usedCourses)]
            };
            break;
        }
        

        case "CATEGORIES/FCES/GROUPMAX":
        case "CATEGORIES/FCES/GROUPMIN":
        case "CATEGORIES/NUM/GROUPMIN":
        case "COURSES/FCES/GROUPMAX":
        case "COURSES/FCES/GROUPMIN":
        case "COURSES/NUM/GROUPMAX":
        case "COURSES/NUM/GROUPMIN":
        case "COURSES_CATEGORIES/FCES/GROUPMIN":
        case "REQUIREMENTS/NUM/NO_REUSE": {
            evaluatedRequirements[reqID] = {
                "status": STATUSES.UNIMPLEMENTED,
                "usedCourses": []
            }
        }
    }
}