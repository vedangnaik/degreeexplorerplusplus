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
    const allValidatable = listedCategories
        .map(categoryID => CourseCategoriesData[categoryID]["validatable"])
        .reduce((x, y) => x && y, true);
    if (allValidatable) {
        const coursesInSchedule = [];
        listedCategories
            .forEach(categoryID => {
                const categoryRegex = new RegExp(CourseCategoriesData[categoryID]["regex"]);
                scheduledCourses
                    .filter(courseID => !coursesInSchedule.includes(courseID) && categoryRegex.test(courseID))
                    .forEach(courseID => coursesInSchedule.push(courseID));
            });
        return [allValidatable, coursesInSchedule];
    } else {
        return [allValidatable, []];
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
        
        // NO_REUSE is likely to be too computationally intensive to check given that the usedCourses aren't minimal; there could be overlaps between the usedCourses of the requirements that could be removed to satisfy NO_REUSE and also keep the new usedCourses valid for each requirement. However, checking and decisively determining this would require multiple recomputations of each requirement, which will likely take too long. This might be takled at a later date, but for now, it's UNVERIFIABLE.  
        case "REQUIREMENTS/NUM/NO_REUSE":
        case "UNVERIFIABLE": {
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
        case "NOTE": {
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

        // There are some GROUPMAX requirements which apply to multiple requirements *simulatenously* e.g. some restriction on the combined usedCourses of both Req1 and Req2. Here, these are not being calculated, since currently there is no way to identify such GROUPMAXes. Thus, some requirements may not be correctly evaluated. The default behaviour is evaluating the GROUPMAX on each listed requirement separately. This decision was made based on manual analysis of some GROUPMAX reqs.
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
                "status": requirementObj["recursReqs"].length === 1 ? STATUSES.COMPLETE : STATUSES.UNVERIFIABLE,
                "usedCourses": [...new Set(usedCourses)]
            };
            break;
        }

        case "CATEGORIES/FCES/GROUPMAX": {
            let usedCourses = [];
            // First, we check if the categories in this req are validatable at all. If not, there's no point doing anything else.
            // We use the empty list to keep this as fast as possible. We are only interested in validatable, not the actual list.
            const [validatable, _] = getAllCoursesFromScheduledListInCategoriesList([], requirementObj["categories"]);

            if (!validatable) {
                evaluatedRequirements[reqID] = {
                    "status": STATUSES.UNVERIFIABLE,
                    "usedCourses": []
                };
                break;
            }
            
            for (const recursReqID of requirementObj["recursReqs"]) {
                if (!(recursReqID in evaluatedRequirements)) {
                    evaluateProgramRequirement(programID, recursReqID, scheduledCourses, evaluatedRequirements);
                }

                let usedCoursesForThisReq = evaluatedRequirements[recursReqID]["usedCourses"];
                // Since we've already checked earlier, this is guaranteed to be validatable.
                const [_, coursesToFilter] = getAllCoursesFromScheduledListInCategoriesList(usedCoursesForThisReq, requirementObj["categories"]);

                while (getNumCreditsInList(coursesToFilter) > requirementObj["count"]) {
                    usedCoursesForThisReq.splice(usedCoursesForThisReq.indexOf(coursesToFilter.pop()), 1);
                }

                usedCourses = usedCourses.concat(coursesToFilter);
            }

            evaluatedRequirements[reqID] = {
                "status": requirementObj["recursReqs"].length === 1 ? STATUSES.COMPLETE : STATUSES.UNVERIFIABLE,
                "usedCourses": [...new Set(usedCourses)]
            };
            break;
        }

        // GROUPMIN requirements have the same issue that the GROUPMAX ones do. Here however, the default action is to apply the GROUPMIN restriction to all the listed requirements together, vs. individually. This decision was taken based on some manual and rough programmatic analysis of GROPUMIN reqs.
        case "COURSES/FCES/GROUPMIN":
        case "COURSES/NUM/GROUPMIN": {
            // Grab all the used courses from all the recursReqs, removing duplicates.
            let usedCoursesInAllReqs = [];
            for (const recursReqID of requirementObj["recursReqs"]) {
                if (!(recursReqID in evaluatedRequirements)) {
                    evaluateProgramRequirement(programID, recursReqID, scheduledCourses, evaluatedRequirements);
                }
                usedCoursesInAllReqs = usedCoursesInAllReqs.concat(evaluatedRequirements[recursReqID]["usedCourses"]);
            }
            usedCoursesInAllReqs = [...new Set(usedCoursesInAllReqs)];

            // Grab all the relevant courses from the union list.
            const usedCourses = getAllCoursesFromScheduledListInCoursesList(usedCoursesInAllReqs, requirementObj["courses"]);

            // A little ridiculous ;) Unlike GROUPMAX, there's no removing of excesses to do here - if the minimum amount isn't reached, then it's a straight failure, and nothing can be done about that. And if it is reached, then excess is fine, so it's good.
            evaluatedRequirements[reqID] = {
                "status": requirementObj["recursReqs"].length === 1 ?
                    (
                        requirementObj["type"] === "COURSES/FCES/GROUPMIN" ?
                            (getNumCreditsInList(usedCourses) >= requirementObj["count"] ? STATUSES.COMPLETE : STATUSES.INCOMPLETE) :
                            (usedCourses.length               >= requirementObj["count"] ? STATUSES.COMPLETE : STATUSES.INCOMPLETE)
                    ) : 
                    STATUSES.UNVERIFIABLE,
                "usedCourses": usedCourses
            };
            break;
        }

        case "CATEGORIES/FCES/GROUPMIN":
        case "CATEGORIES/NUM/GROUPMIN": {
            let usedCoursesInAllReqs = [];
            for (const recursReqID of requirementObj["recursReqs"]) {
                if (!(recursReqID in evaluatedRequirements)) {
                    evaluateProgramRequirement(programID, recursReqID, scheduledCourses, evaluatedRequirements);
                }
                usedCoursesInAllReqs = usedCoursesInAllReqs.concat(evaluatedRequirements[recursReqID]["usedCourses"]);
            }
            usedCoursesInAllReqs = [...new Set(usedCoursesInAllReqs)];

            const [validatable, usedCourses] = getAllCoursesFromScheduledListInCategoriesList(usedCoursesInAllReqs, requirementObj["categories"]);

            // This is almost the same as the previous two, with the addition that if it's not validatable, we return UNVERIFIABLE and an empty usedCourses.
            evaluatedRequirements[reqID] = {
                "status": validatable && requirementObj["recursReqs"].length === 1 ?
                    (
                        requirementObj["type"] === "CATEGORIES/FCES/GROUPMIN" ?
                            (getNumCreditsInList(usedCourses) >= requirementObj["count"] ? STATUSES.COMPLETE : STATUSES.INCOMPLETE) :
                            (usedCourses.length               >= requirementObj["count"] ? STATUSES.COMPLETE : STATUSES.INCOMPLETE)
                    ) : 
                    STATUSES.UNVERIFIABLE,
                "usedCourses": validatable ? usedCourses : []
            };
            break;
        }

        // This is just an amalgamation of the previous four.
        case "COURSES_CATEGORIES/FCES/GROUPMIN": {
            let usedCoursesInAllReqs = [];
            for (const recursReqID of requirementObj["recursReqs"]) {
                if (!(recursReqID in evaluatedRequirements)) {
                    evaluateProgramRequirement(programID, recursReqID, scheduledCourses, evaluatedRequirements);
                }
                usedCoursesInAllReqs = usedCoursesInAllReqs.concat(evaluatedRequirements[recursReqID]["usedCourses"]);
            }
            usedCoursesInAllReqs = [...new Set(usedCoursesInAllReqs)];

            let [validatable, usedCourses] = getAllCoursesFromScheduledListInCategoriesList(usedCoursesInAllReqs, requirementObj["categories"]);
            usedCourses = usedCourses.concat(getAllCoursesFromScheduledListInCoursesList(usedCoursesInAllReqs, requirementObj["courses"]));

            evaluatedRequirements[reqID] = {
                "status": validatable && requirementObj["recursReqs"].length === 1 ?
                    (getNumCreditsInList(usedCourses) >= requirementObj["count"] ? STATUSES.COMPLETE : STATUSES.INCOMPLETE) : 
                    STATUSES.UNVERIFIABLE,
                "usedCourses": validatable ? usedCourses : []
            };
            break;
        }
    }
}