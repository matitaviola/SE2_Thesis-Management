TEMPLATE FOR RETROSPECTIVE (Team ##)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs done 10 vs 10
- Total points committed vs done 21 vs 21
- Nr of hours planned vs spent (as a team) 80 vs 80.75

**Remember**  a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _#0_   |    12   |    -   |   49h 30m  |    49h       |
| 14     |    2    |    1   |    1h 30m  |     1h 30m   |
| 26     |    3    |    2   |    5h      |     5h 5m    |
| 15     |    3    |    5   |    4h      |     4h       |   
| 27     |    3    |    5   |    2h 30m  |     2h 30m   | 
| 16     |    3    |    2   |    6h      |     6h       |
| 28     |    3    |    1   |    2h 30m  |     2h 30m   | 
| 29     |    2    |    1   |    1h 30m  |     1h 30m   |
| 17     |    3    |    1   |    2h      |     2h 10m   |
| 18     |    2    |    1   |    1h 30m  |     1h 30m   |
| 30     |    3    |    2   |    4h      |     4h       |

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)
    - Estimated hours per task avarage: 80 / 39 ≈ 2.76 hours
    - Actual hours per task avarage:  80.75 / 39 ≈ 2.07 hours

    - Estimated standard deviation: ≈ 2.64 hours
    - Actual standard deviation: ≈ 2.66 hours

- Total task estimation error ratio: sum of total hours estimation / sum of total hours spent - 1
    - Total Task Estimation Error Ratio = (80 / 80.75) - 1 ≈ - 0.01

  
## QUALITY MEASURES 
- Unit Testing:
  - Total hours estimated 10h 
  - Total hours spent 10h 20m
  - Nr of automated unit test cases 353
  - Coverage (if available) 96.48 (actually higher, for jest considers some configuration files as code)
- E2E testing:
  - Total hours estimated 9h
  - Total hours spent 8h  
- Code review 
  - Total hours estimated 7h 30m
  - Total hours spent 7h 30m  
- Technical Debt management:
  - Total hours estimated 1h 30m
  - Total hours spent 1h 30m
  - Hours estimated for remediation by SonarQube 2h (coverage) 6h 30m (smells)
  - Hours estimated for remediation by SonarQube only for the selected and planned issues 2h
  - Hours spent on remediation 1h 30m
  - debt ratio (as reported by SonarQube under "Measures-Maintainability") 0.9%
  - rating for each quality characteristic reported in SonarQube under "Measures" (namely reliability, security, maintainability ) A, A, A
  


## ASSESSMENT

- What caused your errors in estimation (if any)?
Nothing, this time we estimated everything correctly.

- What lessons did you learn (both positive and negative) in this sprint?
Despite tests looks exaustive, bugs still may be present.

- Which improvement goals set in the previous retrospective were you able to achieve? 
Not underestimating manual testing (for E-to-E testing). 

- Which ones you were not able to achieve? Why?
None, we achieved every goal we set.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.).
> Propose one or two
Using more extensively the application allows to find hidden bugs.
Spend more time on tests allows to design better ones.

- One thing you are proud of as a Team!!
We come very far from the first demo, both in terms of product and team strenght.