TEMPLATE FOR RETROSPECTIVE (Team 6)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs. done: 9 committed vs. 8 done
- Total points committed vs. done: 16 committed vs. 14 done
- Nr of hours planned vs. spent (as a team): 96 hours planned vs. 92 hours done

**Remember**a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD if required (you cannot remove items!) 

### Detailed statistics

| Story                | # Tasks                   | Points | Hours est. | Hours actual |
|----------------------|---------------------------|--------|------------|--------------|
|#0 Uncategorized Tasks| - Plan the sprint         |        |     -      |      18      |
|                      | - BE - Database Setup     |        |     2      |      2       |
|                      | - FE - Frontend Setup     |        |     2      |      2       |
|                      | - BE - Implement string   |        |     2      |      30m     |
|                      |   based authorization     |        |            |              |
|                      | - FE - Implement string   |        |     2      |      2       |
|                      |   based authorization     |        |            |              |
|                      | - (Re)learning            |        |     12     |      9       |
|                      |   technologies            |        |            |              |
|                      | - Prepare for the         |        |     12     |      12      |
|                      |   presentation            |        |            |              |
|                      | - Technical meetings      |        |     2      |      1h 15m  |
|---------------------------------------------------------------------------------------| 
|#1 Insert Proposal    | - FE - Creatin Form       |   3    |     2      |      2h 30m  |
|                      | - BE - Form APIs          |        |     2      |      2       |
|                      | - Testing                 |        |     2      |      1       |
|---------------------------------------------------------------------------------------|  
|#2 Search Proposal    | - FE - Graphical Part     |   3    |     2      |      2h 30m  |
|                      | - APIs                    |        |     1      |      1       |
|                      | - Testing                 |        |     1      |      1       |
|---------------------------------------------------------------------------------------| 
|#3 Apply for proposal | - FE - Show               |   3    |     1      |      1h 30m  |
|                      | - APIs                    |        |     2      |      1h 30m  |
|                      | - Testing                 |        |     2      |      2       |
|---------------------------------------------------------------------------------------|
|#4 Browse Applications| - FE -Show List of        |   1    |     1      |      2       |
|                      |Applications               |        |            |              |
|                      | - APIs                    |        |     1      |      1h 10m  | 
|                      | - Testing                 |        |     1      |      50m     |
|---------------------------------------------------------------------------------------| 
|#5 Accept Application | - FE - Show Application's |   1    |     1      |      3       |
|                      |  data and button          |        |            |              |
|                      | - APIs                    |        |     1      |      2       |
|                      | - Testing                 |        |     1      |      50m     |
|---------------------------------------------------------------------------------------| 
|#6 Browse Applications| - FE - Show student       |   1    |     1      |      30m     |
| decisions            |  applications             |        |            |              |
|                      | - APIs                    |        |     1      |      1       |
|                      | - Testing                 |        |     1      |      50m     |
|---------------------------------------------------------------------------------------| 
|#7 Browse Proposals   | - FE - Proposals list     |   1    |     1      |      1h 30m  |
|                      |  for the professor        |        |            |              |
|                      | - APIs                    |        |     1      |      1       |
|                      | - Testing                 |        |     1      |      30m     |
|---------------------------------------------------------------------------------------| 
|#8 Update Proposals   | - FE - Create Form        |   2    |     1      |      1(NF)   |
|                      | - APIs                    |        |     2      |      2(NF)   |
|                      | - Testing                 |        |     2      |      2(NF)   |
|---------------------------------------------------------------------------------------|
|#10 Delete Proposals  | - FE - "Delete" button    |   1    |     1      |      45m     |
|                      | - APIs                    |        |     1      |      45m     |
|                      | - Testing                 |        |     1      |      30m     |
|---------------------------------------------------------------------------------------|
   

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)
    - Estimated hours per task avarage: 96 / 35 ≈ 2.74 hours
    - Actual hours per task avarage: ??? / 35 ≈ ??? hours

    - Estimated standard deviation: ≈ ??? hours
    - Actual standard deviation: ≈ ??? hours

- Total task estimation error ratio: sum of total hours estimation / sum of total hours spent - 1
    - Total Task Estimation Error Ratio = (96 / ???) - 1 ≈ -0.2128

  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated: 10
  - Total hours spent: ???
  - Nr of automated unit test cases: 106
  - Coverage (if available): 100%
- E2E testing:
  - Total hours estimated: 2
  - Total hours spent: 2h 30m
- Code review 
  - Total hours estimated: 2
  - Total hours spent: 1h 30m
  


## ASSESSMENT

- What caused your errors in estimation (if any)?
  - The management of various merge on the main branch

- What lessons did you learn (both positive and negative) in this sprint?
  - Managing git, in particular merging the different branches
  - It is import to have a design meeting, so that we can all have a clear, shared schema to follow
  - Opt for "quality over quantity". We thought that committing more stories in a completely usable albeit not so eye-pleasing form
    would have allowed us to polish them in the second sprint in order to have a first release with lots of working stories. This however could create issues with the ever-changing requirements
  - If we decide to (momentarily) skip one story, we should ask the Product Owner with wich one we should substitute it, rather than just following the reported business value
 

- Which improvement goals set in the previous retrospective were you able to achieve? 
- Which ones you were not able to achieve? Why?
  It was the first sprint for this project.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

  > Propose one or two

  - Estimating hours taking into account design and repository management
  - Do not underestimate the time to create a Front End cohesive design
  - Commit far less stories

- One thing you are proud of as a Team!!
  We completed a lot of fully functional stories.
