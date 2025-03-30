"""
This file contains a dictionary mapping original CSV column names to
simplified labels for easier analysis and visualization.

IMPORTANT:
- Each key must match EXACTLY what appears in your CSV header row.
- If you have repeated columns (like multiple "What is your current country of residence?"),
  give each one a unique new name (e.g. country_residence_1, country_residence_2, etc.)
- Make sure you remove any line that says 'from rename_config import rename_mapping'
  in this file to avoid circular imports.
"""

rename_mapping = {
    # DEMOGRAPHIC / BASIC INFO
    "Which age group do you belong to?": "age_group",
    "How many years of professional experience do you have in IT/software engineering?": "years_of_experience",
    "Which continent do you live on?": "continent",

    # Multiple columns all labeled "What is your current country of residence?" or with .1, .2, .3
    # We'll give each a unique new name:
    "What is your current country of residence?": "country_residence_1",
    "What is your current country of residence?.1": "country_residence_2",
    "What is your current country of residence?.2": "country_residence_3",
    "What is your current country of residence?.3": "country_residence_4",

    # ROLE & ORGANIZATION
    "Which of the following best describes your current role in the organization?": "role",
    "Which of the following best describes your current role in the organization?  [Other]": "role_other",
    "Which of the following organizational types best describes your organization?": "organization_type",
    "In which application domain do you currently primarily work?": "application_domain",
    "In which application domain do you currently primarily work?  [Other]": "application_domain_other",

    # AWARENESS OF DIGITAL SUSTAINABILITY
    "We consider Digital Sustainability an umbrella term for two aspects: Sustainable Software and Sustainable by Software.  Sustainable Software concerns the sustainability of digital solutions in terms of their impact on environmental, economic, technical, social, and individual dimensions, including carbon footprint (Green IT) and process resources.  Sustainable by Software describes digital solutions designed to achieve positive sustainability impacts to help individuals and organizations reach sustainability goals, such as such as the United Nations Sustainable Development Goals (SDGs) more effectively.  Have you heard of this or a similar definition of digital sustainability before?": "heard_of_definition",
    "How frequently do you encounter (e.g., coming across or taking part in) discussions about digital sustainability in your professional environment?": "frequency_sustainability_discussions",
    "How frequently do you encounter (e.g., coming across or taking part in) discussions about digital sustainability in your professional environment?\xa0  [Other]": "frequency_sustainability_discussions_other",

    # TRAINING PARTICIPATION
    "Have you participated in one or more training or educational programs on digital sustainability?": "participated_sustainability_training",
    "How many times training(s) or educational program(s) on digital sustainability did you participate in?": "num_sustainability_trainings",
    "Did you participate in the training(s) or educational program(s) in your private capacity (i.e., you paid for it and participated out of personal interest)?": "training_private_capacity",
    "Please tell us a little about the training or educational programs on digital sustainability you participated in.": "training_description",
    "Are you satisfied with the number of trainings or educational programs you participated in?": "satisfied_num_trainings",

    # REASONS FOR NOT PARTICIPATING IN TRAINING
    "What are the reasons you haven’t participated in a training or educational program on digital sustainability before?  [I was not aware such programs existed]": "no_training_reason_aware",
    "What are the reasons you haven’t participated in a training or educational program on digital sustainability before?  [My organization does not offer such programs]": "no_training_reason_org_no",
    "What are the reasons you haven’t participated in a training or educational program on digital sustainability before?  [I have not had the opportunity to attend]": "no_training_reason_no_opportunity",
    "What are the reasons you haven’t participated in a training or educational program on digital sustainability before?  [I don’t see the need for such training]": "no_training_reason_no_need",
    "What are the reasons you haven’t participated in a training or educational program on digital sustainability before?  [The cost is too high]": "no_training_reason_cost",
    "What are the reasons you haven’t participated in a training or educational program on digital sustainability before?  [Other]": "no_training_reason_other",

    # REASONS FOR NOT PARTICIPATING IN *MORE* TRAINING
    "What are the reasons you haven’t participated in more training or educational programs on digital sustainability?\xa0  [ I was not aware such programs existed]": "no_more_training_reason_aware",
    "What are the reasons you haven’t participated in more training or educational programs on digital sustainability?\xa0  [My organization does not offer such programs]": "no_more_training_reason_org_no",
    "What are the reasons you haven’t participated in more training or educational programs on digital sustainability?\xa0  [I have not had the opportunity to attend]": "no_more_training_reason_no_opportunity",
    "What are the reasons you haven’t participated in more training or educational programs on digital sustainability?\xa0  [I don’t see the need for such training]": "no_more_training_reason_no_need",
    "What are the reasons you haven’t participated in more training or educational programs on digital sustainability?\xa0  [The cost is too high]": "no_more_training_reason_cost",
    "What are the reasons you haven’t participated in more training or educational programs on digital sustainability?\xa0  [Other]": "no_more_training_reason_other",

    # ORGANIZATION & SUSTAINABILITY
    "Does your organization have specific digital sustainability goals or benchmarks for software development projects?": "org_sustainability_goals",
    "Does your organization have a dedicated sustainability or Corporate Social Responsibility (CSR) expert, team or department?": "org_csr_expert_team",
    "Does your organization incorporate sustainable development practices?": "org_incorporates_sustainability",
    "Do different departments in your organization coordinate on sustainability for software development projects?": "org_coordination_on_sustainability",

    # DIMENSIONS OF SUSTAINABILITY (checklists)
    "Which dimensions of sustainability are actively considered in your organization's software development projects?  [Environmental sustainability (e.g., resource efficiency of energy/water/..., carbon footprint)]": "org_dim_env",
    "Which dimensions of sustainability are actively considered in your organization's software development projects?  [Social sustainability (e.g., role of community, shared values, working conditions, and well-being)]": "org_dim_social",
    "Which dimensions of sustainability are actively considered in your organization's software development projects?  [Individual sustainability (e.g., health, competence, access to services)]": "org_dim_individual",
    "Which dimensions of sustainability are actively considered in your organization's software development projects?  [Economic sustainability (e.g., cost efficiency, economic viability)]": "org_dim_economic",
    "Which dimensions of sustainability are actively considered in your organization's software development projects?  [Technical sustainability (e.g., maintainability, scalability)]": "org_dim_technical",
    "Which dimensions of sustainability are actively considered in your organization's software development projects?  [Not sure]": "org_dim_notsure",
    "Which dimensions of sustainability are actively considered in your organization's software development projects?  [Other]": "org_dim_other",

    # ADDITIONAL ORGANIZATIONAL INFO
    "Does your organization report on sustainability practices?": "org_reports_sustainability",
    "Does your organization offer training or resources to employees on sustainable software development practices?": "org_offers_sustainability_training",
    "Can you tell us a little about the training or resources your organization offers?": "org_training_resources_description",

    # POTENTIAL REASONS FOR LACK OF TRAINING/RESOURCES
    "What might be the reasons your organization does not offer any or more training or resources on the design or development of sustainable digital solutions?  [Lack of awareness about the availability of such training]": "org_reason_no_training_awareness",
    "What might be the reasons your organization does not offer any or more training or resources on the design or development of sustainable digital solutions?  [Lack of understanding about the need for such training]": "org_reason_no_training_need",
    "What might be the reasons your organization does not offer any or more training or resources on the design or development of sustainable digital solutions?  [No demand or interest from employees]": "org_reason_no_training_demand",
    "What might be the reasons your organization does not offer any or more training or resources on the design or development of sustainable digital solutions?  [Limited budget or resources for training programs]": "org_reason_no_training_budget",
    "What might be the reasons your organization does not offer any or more training or resources on the design or development of sustainable digital solutions?  [Sustainability is (perhaps) not a priority for the organization]": "org_reason_no_training_priority",
    "What might be the reasons your organization does not offer any or more training or resources on the design or development of sustainable digital solutions?  [Not sure]": "org_reason_no_training_notsure",
    "What might be the reasons your organization does not offer any or more training or resources on the design or development of sustainable digital solutions?  [Other]": "org_reason_no_training_other",

    # CUSTOMER REQUIREMENTS
    "How often is the sustainability of your digital solutions an explicit requirement of the customer or the users?": "customer_requires_sustainability",
    "Why do you think that your customers and users have not asked explicitly to build sustainable digital solutions?": "why_customers_not_asking",

    # PERSONAL TASKS
    "Do you incorporate digital sustainability considerations in your role-specific tasks?": "incorporate_sustainability_in_tasks",
    "What drives you to incorporate digital sustainability in your role-related tasks?  [Organizational policies ]": "drive_sustainability_org_policies",
    "What drives you to incorporate digital sustainability in your role-related tasks?  [Personal beliefs ]": "drive_sustainability_personal_beliefs",
    "What drives you to incorporate digital sustainability in your role-related tasks?  [Client requirements ]": "drive_sustainability_client_req",
    "What drives you to incorporate digital sustainability in your role-related tasks?  [User requirements]": "drive_sustainability_user_req",
    "What drives you to incorporate digital sustainability in your role-related tasks?  [Legal requirements ]": "drive_sustainability_legal_req",
    "What drives you to incorporate digital sustainability in your role-related tasks?  [Other]": "drive_sustainability_other",

    # TOOLS
    "Are there specific tools, software, or frameworks that help you incorporate sustainability into your tasks? (E.g., gathering and managing requirements, writing sustainability-focused tests, optimizing code for less energy consumption.)": "tools_for_sustainability",
    "Can you name the tools, software, and/or frameworks, and tell us how and for what you use them?": "tools_description",

    # HINDERS
    "What hinders you from incorporating sustainability in your role-specific tasks?\xa0  [Lack of personal interest (e.g., no incentive to make the effort to consider sustainability)]": "hinder_no_interest",
    "What hinders you from incorporating sustainability in your role-specific tasks?\xa0  [Lack of knowledge or awareness (e.g., not knowing enough about sustainability impact or best practices)]": "hinder_no_knowledge",
    "What hinders you from incorporating sustainability in your role-specific tasks?\xa0  [Limited resources or budget (e.g., financial constraints, insufficient tools or technology)]": "hinder_limited_resources",
    "What hinders you from incorporating sustainability in your role-specific tasks?\xa0  [Financial constraints (e.g., limited budget)]": "hinder_financial",
    "What hinders you from incorporating sustainability in your role-specific tasks?\xa0  [Insufficient time or competing priorities (e.g., pressing deadlines, other projects taking precedence)]": "hinder_time",
    "What hinders you from incorporating sustainability in your role-specific tasks?\xa0  [Lack of organizational or leadership support (e.g., limited buy-in from management, inadequate policy frameworks)]": "hinder_org_support",
    "What hinders you from incorporating sustainability in your role-specific tasks?\xa0  [Complexity or uncertainty of sustainability solutions (e.g., difficulty measuring impact or navigating standards)]": "hinder_complexity",
    "What hinders you from incorporating sustainability in your role-specific tasks?\xa0  [Cultural or social barriers (e.g., resistance to change, misalignment with organizational culture)]": "hinder_cultural",
    "What hinders you from incorporating sustainability in your role-specific tasks?\xa0  [Resistance from the stakeholders, such as clients and customers]": "hinder_stakeholder_resistance",
    "What hinders you from incorporating sustainability in your role-specific tasks?\xa0  [Other]": "hinder_other",

    # KNOWLEDGE GAPS
    "Which sustainability dimension(s) do you feel you lack sufficient knowledge or tools to effectively address?  [Environmental sustainability (e.g., resource efficiency of energy/water/…, carbon footprint)]": "lack_knowledge_env",
    "Which sustainability dimension(s) do you feel you lack sufficient knowledge or tools to effectively address?  [Social sustainability (e.g., role of community, shared values)]": "lack_knowledge_social",
    "Which sustainability dimension(s) do you feel you lack sufficient knowledge or tools to effectively address?  [Individual sustainability (e.g., health, competence, access to services)]": "lack_knowledge_individual",
    "Which sustainability dimension(s) do you feel you lack sufficient knowledge or tools to effectively address?  [Economic sustainability (e.g., cost efficiency, economic viability)]": "lack_knowledge_economic",
    "Which sustainability dimension(s) do you feel you lack sufficient knowledge or tools to effectively address?  [Technical sustainability (e.g., maintainability, scalability)]": "lack_knowledge_technical",
    "Which sustainability dimension(s) do you feel you lack sufficient knowledge or tools to effectively address?  [Other]": "lack_knowledge_other",

    # SUPPORT OR RESOURCES
    "What additional support or resources would help you integrate digital sustainability into your work?  [Theoretical knowledge (self-study learning material)]": "resource_need_theoretical",
    "What additional support or resources would help you integrate digital sustainability into your work?  [Tutorials (co-present or online training)]": "resource_need_tutorials",
    "What additional support or resources would help you integrate digital sustainability into your work?  [Curricula (educational programs)]": "resource_need_curricula",
    "What additional support or resources would help you integrate digital sustainability into your work?  [Practical knowledge (how-to's)]": "resource_need_practical",
    "What additional support or resources would help you integrate digital sustainability into your work?  [Positive case studies (real-world examples demonstrating benefits, including financial value)]": "resource_need_case_studies",
    "What additional support or resources would help you integrate digital sustainability into your work?  [Structures (frameworks, definitions, standards)]": "resource_need_structures",
    "What additional support or resources would help you integrate digital sustainability into your work?  [Tools (assessment checklists, creativity methods)]": "resource_need_tools",
    "What additional support or resources would help you integrate digital sustainability into your work?  [I do not want to integrate more digital sustainability into my work]": "resource_need_none",
    "What additional support or resources would help you integrate digital sustainability into your work?  [Other]": "resource_need_other",

}
