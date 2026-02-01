> [!warning] TO DO THESE CHANGES YOU NEED TO BE ALLOWED UPLOAD CHANGES!!
> To be allowed to this either:
>
> 1. Nitish gives you access to the project (account needed)
> 2. You make a copy of the project.

# How to add new data (GitHub)

1. Upload new data file to the GitHub.
   1. Go To: https://github.com/nitishspatkar/IREB-digital-sustainability-annual-survey-results-dashboard/tree/main/src/data
   2. Press upload file ![[Pasted image 20260201145718.png]]
   3. upload the new data (as an csv) ![[Pasted image 20260201145855.png]]
   4. Deploy it again (can differ depending on how you will have it deployed in the end)
   5. The charts / selection of the years / comparison between the years get automatically generated and named according to the file name (e.g. if you upload 2028.csv the buttons to switch years / select the year to compare to will be named 2028).
      1. ![[Pasted image 20260201150128.png|525]]
      2. ![[Pasted image 20260201150315.png]]

# How to update description / text

What is written in the description / title is configurable using an file:
![[Pasted image 20260201151919.png]]
To change what is written the file simply has to be modified.

The description for the year 2025 is provided by graphDescriptions2025.json
for 2026 graphDescriptions2026.json etc.
The name must match exactly.
![[Pasted image 20260201152243.png|100]]
==IF NOTHING IS PROVIDED FOR AN SPECIFIC YEAR 2025 WILL BE USED AS FALLBACK==

For example, step by step for the year 2026

1. Download the old graphDescriptions2025.json and change 2025 to 2026 https://github.com/nitishspatkar/IREB-digital-sustainability-annual-survey-results-dashboard/tree/main/src/data
2. Make the changes you want, e.g. change `"question": "Which age group do you belong to?",` to `"question": "2026 Which age group do you belong to? 2026",`
3. Press upload file ![[Pasted image 20260201145718.png]]
4. upload the new data (as an csv) ![[Pasted image 20260201145855.png]]
5. Deploy the changes (can differ depending on how you will have it deployed in the end) ![[Pasted image 20260201154147.png]]

# How to handle changes in the question wording

If for example an question is worded differently / changes slightly (e.g. ) but still the same graph should be used and it should still be compared with the old question.

There are 2 solutions to this:

1. Simply edit the csv so that the name matches to the last year :D.

2. Configure the application to know which questions still are the same, even if the wording changed.
   1. Go to:
   2. Edit the file
   3. Add the new wording e.g. ![[Pasted image 20260201154655.png]]
