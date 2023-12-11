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

| Story                | # Tasks   | Points | Hours est. | Hours actual |
|----------------------|---------- |--------|------------|--------------|
|#0 Uncategorized Tasks|     8     |        |     52*    |    46h 45m   |
|-----------------------------------------------------------------------| 
|#1 Insert Proposal    |     3     |   3    |     6      |     5h 30m   |
|-----------------------------------------------------------------------|  
|#2 Search Proposal    |     3     |   3    |     4      |     4h 30m   |
|-----------------------------------------------------------------------| 
|#3 Apply for proposal |     3     |   3    |     5      |      5h      |
|-----------------------------------------------------------------------|
|#4 Browse Applications|     3     |   1    |     3      |      4h      |
|-----------------------------------------------------------------------| 
|#5 Accept Application |     3     |   1    |     3      |     5h 50m   |
|-----------------------------------------------------------------------| 
|#6 Browse Applications|     3     |   1    |     3      |     2h 20m   |
|-----------------------------------------------------------------------| 
|#7 Browse Proposals   |     3     |   1    |     3      |      3h      |
|-----------------------------------------------------------------------| 
|#8 Update Proposals   |     3     |   2    |     5      |      5h(NF)  |
|-----------------------------------------------------------------------|
|#10 Delete Proposals  |     3     |   1    |     3      |      2h      |
|-----------------------------------------------------------------------|
NOTE: this includes the sprint planning itself, that could not be extimated beforehand, but only while doing it

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)
    - Estimated hours per task avarage: 96 / 35 ≈ 2.74 hours
    - Actual hours per task avarage:  92 / 35 ≈ 2.63 hours

    - Estimated standard deviation: ≈ 1.40 hours
    - Actual standard deviation: ≈ 1.34 hours

- Total task estimation error ratio: sum of total hours estimation / sum of total hours spent - 1
    - Total Task Estimation Error Ratio = (96 / 92) - 1 ≈ 1.04

  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated: 10
  - Total hours spent: 8.6
  - Nr of automated unit test cases: 106
  - Coverage (if available): 100%
- E2E testing:
  - Total hours estimated: 2
  - Total hours spent: 1
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
  This was the first sprint for the project
- Which ones you were not able to achieve? Why?
  It was the first sprint for this project.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

  > Propose one or two

  - Estimating hours taking into account design and repository management
  - Do not underestimate the time to create a Front End cohesive design
  - Commit far less stories

- One thing you are proud of as a Team!!
  We correctly defined the dependency order of the tasks.
