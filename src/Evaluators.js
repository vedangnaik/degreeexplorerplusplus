import { STATUSES } from "./Constants.js";
import ProgramData from "../resources/ProgramData.js";
import CourseCategoriesData from "../resources/CourseCategoriesData.js";
import CourseData from "../resources/CourseData.js";

// These are all the types in the programs. 6/8 have been done but consolidation is needed.
// {'REUSE', 'COMPLEX', 'NOTE', 'LIST', 'MINIMUM', 'GROUPMINIMUM', 'NO_REUSE', 'GROUPMAXIMUM'}
export function evaluateProgramRequirement(programID, reqID, scheduledCourses, scheduledPrograms) {
    const requirementObj = ProgramData[programID].detailAssessments[reqID];

    if (requirementObj.type == "NOTE") {
        return {
            [reqID]: { 
                "status": STATUSES.NOTE,
                "usedCourses": [] 
            }
        };
    }

    switch (requirementObj["requisiteType"]) {
        case "requirement": {
            switch (requirementObj.type) {
                // At least 1 requirement is needed. It's assumed to be 1 because count is not specified for this field anywhere.
                case "MINIMUM": {
                    let dependentReqs = {};
                    // Evaluate all requirements this one depends on first
                    for (const dependentReq of requirementObj.requisiteItems) {
                        dependentReqs = {...dependentReqs, ...evaluateProgramRequirement(programID, dependentReq["code"], scheduledCourses, scheduledPrograms)};
                    }
                    // Go through them and see if there are enough to satisfy this one.
                    let usedPrereqs = [];
                    let usedCourses = [];
                    let count = 0;
                    for (const dependentReqID in dependentReqs) {
                        if (dependentReqs[dependentReqID].status !== STATUSES.INCOMPLETE) {
                            usedPrereqs.push(dependentReqID);
                            usedCourses.concat(dependentReqs[dependentReqID].usedCourses);
                            count += 1;
                        }

                        if (1 <= count) { break; }
                    }
                    // Return negative on failure
                    if (1 > count) {
                        return {
                            ...dependentReqs,
                            [reqID]: {
                                "status": STATUSES.INCOMPLETE,
                                "usedCourses": []
                            }
                        }
                    }
                    // Go through all the courses not in usedPrereqs and set them NA
                    for (const dependentReqID in dependentReqs) {
                        if (!usedPrereqs.includes(dependentReqID)) {
                            dependentReqs[dependentReqID].status = STATUSES.NA;
                        }
                    }
                    return {
                        ...dependentReqs,
                        [reqID]: {
                            "status": STATUSES.COMPLETE,
                            "usedCourses": usedCourses
                        }
                    };
                // REUSE allows courses to be used across multiple requirements. There's really nothing to check here since it doesn't matter even if they are not reused. Hence it'll just return COMPELTE.
                }
                case "REUSE": {
                    return {
                        [reqID]: {
                            "status": STATUSES.COMPLETE,
                            "usedCourses": []
                        }
                    }
                }
                // NO_REUSE disallows courses to be common between requirements.
                case "NO_REUSE": {
                    // Evaluate all requirements this one depends on first
                    let dependentReqs = {};
                    for (const dependentReq of requirementObj.requisiteItems) {
                        dependentReqs = {...dependentReqs, ...evaluateProgramRequirement(programID, dependentReq["code"], scheduledCourses, scheduledPrograms)};
                    }
                    // Get all the used courses
                    let allUsedCourses = [];
                    for (const dependentReqID in dependentReqs) {
                        allUsedCourses.push(dependentReqs[dependentReqID].usedCourses);
                    }
                    // Get the intersection of all the used courses using this snippet from MDN.
                    const usedCoursesIntersection = allUsedCourses.reduce((usedCoursesArrayA, usedCoursesArrayB) => {
                        const setA = new Set(usedCoursesArrayA);
                        const setB = new Set(usedCoursesArrayB);
                        let intersection = new Set();
                        for (let elem of setB) {
                            if (setA.has(elem)) {
                                intersection.add(elem);
                            }
                        }
                        return intersection;
                    }, []);
                    // If the intersection is empty, return COMPLETE, else INCOMPLETE.
                    return {
                        ...dependentReqs,
                        [reqID]: {
                            "status": usedCoursesIntersection.size === 0 ? STATUSES.COMPLETE : STATUSES.INCOMPLETE,
                            "usedCourses": []
                        }
                    };
                }
                // For debugging
                default: {
                    console.log(`${programID}, ${reqID}: Unknown recursive type: ${requirementObj.type}`);
                    return {
                        [reqID]: {
                            "status": STATUSES.UNIMPLEMENTED,
                            "usedCourses": []
                        }
                    };
                }
            }
        }
        // These requirements have a mix of categories and courses
        case "course/category": {
            switch (requirementObj.type) {
                // All of the courses in the list
                case "LIST": {
                    // If any course required is not in the scheduledCourses, this will be false.
                    const lengthIsZero = requirementObj.requisiteItems
                        .filter(dependent_course => !(dependent_course["itemType"] == "course" && dependent_course["code"] in scheduledCourses))
                        .length === 0;
                    return {
                        [reqID]: {
                            "status": lengthIsZero ? STATUSES.COMPLETE : STATUSES.INCOMPLETE,
                            "usedCourses": lengthIsZero ? requirementObj.requisiteItems.map(dependent_course => dependent_course["code"]) : []
                        }
                    };
                }
                // At least count credits
                case "MINIMUM": {
                    let [potentialUsedCourses, validatable] = getAllApplicableCoursesAndValidity(requirementObj.requisiteItems, scheduledCourses);
                    const numCredits = validatable ? getTotalCreditsOfCourseIDList(potentialUsedCourses) : NaN;
                    return {
                        [reqID]: {
                            "status": validatable ? (numCredits >= requirementObj.count ? STATUSES.COMPLETE : STATUSES.INCOMPLETE) : STATUSES.UNVERIFIABLE,
                            "usedCourses": validatable ? (numCredits >= requirementObj.count ? potentialUsedCourses : []) : []
                        }
                    };
                }
                // At most count credits from this category (or something, idk)
                case "GROUPMAXIMUM": {
                    let [potentialUsedCourses, validatable] = getAllApplicableCoursesAndValidity(requirementObj.requisiteItems, scheduledCourses);
                    const numCredits = validatable ? getTotalCreditsOfCourseIDList(potentialUsedCourses) : NaN;
                    return {
                        [reqID]: {
                            "status": validatable ? (numCredits <= requirementObj.count ? STATUSES.COMPLETE : STATUSES.INCOMPLETE) : STATUSES.UNVERIFIABLE,
                            "usedCourses": validatable ? (numCredits <= requirementObj.count ? potentialUsedCourses : []) : []
                        }
                    };
                }
                // For debugging
                default: {
                    console.log(`${programID}, ${reqID}: Unknown normal type: ${requirementObj.type}`);
                    return {
                        [reqID]: {
                            "status": STATUSES.UNIMPLEMENTED,
                            "usedCourses": []
                        }
                    };
                }
            }
        }
        default: {
            console.log(`${programID}: ${reqID}: No requisiteType found.`);
            return {
                [reqID]: {
                    "status": STATUSES.UNIMPLEMENTED,
                    "usedCourses": []
                }
            }
        }
    }
}

// Returns all courses from scheduled courses which equal the "course" objects and match the "category" regexes from requisiteItems. If any of the regexes are not validatable, then the whole thing is marked is not validatable.
function getAllApplicableCoursesAndValidity(requisiteItems, scheduledCourses) {
    let courses = [];
    let validatable = true;
    // Courses: Get all courses in requisiteItems which are also in sheduledCourses
    courses = courses.concat(
        requisiteItems
            .filter(dependent_course => dependent_course["itemType"] === "course" && dependent_course["code"] in scheduledCourses)
            .map(dependent_course => dependent_course["code"])
    );
    // Categories: Get all courses from scheduledCourses which belong to some category in requisiteItems
    requisiteItems
        .filter(dependent_course => dependent_course["itemType"] == "category")
        .forEach(dependent_course => {
            if (!CourseCategoriesData[dependent_course["code"]]["validatable"]) {
                validatable = false;
                return; // quit this loop now, no point continuing 
            }
            let regex = new RegExp(CourseCategoriesData[dependent_course["code"]]["regex"]);
            courses = courses.concat(
                Object.keys(scheduledCourses).filter(courseID => regex.test(courseID))
            );
        });
    return [courses, validatable];
}

function getTotalCreditsOfCourseIDList(courses) {
    return courses
        .map(dependent_courseID => dependent_courseID[6] === 'H' ? 0.5 : 1)
        .reduce((x, y) => x + y, 0);
}






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
        case "FCES_GROUPMIN": {
            console.log(`${courseID}, ${prereqID}: Unimplemented type: ${prerequisiteObj.type}`);
            return {
                [prereqID]: STATUSES.UNIMPLEMENTED
            };
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
        default: {
            console.log(`${courseID}, ${prereqID}: Unknown type: ${prerequisiteObj.type}`);
            return {
                [prereqID]: STATUSES.UNIMPLEMENTED
            };
        }
    }
}