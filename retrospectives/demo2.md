TEMPLATE FOR RETROSPECTIVE (Team 6)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs. done: 4 committed vs. 1 done
- Total points committed vs. done: 10 committed vs. 1 done
- Nr of hours planned vs. spent (as a team): 96 hours planned vs. 85 hours and 30 minutes done

**Remember**a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD if required (you cannot remove items!) 

### Detailed statistics

| Story                | # Tasks                   | Points | Hours est. | Hours actual |
|----------------------|---------------------------|--------|------------|--------------|
|#0 Uncategorized Tasks| - Scrum Meeting 1-5       |        |  7h 30m    |   7h 15m     |
|                      | - Demo Preparation        |        |  4h 30m    |      3h      |
|                      | - Generic Support Time    |        |  2h 30m    |      2h      |
|                      | - FE/BE Add file upload   |        |     3      |      4       |
|                      |   to send application     |        |            |              |
|                      | - FE/BE - Proposal insert |        |     3      |      3       |
|                      |   form constraints        |        |            |              |
|                      | - Git Maeve               |        |     3      |      2       |
|                      | - FE - Manual Testing     |        |     2      |      1       |
|                      | - SAML 2.0 Auth           |        |     3      |      7       |
|                      |   Implementation          |        |            |              |
|                      | - Issue - Apply button    |        |     45m    |    45m       |
|                      |   in Thesis Detail page   |        |            |              |
|                      | - Technical & FE Design   |        |     6      |     5        |
|                      |   Meeting                 |        |            |              |
|                      | - Issue - Confirmation    |        |     45m    |     45m      |
|                      |   before accept/reject    |        |            |              |
|                      |   application             |        |            |              |
|                      | - FE Revamp - Application |        |     3      |     3        |
|                      |   Lists and Infos         |        |            |              |
|                      | - Sprint Planning         |        |            |     18       |
|                      | - BE - Add missing filter |        |   1h 30m   |     1h 30m   |
|                      |   fields for proposals    |        |            |              |
|                      | - FE Revamp - Proposals   |        |     3h     |     3h       |
|                      |   Table and Infos         |        |            |              |
|                      | - BE - API inputs         |        |   3h 30m   |     2h 30m   |
|                      |   validation to avoid     |        |            |              |
|                      |   injection               |        |            |              |
|                      | - DB redo to conform FAQs |        |   1h 30m   |     1h 45m   |
|                      | - Testing - DB            |        |     1h     |     1h 10m   |
|                      | - Docker implementation   |        |   3h 30m   |     2h 50m   |
|                      | - FE Revamp - Home Page   |        |   1h 30m   |     1h 30m   |
|                      | - FE Revamp - Error pop-up|        |   1h 30m   |     1h 30m   |
|                      | - Testing - Code Review   |        |   6h       |     6h       |
|---------------------------------------------------------------------------------------| 
|#9 Notify Application | - API                     |   5    |   1h 30m   |   1h 30m     |
|  Decision            | - Testing                 |        |   1h 30m   |      2       |
|---------------------------------------------------------------------------------------|  
|#12 Archive Proposal  | - FE                      |   1    |     1      |      1       |
|                      | - APIs                    |        |     1      |      1       |
|                      | - Testing                 |        |     1      |    1h 30m    |
|---------------------------------------------------------------------------------------| 
|#8 Update Proposal    | - FE - Create Form        |   1    |     2      |              |
|                      | - APIs                    |        |     1      |              |
|                      | - Testing                 |        |     2      |              |
|---------------------------------------------------------------------------------------|
|#11 Update Proposal   | - FE - Create Form        |   1    |     2      |              |
|                      | - APIs                    |        |     1      |              |
|                      | - Testing                 |        |     2      |              |
|---------------------------------------------------------------------------------------|

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)
    - Estimated hours per task avarage: 96 / 37 ≈ 2.60 hours
    - Actual hours per task avarage:  85.5 / 31 ≈ 2.76 hours

    - Estimated standard deviation: ≈ 2.90 hours
    - Actual standard deviation: ≈ 3.20 hours

- Total task estimation error ratio: sum of total hours estimation / sum of total hours spent - 1
    - Total Task Estimation Error Ratio = (96 / 85.5) - 1 ≈ 0.12

  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated: 7h 30m
  - Total hours spent: 4h 40m
  - Nr of automated unit test cases: 136
  - Coverage (if available): 100%
- E2E testing:
  - Total hours estimated: 2
  - Total hours spent: 1
- Code review 
  - Total hours estimated: 6
  - Total hours spent: 6
  


## ASSESSMENT

- What caused your errors in estimation (if any)?
  - A team member left, and difficoulties with new tecnologies

- What lessons did you learn (both positive and negative) in this sprint?

  - Implementing complete stories from the beginning avoids technical debt and issues later
  - External providers (mail, auth) can cause problems even if tested
  - Never underestimate new tecnologies learning time
  - Having design meeting helped us having a more coherent view of the project
  - Frequent scrum meeting helped us stay updated on the other members work

- Which improvement goals set in the previous retrospective were you able to achieve? 
- Which ones you were not able to achieve? Why?
  All of them: we estimated taking into account design and repository management, we dedicated time 
  to create coherent front end design and we committed just 4 stories (instead of the first 9).

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

  > Propose one or two

  - Do not underestimate new technologies learning time and external providers issues
  - Do not start stories if they are supposed not to be finished (to avoid technical debt)

- One thing you are proud of as a Team!!
  We manage to deliver deliver an overall good demo despite one team member left.
