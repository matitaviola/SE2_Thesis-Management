TEMPLATE FOR RETROSPECTIVE (Team 6)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs done: 3 vs 3
- Total points committed vs done: 6 vs 6
- Nr of hours planned vs spent (as a team) 80 vs ???

**Remember**  a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _#0_   |   19    |    -   |     61     |      ???     |
|   8    |    3    |    2   |      6     |       6      |
|  11    |    3    |    2   |      5     |     2h 30m   |
|  13    |    4    |    2   |      8     |       6      |
   

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Hours per task (average, standard deviation) ???
- Total task estimation error ratio: sum of total hours estimation / sum of total hours spent -1 ???

  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated 4h
  - Total hours spent 2h
  - Nr of automated unit test cases 181 
  - Coverage (if available) 100% (NOTE: Sonarcloud shows less for it takes into account also the part that have been manually tested)
- E2E testing:
  - Total hours estimated 2h
  - Total hours spent 2h 15m
- Code review 
  - Total hours estimated 6h
  - Total hours spent 6h
- Technical Debt management:
  - Total hours estimated 6h
  - Total hours spent 6h 15m
  - Hours estimated for remediation by SonarQube 11h 20m*
  - Hours estimated for remediation by SonarQube only for the selected and planned issues 20m*
  - Hours spent on remediation 6h 15m
  - debt ratio (as reported by SonarQube under "Measures-Maintainability") 0.6%
  - rating for each quality characteristic reported in SonarQube under "Measures" (namely reliability, security, maintainability )  A, A, A
  
*Sonarcloud does not present an estimated "remediation effort" for the security hotspot, that is why there is such a difference between sonarcloud estimation and ours

## ASSESSMENT

- What caused your errors in estimation (if any)?
???

- What lessons did you learn (both positive and negative) in this sprint?
???

- Which improvement goals set in the previous retrospective were you able to achieve? 
???
  
- Which ones you were not able to achieve? Why?
???

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)


> Propose one or two

- One thing you are proud of as a Team!!
We were able to quickly adapt to the "disappearance" of a team member and produce an acceptable amount of work. We also kept on improving the graphical interface of the application, which is one of the underlying issues of the app.