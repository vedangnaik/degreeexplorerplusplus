// Idea: 'and' prerequisites (commas) are the first level of a list, or prerequisites are the second layer?
// Looks like exclusions are always 'and' only
export default {
  "CSC104H1": {
    "name": "Computational Thinking",
    "prerequisites": null,
    "corequisites": null,
    "exclusions": "JCC250H1; Any CSC course except CSC196H1, CSC197H1, CSC199H1",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC108H1": {
    "name": "Introduction to Computer Programming",
    "prerequisites": null,
    "corequisites": null,
    "exclusions": [["CSC110Y1"], ["CSC120H1"], ["CSC121H1"], ["CSC148H1"]],
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC110Y1": {
    "name": "Foundations of Computer Science I",
    "prerequisites": null,
    "corequisites": null,
    "exclusions": [["CSC108H1"], ["CSC148H1"], ["CSC165H1"]],
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC111H1": {
    "name": "Foundations of Computer Science II",
    "prerequisites": [["CSC110Y1"]],
    "corequisites": null,
    "exclusions": [["CSC108H1"], ["CSC148H1"], ["CSC165H1"]],
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC148H1": {
    "name": "Introduction to Computer Science",
    "prerequisites": [["CSC108H1"]],
    "corequisites": null,
    "exclusions": [["CSC111H1"], ["CSC207H1"], ["CSC148H5"], ["CSCA48H3"]],
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC165H1": {
    "name": "Mathematical Expression and Reasoning for Computer Science",
    "prerequisites": null,
    "corequisites": [["CSC108H1", "CSC120H1"]],
    "exclusions": [["CSC111H1"], ["CSC236H1"], ["CSC240H1"], ["MAT102H5"], ["CSCA65H3"]],
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC196H1": {
    "name": "Great Ideas in Computing",
    "prerequisites": null,
    "corequisites": null,
    "exclusions": null,
    "campus": "St. George",
    "arts_and_science_breadth": "(3) Society and its Institutions",
    "arts_and_science_distribution": "Science"
  },
  "CSC197H1": {
    "name": "What, Who, How: Privacy in the Age of Big Data Collection",
    "prerequisites": null,
    "corequisites": null,
    "exclusions": null,
    "campus": "St. George",
    "arts_and_science_breadth": "(3) Society and its Institutions",
    "arts_and_science_distribution": "Social Science"
  },
  "CSC199H1": {
    "name": "Intelligence, Artificial and Human",
    "prerequisites": null,
    "corequisites": null,
    "exclusions": "SMC199H1 (Intelligence, Artificial and Human)",
    "campus": "St. George",
    "arts_and_science_breadth": "(3) Society and its Institutions",
    "arts_and_science_distribution": "Science"
  },
  "CSC207H1": {
    "name": "Software Design",
    "prerequisites": [["CSC148H1", "CSC111H1"]],
    "corequisites": null,
    "exclusions": null,
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC209H1": {
    "name": "Software Tools and Systems Programming",
    "prerequisites": [["CSC207H1"]],
    "corequisites": null,
    "exclusions": [["CSC372H1"], ["CSC369H1"], ["CSC469H1"]],
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC236H1": {
    "name": "Introduction to the Theory of Computation",
    "prerequisites": [["CSC148H1", "CSC111H1"], ["CSC165H1", "CSC111H1"]],
    "corequisites": null,
    "exclusions": [["CSC240H1"]],
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC240H1": {
    "name": "Enriched Introduction to the Theory of Computation",
    "prerequisites": null,
    "corequisites": "CSC111H1/CSC148H1; MAT137Y1/MAT157Y1",
    "exclusions": "CSC236H1, CSC263H1/CSC265H1",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC258H1": {
    "name": "Computer Organization",
    "prerequisites": [["CSC111H1", "CSC148H1"], ["CSC111H1", "CSC165H1", "CSC240H1"]],
    "corequisites": null,
    "exclusions": null,
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC263H1": {
    "name": "Data Structures and Analysis",
    "prerequisites": [["CSC236H1", "CSC240H1", "APS105H1", "APS106H1", "ESC180H1;STA237H1", "STA247H1", "STA255H1", "STA257H1", "ECE302H1", "STA286H1", "CHE223H1", "CME263H1", "MIE231H1", "MIE236H1", "MSE238H1", "ECE286H1"]],
    "corequisites": null,
    "exclusions": [["CSC265H1"]],
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC265H1": {
    "name": "Enriched Data Structures and Analysis",
    "prerequisites": "CSC240H1 or an A- in CSC236H1",
    "corequisites": "STA247H1/STA255H1/STA257H1",
    "exclusions": "CSC263H1",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC299Y1": {
    "name": "Research Opportunity Program",
    "prerequisites": null,
    "corequisites": null,
    "exclusions": null,
    "campus": "St. George",
    "arts_and_science_breadth": null,
    "arts_and_science_distribution": null
  },
  "CSC300H1": {
    "name": "Computers and Society",
    "prerequisites": "Any CSC half course.",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(3) Society and its Institutions",
    "arts_and_science_distribution": "Science"
  },
  "CSC301H1": {
    "name": "Introduction to Software Engineering",
    "prerequisites": "CSC209H1, CSC263H1/CSC265H1",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC302H1": {
    "name": "Engineering Large Software Systems",
    "prerequisites": "CSC301H1",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC303H1": {
    "name": "Social and Information Networks",
    "prerequisites": "CSC263H1/CSC265H1, STA247H1/STA255H1/STA257H1/ECO227Y1/STA237H1, MAT221H1/MAT223H1/MAT240H1",
    "corequisites": null,
    "exclusions": "CSCC46H3. NOTE: Students not enrolled in the Computer Science Major or Specialist program at FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC309H1": {
    "name": "Programming on the Web",
    "prerequisites": "CSC209H1/ ESC180H1/ ESC190H1/ CSC190H1/ (APS105H1, ECE244H1)",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC311H1": {
    "name": "Introduction to Machine Learning",
    "prerequisites": "CSC207H1/ APS105H1/ APS106H1/ ESC180H1/ CSC180H1; MAT235Y1/? MAT237Y1/? MAT257Y1/? (minimum of 77% in MAT135H1 and MAT136H1)/ (minimum of 73% in MAT137Y1)/ (minimum of 67% in MAT157Y1)/ MAT291H1/ MAT294H1/ (minimum of 77% in MAT186H1, MAT187H1)/ (minimum of 73% in MAT194H1, MAT195H1)/ (minimum of 73% in ESC194H1, ESC195H1); MAT221H1/? MAT223H1/ MAT240H1/ MAT185H1/ MAT188H1; STA237H1/ STA247H1/ STA255H1/ STA257H1/ STA286H1/ CHE223H1/ CME263H1/ MIE231H1/ MIE236H1/ MSE238H1/ ECE286H1",
    "corequisites": null,
    "exclusions": "CSC411H1, STA314H1, ECE421H1. NOTE: Students not enrolled in the Computer Science Major or Specialist program at FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC317H1": {
    "name": "Computer Graphics",
    "prerequisites": "MAT235Y1/ MAT237Y1/ MAT257Y1/ MAT291H1/ MAT294H1; MAT221H1/ MAT223H1/ MAT240H1/ MAT185H1/ MAT188H1; CSC209H1/ proficiency in C or C++/ APS105H1/ ESC180H1/ CSC180H1",
    "corequisites": null,
    "exclusions": "CSC418H1. NOTE: Students not enrolled in the Computer Science Major or Specialist program at FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC318H1": {
    "name": "The Design of Interactive Computational Media",
    "prerequisites": "Any CSC half-course/ ESC180H1/ ESC190H1/ APS105H1/ APS106H1",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC320H1": {
    "name": "Introduction to Visual Computing",
    "prerequisites": "CSC209H1/(CSC207H1, proficiency in C or C++); MAT221H1/MAT223H1/MAT240H1, (MAT136H1 with a minimum mark of 77)/(MAT137Y1 with a minimum mark of 73)/(MAT157Y1 with a minimum mark of 67)/MAT235Y1/MAT237Y1/MAT257Y1",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC324H1": {
    "name": "Principles of Programming Languages",
    "prerequisites": "CSC263H1/CSC265H1",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC336H1": {
    "name": "Numerical Methods",
    "prerequisites": "CSC148H1/CSC111H1; MAT133Y1(70%)/(MAT135H1, MAT136H1)/MAT135Y1/MAT137Y1/MAT157Y1, MAT221H1/MAT223H1/MAT240H1",
    "corequisites": null,
    "exclusions": "CSC350H1, CSC351H1. NOTE: Students not enrolled in the Computer Science Major or Specialist program at FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC343H1": {
    "name": "Introduction to Databases",
    "prerequisites": "CSC111H1/ CSC165H1/ ?CSC240H1/ ?(MAT135H1, MAT136H1)/ MAT135Y1/ MAT137Y1/ ?MAT157Y1/ (MAT186H1, MAT187H1)/ (MAT194H1, MAT195H1)/ (ESC194H1, ESC195H1); CSC207H1/ ECE345H1/ ESC190H1",
    "corequisites": null,
    "exclusions": "CSC443H1. NOTE: Students not enrolled in the Computer Science Major or Specialist program at FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC367H1": {
    "name": "Parallel Programming",
    "prerequisites": "CSC258H1, CSC209H1",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC369H1": {
    "name": "Operating Systems",
    "prerequisites": "CSC209H1, CSC258H1",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC373H1": {
    "name": "Algorithm Design, Analysis & Complexity",
    "prerequisites": "CSC263H1/CSC265H1",
    "corequisites": null,
    "exclusions": "CSC375H1. NOTE: Students not enrolled in the Computer Science Major or Specialist program at FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC384H1": {
    "name": "Introduction to Artificial Intelligence",
    "prerequisites": "(CSC263H1/? CSC265H1/ ECE345H1/ ECE358H1/ MIE335H1, STA237H1/ STA247H1/? STA255H1/? STA257H1/ STA237H1/ ECE302H1/ STA286H1/ CHE223H1/ CME263H1/ MIE231H1/ MIE236H1/ MSE238H1/ ECE286H1)/ Permission of the Cognitive Science Director",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC399Y1": {
    "name": "Research Opportunity Program",
    "prerequisites": null,
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC401H1": {
    "name": "Natural Language Computing",
    "prerequisites": "CSC207H1/ CSC209H1/ APS105H1/ APS106H1/ ESC180H1/ CSC180H1; STA237H1/ STA247H1/? STA255H1/ ?STA257H1/ ECE302H1/ STA286H1/ CHE223H1/ CME263H1/ MIE231H1/ MIE236H1/ MSE238H1/ ECE286H1",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at the FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC404H1": {
    "name": "Introduction to Video Game Design",
    "prerequisites": "CSC301H1/CSC317H1/CSC318H1/CSC384H1/CSC417H1/CSC418H1/CSC419H1",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at the FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(1) Creative and Cultural Representation",
    "arts_and_science_distribution": "Science"
  },
  "CSC410H1": {
    "name": "Software Testing and Verification",
    "prerequisites": "CSC207H1, CSC236H1/CSC240H1",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at the FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC412H1": {
    "name": "Probabilistic Learning and Reasoning",
    "prerequisites": "CSC311H1/ CSC411H1/ STA314H1/ ECE421H1/ ROB313H1/ CSCC11H3",
    "corequisites": null,
    "exclusions": "STA414H1. NOTE: Students not enrolled in the Computer Science Major or Specialist program at the FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC413H1": {
    "name": "Neural Networks and Deep Learning",
    "prerequisites": "CSC311H1/? CSC411H1/ STA314H1/ ECE421H1/ ROB313H1/ CSCC11H3; MAT235Y1/? MAT237Y1/? MAT257Y1/ MAT291H1/ MAT294H1/ AER210H1/ MAT232H5/ MAT233H5/ MATB41H3; MAT221H1/ MAT223H1/ MAT240H1/ MAT185H1/ MAT188H1/ MAT223H5/ MATA23H3",
    "corequisites": null,
    "exclusions": "CSC321H1/CSC421H1. NOTE: Students not enrolled in the Computer Science Major or Specialist program at the FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC417H1": {
    "name": "Physics-Based Animation",
    "prerequisites": "MAT235Y1/ MAT237Y1/ MAT257Y1/ MAT291H1/ MAT294H1; MAT221H1/ ?MAT223H1/? MAT240H1/ MAT185H1/ MAT188H1; CSC209H1/ ?proficiency in C or C++/ APS105H1/ ESC180H1/ CSC180H1",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC419H1": {
    "name": "Geometry Processing",
    "prerequisites": "MAT235Y1/ MAT237Y1/ MAT257Y1/ MAT291H1/ MAT294H1; MAT221H1/ MAT223H1/ MAT240H1/ MAT185H1/ MAT188H1; CSC209H1/ proficiency in C or C++/ APS105H1/ ESC180H1/ CSC180H1",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at the FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC420H1": {
    "name": "Introduction to Image Understanding",
    "prerequisites": "CSC263H1/ CSC265H1/ ECE345H1/ ECE358H1/ MIE335H1; (MAT135H1, MAT136H1)/ MAT137Y1/ MAT157Y1/ (MAT186H1, MAT187H1)/ (MAT194H1, MAT195H1)/ (ESC194H1, ESC195H1); MAT221H1/ MAT223H1/ MAT240H1/ MAT185H1/ MAT188H1",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at the FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC428H1": {
    "name": "Human-Computer Interaction",
    "prerequisites": "CSC318H1; STA237H1/ STA247H1/ ?STA255H1/ ?STA257H1/ ECE302H1/ STA286H1/ CHE223H1/ CME263H1/ MIE231H1/ MIE236H1/ MSE238H1/ ECE286H1; CSC209H1/? proficiency in C or C++ or Java/ APS105H1/ ESC180H1/ CSC180H1",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at the FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC436H1": {
    "name": "Numerical Algorithms",
    "prerequisites": "CSC336H1/CSC350H1",
    "corequisites": null,
    "exclusions": "CSC351H1. NOTE: Students not enrolled in the Computer Science Major or Specialist program at the FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC454H1": {
    "name": "The Business of Software",
    "prerequisites": "Five CSC half-courses at the 200-level or higher",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at the FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC456H1": {
    "name": "High-Performance Scientific Computing",
    "prerequisites": "CSC436H1/(CSC336H1 (75%))/equivalent mathematical background; CSC209H1/proficiency in C, C++, or Fortran",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at the FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC457H1": {
    "name": "Principles of Computer Networks",
    "prerequisites": "CSC373H1/CSC373H5/CSCC73H3, STA247H1/STA255H1/STA257H1/STA237H1",
    "corequisites": null,
    "exclusions": "CSC358H1; NOTE: Students not enrolled in the Computer Science Major or Specialist program at FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC458H1": {
    "name": "Computer Networking Systems",
    "prerequisites": "CSC209H1, CSC258H1, CSC263H1/CSC265H1, STA247H1/STA255H1/STA257H1/STA237H1/ECO227Y1",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at the FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC463H1": {
    "name": "Computational Complexity and Computability",
    "prerequisites": "CSC236H1/CSC240H1",
    "corequisites": null,
    "exclusions": "CSC363H1/CSCC63H3, CSC365H1. NOTE: Students not enrolled in the Computer Science Major or Specialist program at the FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC465H1": {
    "name": "Formal Methods in Software Design",
    "prerequisites": "CSC236H1/CSC240H1/MAT309H1",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at the FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC469H1": {
    "name": "Operating Systems Design and Implementation",
    "prerequisites": "CSC369H1",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at the FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC473H1": {
    "name": "Advanced Algorithm Design",
    "prerequisites": "CSC373H1, MAT221H1/MAT223H1/MAT240H1",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at the FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC485H1": {
    "name": "Computational Linguistics",
    "prerequisites": "CSC209H1/ APS105H1/ APS106H1/ ESC180H1/ CSC180H1; STA237H1/ STA247H1/? STA255H1/ ?STA257H1/ ECE302H1/ STA286H1/ CHE223H1/ CME263H1/ MIE231H1/ MIE236H1/ MSE238H1/ ECE286H1",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at the FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC486H1": {
    "name": "Knowledge Representation and Reasoning",
    "prerequisites": "CSC384H1, CSC363H1/CSC365H1/CSC373H1/CSC375H1/CSC463H1",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at the FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC488H1": {
    "name": "Compilers and Interpreters",
    "prerequisites": "CSC258H1, CSC324H1, CSC263H1/CSC265H1",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at the FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC491H1": {
    "name": "Capstone Design Project",
    "prerequisites": "Permission of the instructor",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at the FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC494H1": {
    "name": "Computer Science Project",
    "prerequisites": "Three 300-/400-level CSC half-courses, and permission of the Associate Chair, Undergraduate Studies. Contact the Computer Science Undergraduate Office for information about course enrolment procedures.",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "CSC494Y1": {
    "name": "Project in CSC",
    "prerequisites": null,
    "corequisites": null,
    "exclusions": null,
    "campus": "St. George",
    "arts_and_science_breadth": null,
    "arts_and_science_distribution": null
  },
  "CSC495H1": {
    "name": "Computer Science Project",
    "prerequisites": "Three 300-/400-level CSC half-courses, and permission of the Associate Chair, Undergraduate Studies. Contact the Computer Science Undergraduate Office for information about course enrolment procedures.",
    "corequisites": null,
    "exclusions": "NOTE: Students not enrolled in the Computer Science Major or Specialist program at FAS, UTM, or UTSC, or the Data Science Specialist at FAS, are limited to a maximum of three 300-/400-level CSC/ECE half-courses.",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  },
  "JCC250H1": {
    "name": "Computing for Science ",
    "prerequisites": "CHM135H1/CHM136H1/CHM151Y1, 0.5 FCE in MAT (excluding FYF courses)",
    "corequisites": "None",
    "exclusions": "Any CSC course except CSC104H1, CSC196H1, CSC197H1",
    "campus": "St. George",
    "arts_and_science_breadth": "(5) The Physical and Mathematical Universes",
    "arts_and_science_distribution": "Science"
  }
};