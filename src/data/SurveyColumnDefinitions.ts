export type ColumnDefinition<K extends string> = {
  readonly key: K;
  readonly header: string;
};

export const columnDefinitions = [
  { key: "responseId", header: "Response ID" },
  { key: "dateSubmitted", header: "Date submitted" },
  { key: "lastPage", header: "Last page" },
  { key: "startLanguage", header: "Start language" },
  { key: "seed", header: "Seed" },
  {
    key: "ageGroup",
    header: "Which age group do you belong to?",
  },
  {
    key: "professionalExperienceYears",
    header:
      "How many years of professional experience do you have in IT/software engineering? ",
  },
  {
    key: "continent",
    header: "Which continent do you live on? ",
  },
  {
    key: "countryOfResidence",
    header: "What is your current country of residence? ",
  },
  {
    key: "countryOfResidenceAlt1",
    header: "What is your current country of residence?",
  },
  {
    key: "countryOfResidenceAlt2",
    header: "What is your current country of residence?",
  },
  {
    key: "countryOfResidenceAlt3",
    header: "What is your current country of residence?",
  },
  {
    key: "countryOfResidenceAlt4",
    header: "What is your current country of residence?",
  },
  {
    key: "role",
    header:
      "Which of the following best describes your current role in the organization? ",
  },
  {
    key: "roleOther",
    header:
      "Which of the following best describes your current role in the organization?  [Other]",
  },
  {
    key: "organizationType",
    header:
      "Which of the following organizational types best describes your organization? ",
  },
  {
    key: "primaryApplicationDomain",
    header: "In which application domain do you currently primarily work? ",
  },
  {
    key: "primaryApplicationDomainOther",
    header:
      "In which application domain do you currently primarily work?  [Other]",
  },
  {
    key: "heardOfDigitalSustainabilityDefinition",
    header:
      "We consider Digital Sustainability an umbrella term for two aspects: Sustainable Software and Sustainable by Software.  Sustainable Software concerns the sustainability of digital solutions in terms of their impact on environmental, economic, technical, social, and individual dimensions, including carbon footprint (Green IT) and process resources.  Sustainable by Software describes digital solutions designed to achieve positive sustainability impacts to help individuals and organizations reach sustainability goals, such as such as the United Nations Sustainable Development Goals (SDGs) more effectively.  Have you heard of this or a similar definition of digital sustainability before?  ",
  },
  {
    key: "discussionFrequency",
    header:
      "How frequently do you encounter (e.g., coming across or taking part in) discussions about digital sustainability in your professional environment?  ",
  },
  {
    key: "discussionFrequencyOther",
    header:
      "How frequently do you encounter (e.g., coming across or taking part in) discussions about digital sustainability in your professional environment?   [Other]",
  },
  {
    key: "participatedInTraining",
    header:
      "Have you participated in one or more training or educational programs on digital sustainability? ",
  },
  {
    key: "trainingNotAware",
    header:
      "What are the reasons you haven’t participated in a training or educational program on digital sustainability before?  [I was not aware such programs existed]",
  },
  {
    key: "trainingNoOrganizationOffer",
    header:
      "What are the reasons you haven’t participated in a training or educational program on digital sustainability before?  [My organization does not offer such programs]",
  },
  {
    key: "trainingNoOpportunity",
    header:
      "What are the reasons you haven’t participated in a training or educational program on digital sustainability before?  [I have not had the opportunity to attend]",
  },
  {
    key: "trainingNoNeed",
    header:
      "What are the reasons you haven’t participated in a training or educational program on digital sustainability before?  [I don’t see the need for such training]",
  },
  {
    key: "trainingTooExpensive",
    header:
      "What are the reasons you haven’t participated in a training or educational program on digital sustainability before?  [The cost is too high]",
  },
  {
    key: "trainingOtherReason",
    header:
      "What are the reasons you haven’t participated in a training or educational program on digital sustainability before?  [Other]",
  },
  {
    key: "trainingCount",
    header:
      "How many times training(s) or educational program(s) on digital sustainability did you participate in?  ",
  },
  {
    key: "trainingPrivateCapacity",
    header:
      "Did you participate in the training(s) or educational program(s) in your private capacity (i.e., you paid for it and participated out of personal interest)? ",
  },
  {
    key: "trainingDescription",
    header:
      "Please tell us a little about the training or educational programs on digital sustainability you participated in. ",
  },
  {
    key: "trainingSatisfaction",
    header:
      "Are you satisfied with the number of trainings or educational programs you participated in?  ",
  },
  {
    key: "notMoreTrainingNotAware",
    header:
      "What are the reasons you haven’t participated in more training or educational programs on digital sustainability?   [ I was not aware such programs existed]",
  },
  {
    key: "notMoreTrainingNoOrganization",
    header:
      "What are the reasons you haven’t participated in more training or educational programs on digital sustainability?   [My organization does not offer such programs]",
  },
  {
    key: "notMoreTrainingNoOpportunity",
    header:
      "What are the reasons you haven’t participated in more training or educational programs on digital sustainability?   [I have not had the opportunity to attend]",
  },
  {
    key: "notMoreTrainingNoNeed",
    header:
      "What are the reasons you haven’t participated in more training or educational programs on digital sustainability?   [I don’t see the need for such training]",
  },
  {
    key: "notMoreTrainingTooExpensive",
    header:
      "What are the reasons you haven’t participated in more training or educational programs on digital sustainability?   [The cost is too high]",
  },
  {
    key: "notMoreTrainingOther",
    header:
      "What are the reasons you haven’t participated in more training or educational programs on digital sustainability?   [Other]",
  },
  {
    key: "organizationHasDigitalSustainabilityGoals",
    header:
      "Does your organization have specific digital sustainability goals or benchmarks for software development projects? ",
  },
  {
    key: "organizationHasSustainabilityTeam",
    header:
      "Does your organization have a dedicated sustainability or Corporate Social Responsibility (CSR) expert, team or department? ",
  },
  {
    key: "organizationIncorporatesSustainablePractices",
    header:
      "Does your organization incorporate sustainable development practices? ",
  },
  {
    key: "organizationDepartmentCoordination",
    header:
      "Do different departments in your organization coordinate on sustainability for software development projects? ",
  },
  {
    key: "considerEnvironmental",
    header:
      "Which dimensions of sustainability are actively considered in your organization's software development projects?  [Environmental sustainability (e.g., resource efficiency of energy/water/..., carbon footprint)]",
  },
  {
    key: "considerSocial",
    header:
      "Which dimensions of sustainability are actively considered in your organization's software development projects?  [Social sustainability (e.g., role of community, shared values, working conditions, and well-being)]",
  },
  {
    key: "considerIndividual",
    header:
      "Which dimensions of sustainability are actively considered in your organization's software development projects?  [Individual sustainability (e.g., health, competence, access to services)]",
  },
  {
    key: "considerEconomic",
    header:
      "Which dimensions of sustainability are actively considered in your organization's software development projects?  [Economic sustainability (e.g., cost efficiency, economic viability)]",
  },
  {
    key: "considerTechnical",
    header:
      "Which dimensions of sustainability are actively considered in your organization's software development projects?  [Technical sustainability (e.g., maintainability, scalability)]",
  },
  {
    key: "considerOther",
    header:
      "Which dimensions of sustainability are actively considered in your organization's software development projects?  [Other]",
  },
  {
    key: "organizationReportsOnSustainability",
    header: "Does your organization report on sustainability practices?  ",
  },
  {
    key: "organizationOffersTraining",
    header:
      "Does your organization offer training or resources to employees on sustainable software development practices? ",
  },
  {
    key: "organizationTrainingDescription",
    header:
      "Can you tell us a little about the training or resources your organization offers?  ",
  },
  {
    key: "orgNoTrainingLackAwareness",
    header:
      "What might be the reasons your organization does not offer any or more training or resources on the design or development of sustainable digital solutions?  [Lack of awareness about the availability of such training]",
  },
  {
    key: "orgNoTrainingLackUnderstanding",
    header:
      "What might be the reasons your organization does not offer any or more training or resources on the design or development of sustainable digital solutions?  [Lack of understanding about the need for such training]",
  },
  {
    key: "orgNoTrainingNoDemand",
    header:
      "What might be the reasons your organization does not offer any or more training or resources on the design or development of sustainable digital solutions?  [No demand or interest from employees]",
  },
  {
    key: "orgNoTrainingLimitedBudget",
    header:
      "What might be the reasons your organization does not offer any or more training or resources on the design or development of sustainable digital solutions?  [Limited budget or resources for training programs]",
  },
  {
    key: "orgNoTrainingNotPriority",
    header:
      "What might be the reasons your organization does not offer any or more training or resources on the design or development of sustainable digital solutions?  [Sustainability is (perhaps) not a priority for the organization]",
  },
  {
    key: "orgNoTrainingNotSure",
    header:
      "What might be the reasons your organization does not offer any or more training or resources on the design or development of sustainable digital solutions?  [Not sure]",
  },
  {
    key: "orgNoTrainingOther",
    header:
      "What might be the reasons your organization does not offer any or more training or resources on the design or development of sustainable digital solutions?  [Other]",
  },
  {
    key: "customerRequirementFrequency",
    header:
      "How often is the sustainability of your digital solutions an explicit requirement of the customer or the users? ",
  },
  {
    key: "customerNotRequestingReasons",
    header:
      "Why do you think that your customers and users have not asked explicitly to build sustainable digital solutions? ",
  },
  {
    key: "personIncorporatesSustainability",
    header:
      "Do you incorporate digital sustainability considerations in your role-specific tasks?  ",
  },
  {
    key: "driveOrganizationalPolicies",
    header:
      "What drives you to incorporate digital sustainability in your role-related tasks?  [Organizational policies ]",
  },
  {
    key: "drivePersonalBeliefs",
    header:
      "What drives you to incorporate digital sustainability in your role-related tasks?  [Personal beliefs ]",
  },
  {
    key: "driveClientRequirements",
    header:
      "What drives you to incorporate digital sustainability in your role-related tasks?  [Client requirements ]",
  },
  {
    key: "driveUserRequirements",
    header:
      "What drives you to incorporate digital sustainability in your role-related tasks?  [User requirements]",
  },
  {
    key: "driveLegalRequirements",
    header:
      "What drives you to incorporate digital sustainability in your role-related tasks?  [Legal requirements ]",
  },
  {
    key: "driveOther",
    header:
      "What drives you to incorporate digital sustainability in your role-related tasks?  [Other]",
  },
  {
    key: "roleConsiderEnvironmental",
    header:
      "Which sustainability dimensions do you consider in your role-specific tasks?   [Environmental sustainability (e.g., resource efficiency of energy/water/…, carbon footprint)]",
  },
  {
    key: "roleConsiderSocial",
    header:
      "Which sustainability dimensions do you consider in your role-specific tasks?   [Social sustainability (e.g., the role of community, shared values, working conditions, and well-being)  ]",
  },
  {
    key: "roleConsiderIndividual",
    header:
      "Which sustainability dimensions do you consider in your role-specific tasks?   [Individual sustainability (e.g., health, competence, access to services)]",
  },
  {
    key: "roleConsiderEconomic",
    header:
      "Which sustainability dimensions do you consider in your role-specific tasks?   [Economic sustainability (e.g., cost efficiency, economic viability)]",
  },
  {
    key: "roleConsiderTechnical",
    header:
      "Which sustainability dimensions do you consider in your role-specific tasks?   [Technical sustainability (e.g., maintainability, scalability)]",
  },
  {
    key: "roleConsiderOther",
    header:
      "Which sustainability dimensions do you consider in your role-specific tasks?   [Other]",
  },
  {
    key: "usesTools",
    header:
      "Are there specific tools, software, or frameworks that help you incorporate sustainability into your tasks? (E.g., gathering and managing requirements, writing sustainability-focused tests, optimizing code for less energy consumption.) ",
  },
  {
    key: "toolsDescription",
    header:
      "Can you name the tools, software, and/or frameworks, and tell us how and for what you use them?  ",
  },
  {
    key: "hindranceLackInterest",
    header:
      "What hinders you from incorporating sustainability in your role-specific tasks?   [Lack of personal interest (e.g., no incentive to make the effort to consider sustainability)]",
  },
  {
    key: "hindranceLackKnowledge",
    header:
      "What hinders you from incorporating sustainability in your role-specific tasks?   [Lack of knowledge or awareness (e.g., not knowing enough about sustainability impact or best practices)]",
  },
  {
    key: "hindranceLimitedResources",
    header:
      "What hinders you from incorporating sustainability in your role-specific tasks?   [Limited resources or budget (e.g., financial constraints, insufficient tools or technology)]",
  },
  {
    key: "hindranceFinancialConstraints",
    header:
      "What hinders you from incorporating sustainability in your role-specific tasks?   [Financial constraints (e.g., limited budget)]",
  },
  {
    key: "hindranceInsufficientTime",
    header:
      "What hinders you from incorporating sustainability in your role-specific tasks?   [Insufficient time or competing priorities (e.g., pressing deadlines, other projects taking precedence)]",
  },
  {
    key: "hindranceLackSupport",
    header:
      "What hinders you from incorporating sustainability in your role-specific tasks?   [Lack of organizational or leadership support (e.g., limited buy-in from management, inadequate policy frameworks)]",
  },
  {
    key: "hindranceComplexity",
    header:
      "What hinders you from incorporating sustainability in your role-specific tasks?   [Complexity or uncertainty of sustainability solutions (e.g., difficulty measuring impact or navigating standards)]",
  },
  {
    key: "hindranceCulturalBarriers",
    header:
      "What hinders you from incorporating sustainability in your role-specific tasks?   [Cultural or social barriers (e.g., resistance to change, misalignment with organizational culture)]",
  },
  {
    key: "hindranceStakeholderResistance",
    header:
      "What hinders you from incorporating sustainability in your role-specific tasks?   [Resistance from the stakeholders, such as clients and customers]",
  },
  {
    key: "hindranceOther",
    header:
      "What hinders you from incorporating sustainability in your role-specific tasks?   [Other]",
  },
  {
    key: "lackKnowledgeEnvironmental",
    header:
      "Which sustainability dimension(s) do you feel you lack sufficient knowledge or tools to effectively address?  [Environmental sustainability (e.g., resource efficiency of energy/water/…, carbon footprint)]",
  },
  {
    key: "lackKnowledgeSocial",
    header:
      "Which sustainability dimension(s) do you feel you lack sufficient knowledge or tools to effectively address?  [Social sustainability (e.g., role of community, shared values)]",
  },
  {
    key: "lackKnowledgeIndividual",
    header:
      "Which sustainability dimension(s) do you feel you lack sufficient knowledge or tools to effectively address?  [Individual sustainability (e.g., health, competence, access to services)]",
  },
  {
    key: "lackKnowledgeEconomic",
    header:
      "Which sustainability dimension(s) do you feel you lack sufficient knowledge or tools to effectively address?  [Economic sustainability (e.g., cost efficiency, economic viability)]",
  },
  {
    key: "lackKnowledgeTechnical",
    header:
      "Which sustainability dimension(s) do you feel you lack sufficient knowledge or tools to effectively address?  [Technical sustainability (e.g., maintainability, scalability)]",
  },
  {
    key: "lackKnowledgeNone",
    header:
      "Which sustainability dimension(s) do you feel you lack sufficient knowledge or tools to effectively address?  [I have sufficient knowledge and tools to effectively address all five sustainability dimensions]",
  },
  {
    key: "lackKnowledgeOther",
    header:
      "Which sustainability dimension(s) do you feel you lack sufficient knowledge or tools to effectively address?  [Other]",
  },
  {
    key: "supportNeedTheoretical",
    header:
      "What additional support or resources would help you integrate digital sustainability into your work?  [Theoretical knowledge (self-study learning material)]",
  },
  {
    key: "supportNeedTutorials",
    header:
      "What additional support or resources would help you integrate digital sustainability into your work?  [Tutorials (co-present or online training)]",
  },
  {
    key: "supportNeedCurricula",
    header:
      "What additional support or resources would help you integrate digital sustainability into your work?  [Curricula (educational programs)]",
  },
  {
    key: "supportNeedPractical",
    header:
      "What additional support or resources would help you integrate digital sustainability into your work?  [Practical knowledge (how-to's)]",
  },
  {
    key: "supportNeedCaseStudies",
    header:
      "What additional support or resources would help you integrate digital sustainability into your work?  [Positive case studies (real-world examples demonstrating benefits, including financial value)]",
  },
  {
    key: "supportNeedStructures",
    header:
      "What additional support or resources would help you integrate digital sustainability into your work?  [Structures (frameworks, definitions, standards)]",
  },
  {
    key: "supportNeedTools",
    header:
      "What additional support or resources would help you integrate digital sustainability into your work?  [Tools (assessment checklists, creativity methods)]",
  },
  {
    key: "supportNeedNone",
    header:
      "What additional support or resources would help you integrate digital sustainability into your work?  [I do not want to integrate more digital sustainability into my work]",
  },
  {
    key: "supportNeedOther",
    header:
      "What additional support or resources would help you integrate digital sustainability into your work?  [Other]",
  },
] as const satisfies ReadonlyArray<ColumnDefinition<string>>;

export type SurveyColumnKey = (typeof columnDefinitions)[number]["key"];
