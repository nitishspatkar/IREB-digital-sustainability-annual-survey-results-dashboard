> [!WARNING]
> TO DO THESE CHANGES YOU NEED TO BE ALLOWED UPLOAD CHANGES!! To be allowed to do this either:
> 
> You make a copy of the project.
> Nitish has to give your github account access to the project.

# How to add new data (GitHub)

1. Upload new data file to the GitHub.
   1. Go To: https://github.com/nitishspatkar/IREB-digital-sustainability-annual-survey-results-dashboard/tree/main/src/data
   2. Press upload file <img width="2926" height="1126" alt="image" src="https://github.com/user-attachments/assets/1f3dd40e-65cf-4e85-8c98-1af688da1a71" />
   3. upload the new data (as an csv) <img width="2690" height="1504" alt="image" src="https://github.com/user-attachments/assets/68e12a28-fc67-45d5-ab4d-b0660f78da0f" />
   4. Deploy it again (can differ depending on how you will have it deployed in the end)
   5. The charts / selection of the years / comparison between the years get automatically generated and named according to the file name (e.g. if you upload 2028.csv the buttons to switch years / select the year to compare to will be named 2028).
      1. <img width="2810" height="1464" alt="image" src="https://github.com/user-attachments/assets/483f39f0-4992-4c09-a66c-ed18560bd3f7" />
      2. <img width="2956" height="1608" alt="image" src="https://github.com/user-attachments/assets/8c63e669-9549-4af9-b124-eb88dda8b21d" />


# How to update description / text

What is written in the description / title is configurable using an file:
<img width="3000" height="948" alt="image" src="https://github.com/user-attachments/assets/60d6736a-f169-47b4-8ef4-76320de4d895" />
To change what is written the file simply has to be modified.

The description for the year 2025 is provided by graphDescriptions2025.json
for 2026 graphDescriptions2026.json etc.
The name must match exactly.
<img width="732" height="658" alt="image" src="https://github.com/user-attachments/assets/c4f30739-a683-4d95-a06b-5e274b30bf78" />

==IF NOTHING IS PROVIDED FOR AN SPECIFIC YEAR 2025 WILL BE USED AS FALLBACK==

For example, step by step for the year 2026

1. Download the old graphDescriptions2025.json and change 2025 to 2026 https://github.com/nitishspatkar/IREB-digital-sustainability-annual-survey-results-dashboard/tree/main/src/data
2. Make the changes you want, e.g. change `"question": "Which age group do you belong to?",` to `"question": "2026 Which age group do you belong to? 2026",`
3. Press upload file <img width="732" height="658" alt="image" src="https://github.com/user-attachments/assets/28b8dff6-380d-4698-9936-601f9b064ef9" />

4. upload the new data (as an csv) <img width="2690" height="1504" alt="image" src="https://github.com/user-attachments/assets/d87fbc16-9f46-4e69-ba1d-620d1bb224f5" />

5. Deploy the changes (can differ depending on how you will have it deployed in the end) <img width="2899" height="814" alt="image" src="https://github.com/user-attachments/assets/5b0b9d25-4fa2-4f7f-9d8a-3f5078de1d31" />


# How to handle changes in the question wording

If for example an question is worded differently / changes slightly (e.g. ) but still the same graph should be used and it should still be compared with the old question.

There are 2 solutions to this:

1. Simply edit the csv so that the name matches to the last year :D.

2. Configure the application to know which questions still are the same, even if the wording changed.
   1. Go to:
   2. Edit the file
   3. Add the new wording e.g. <img width="2966" height="1052" alt="image" src="https://github.com/user-attachments/assets/1f96a0a9-0ac3-4f0d-8c66-dd975f7de2c8" />

