TEMPLATE FOR RETROSPECTIVE (Team 6)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs. done: 17 committed vs. 17 done
- Total points committed vs. done: 11 committed vs. 11 done
- Nr of hours planned vs. spent (as a team): 37 hours planned vs. 47 hours done

**Remember**a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD if required (you cannot remove items!) 

### Detailed statistics

| Story               | # Tasks                   | Points | Hours est. | Hours actual |
|---------------------|---------------------------|--------|------------|--------------|
| Get Ticket          | - Customer GUI            |   2    |     3      |      3       |
|                     | - Customer API            |        |     3      |      3       |
|                     | - Testing                 |        |     3      |      2       |
|--------------------------------------------------------------------------------------|  
| Call next customer  | - Call next customer API  |   3    |     3      |      4       |
|                     | - Counter officer GUI     |        |     3      |      3       |
|                     | - Testing                 |        |     1      |      1       |
|--------------------------------------------------------------------------------------| 
| Know estimated time | - Calculate and expose    |   1    |     3      |      5       |
|                     |   estimated time          |        |            |              |
|                     | - Show estimated time     |        |     1      |      1       |
|                     | - Testing                 |        |     1      |      1       |
|--------------------------------------------------------------------------------------|
| Counters            | - Services Entity and API |   5    |     2      |      2       |
| configurations      | - Backoffice frontend     |        |     3      |      3       | 
|                     | - Testing                 |        |     2      |      2       |
|--------------------------------------------------------------------------------------| 
| Uncategorized       | - Learning technology     |   -    |     3      |      8       |
| Cards               | - Frontend setup          |        |     2      |      3       |
|                     | - Backend setup           |        |     2      |      4       | 
|                     | - Database schema         |        |     1      |      1       |
|                     | - Preparing for Demo      |        |     1      |      1       |
|--------------------------------------------------------------------------------------| 
   

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)
    - Estimated hours per task avarage: 37 / 18 ≈ 2.06 hours
    - Actual hours per task avarage: 47 / 18 ≈ 2.61 hours

    - Estimated standard deviation: ≈ 0.78 hours
    - Actual standard deviation: ≈ 1.28 hours

- Total task estimation error ratio: sum of total hours estimation / sum of total hours spent - 1
    - Total Task Estimation Error Ratio = (37 / 47) - 1 ≈ -0.2128

  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated: 4
  - Total hours spent: 4
  - Nr of automated unit test cases: 24 for frontend API + 22 for backend
  - Coverage (if available): 91% for frontend (after removing unused User APIs)
- E2E testing:
  - Total hours estimated: 2
  - Total hours spent: 1
- Code review 
  - Total hours estimated: 1
  - Total hours spent: 1
  


## ASSESSMENT

- What caused your errors in estimation (if any)?
  - Inexperience with task estimation:
    It was the first time we planned and estimated hours for tasks, which made it difficult to accurately predict the time needed for each task.

  - Team members availability:
    We initially planned the sprint for a team of 6 members, but only 5 team members were available to work on the tasks. We had to redistribute the workload among the available team members, potentially causing delays or impacting work on other tasks.

  - Learning new technologies
    We had to learn about new technologies, underestimating the time required and the impact on subsequent tasks.

- What lessons did you learn (both positive and negative) in this sprint?
  - Importance of collaboration within the team.
  - Ability to adapt to changes, rescheduling work for 5 team members.
  - Experience with time planning. We understood the difficulty in estimating times and improved our skill in this activity.

- Which improvement goals set in the previous retrospective were you able to achieve? 
- Which ones you were not able to achieve? Why?
  It was the first sprint.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

  > Propose one or two

  - Estimating hours more consciously
  - Do not underestimate the time to be spent and the effort to learn new technologies

- One thing you are proud of as a Team!!
  We completed all the stories we had planned.