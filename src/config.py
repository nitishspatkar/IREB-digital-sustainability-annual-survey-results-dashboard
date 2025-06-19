"""Configuration settings for the dashboard."""

# ---- Centralized Color and Style Variables ----
STYLE_VARS = {
    "PRIMARY_COLOR": "#831E82",
    "SECONDARY_COLOR": "#A450A3",
    "TERTIARY_COLOR": "#C581C4",
    "QUATERNARY_COLOR": "#E6B3E5",
    "BACKGROUND_COLOR": "#f8f9fa",
    "CARD_HEADER_COLOR": "#831E82",
    "FONT_FAMILY": "Helvetica",
    "FONT_SIZE": 14,
    "CARD_MARGIN": "mb-4",
    "ROW_MARGIN": "mb-5 g-4",
}

# Color palette for charts
MULTI_COLOR_PALETTE = [
    STYLE_VARS["PRIMARY_COLOR"],
    STYLE_VARS["SECONDARY_COLOR"],
    STYLE_VARS["TERTIARY_COLOR"],
    STYLE_VARS["QUATERNARY_COLOR"]
]

PRIMARY_COLOR = STYLE_VARS["PRIMARY_COLOR"]

# Sidebar style
SIDEBAR_STYLE = {
    "position": "fixed",
    "top": 0,
    "left": 0,
    "bottom": 0,
    "width": "20rem",
    "padding": "2rem 1rem",
    "background-color": STYLE_VARS["PRIMARY_COLOR"],
    "color": "white",
    "overflow-y": "auto"
}

# Content style
CONTENT_STYLE = {
    "margin-left": "22rem",
    "margin-right": "2rem",
    "padding": "2rem 1rem",
    "background-color": STYLE_VARS["BACKGROUND_COLOR"],
}

# Data configuration
DATA_FOLDER = "data"
AVAILABLE_YEARS = [2025, 2026]  # Add more as needed

# Column groups for each section
DEMOGRAPHIC_COLS = [
    "Which age group do you belong to?",
    "How many years of professional experience do you have in IT/software engineering?",
    "Which continent do you live on?",
    "What is your current country of residence?",  # First instance
    "What is your current country of residence?.1",  # Second instance
    "What is your current country of residence?.2",  # Third instance
    "What is your current country of residence?.3",  # Fourth instance
    "What is your current country of residence?.4",  # Fifth instance
    "Which of the following best describes your current role in the organization?",
    "Which of the following organizational types best describes your organization?",
    "In which application domain do you currently primarily work?"
]

AWARENESS_COLS = [
    "We consider Digital Sustainability an umbrella term for two aspects: Sustainable Software and Sustainable by Software. Have you heard of this or a similar definition of digital sustainability before?",
    "How frequently do you encounter (e.g., coming across or taking part in) discussions about digital sustainability in your professional environment?",
    "How frequently do you encounter (e.g., coming across or taking part in) discussions about digital sustainability in your professional environment? [Other]",
    "Have you participated in one or more training or educational programs on digital sustainability?",
    "Are you satisfied with the number of trainings or educational programs you participated in?",
    "How many times training(s) or educational program(s) on digital sustainability did you participate in?"
]

ORGANIZATION_COLS = [
    "Does your organization have specific digital sustainability goals or benchmarks for software development projects?",
    "Does your organization have a dedicated sustainability or Corporate Social Responsibility (CSR) expert, team or department?",
    "Does your organization incorporate sustainable development practices?",
    "Do different departments in your organization coordinate on sustainability for software development projects?",
    "Does your organization report on sustainability practices?",
    "Does your organization offer training or resources to employees on sustainable software development practices?",
    "Can you tell us a little about the training or resources your organization offers?",
    "How often is the sustainability of your digital solutions an explicit requirement of the customer or the users?",
    "Why do you think that your customers and users have not asked explicitly to build sustainable digital solutions?"
]

ORG_MULTI_TRAINING = [
    "What might be the reasons your organization does not offer any or more training or resources on the design or development of sustainable digital solutions? [Lack of awareness about the availability of such training]",
    "What might be the reasons your organization does not offer any or more training or resources on the design or development of sustainable digital solutions? [Lack of understanding about the need for such training]",
    "What might be the reasons your organization does not offer any or more training or resources on the design or development of sustainable digital solutions? [No demand or interest from employees]",
    "What might be the reasons your organization does not offer any or more training or resources on the design or development of sustainable digital solutions? [Limited budget or resources for training programs]",
    "What might be the reasons your organization does not offer any or more training or resources on the design or development of sustainable digital solutions? [Sustainability is (perhaps) not a priority for the organization]",
    "What might be the reasons your organization does not offer any or more training or resources on the design or development of sustainable digital solutions? [Not sure]",
    "What might be the reasons your organization does not offer any or more training or resources on the design or development of sustainable digital solutions? [Other]"
]

ORG_MULTI_DIMENSIONS = [
    'Which dimensions of sustainability are actively considered in your organization\'s software development projects?  [Environmental sustainability (e.g., resource efficiency of energy/water/…, carbon footprint)]',
    'Which dimensions of sustainability are actively considered in your organization\'s software development projects?  [Social sustainability (e.g., role of community, shared values)]',
    'Which dimensions of sustainability are actively considered in your organization\'s software development projects?  [Individual sustainability (e.g., health, competence, access to services)]',
    'Which dimensions of sustainability are actively considered in your organization\'s software development projects?  [Economic sustainability (e.g., cost efficiency, economic viability)]',
    'Which dimensions of sustainability are actively considered in your organization\'s software development projects?  [Technical sustainability (e.g., maintainability, scalability)]',
    'Which dimensions of sustainability are actively considered in your organization\'s software development projects?  [Not sure]',
    'Which dimensions of sustainability are actively considered in your organization\'s software development projects?  [Other]'
]

JOB_TASK_COLS = [
    "Do you incorporate digital sustainability considerations in your role-specific tasks?",
    "Are there specific tools, software, or frameworks that help you incorporate sustainability into your tasks? (E.g., gathering and managing requirements, writing sustainability-focused tests, optimizing code for less energy consumption.)",
    "Can you name the tools, software, and/or frameworks, and tell us how and for what you use them?"
]

JOB_TASK_MULTI_DRIVES = [
    "What drives you to incorporate digital sustainability in your role-related tasks? [Organizational policies ]",
    "What drives you to incorporate digital sustainability in your role-related tasks? [Personal beliefs ]",
    "What drives you to incorporate digital sustainability in your role-related tasks? [Client requirements ]",
    "What drives you to incorporate digital sustainability in your role-related tasks? [User requirements]",
    "What drives you to incorporate digital sustainability in your role-related tasks? [Legal requirements ]",
    "What drives you to incorporate digital sustainability in your role-related tasks? [Other]"
]

JOB_TASK_MULTI_HINDER = [
    "What hinders you from incorporating sustainability in your role-specific tasks? [Lack of personal interest (e.g., no incentive to make the effort to consider sustainability)]",
    "What hinders you from incorporating sustainability in your role-specific tasks? [Lack of knowledge or awareness (e.g., not knowing enough about sustainability impact or best practices)]",
    "What hinders you from incorporating sustainability in your role-specific tasks? [Limited resources or budget (e.g., financial constraints, insufficient tools or technology)]",
    "What hinders you from incorporating sustainability in your role-specific tasks? [Financial constraints (e.g., limited budget)]",
    "What hinders you from incorporating sustainability in your role-specific tasks? [Insufficient time or competing priorities (e.g., pressing deadlines, other projects taking precedence)]",
    "What hinders you from incorporating sustainability in your role-specific tasks? [Lack of organizational or leadership support (e.g., limited buy-in from management, inadequate policy frameworks)]",
    "What hinders you from incorporating sustainability in your role-specific tasks? [Complexity or uncertainty of sustainability solutions (e.g., difficulty measuring impact or navigating standards)]",
    "What hinders you from incorporating sustainability in your role-specific tasks? [Cultural or social barriers (e.g., resistance to change, misalignment with organizational culture)]",
    "What hinders you from incorporating sustainability in your role-specific tasks? [Resistance from the stakeholders, such as clients and customers]",
    "What hinders you from incorporating sustainability in your role-specific tasks? [Other]"
]

JOB_TASK_MULTI_KNOWLEDGE = [
    "Which sustainability dimension(s) do you feel you lack sufficient knowledge or tools to effectively address? [Environmental sustainability (e.g., resource efficiency of energy/water/…, carbon footprint)]",
    "Which sustainability dimension(s) do you feel you lack sufficient knowledge or tools to effectively address? [Social sustainability (e.g., role of community, shared values)]",
    "Which sustainability dimension(s) do you feel you lack sufficient knowledge or tools to effectively address? [Individual sustainability (e.g., health, competence, access to services)]",
    "Which sustainability dimension(s) do you feel you lack sufficient knowledge or tools to effectively address? [Economic sustainability (e.g., cost efficiency, economic viability)]",
    "Which sustainability dimension(s) do you feel you lack sufficient knowledge or tools to effectively address? [Technical sustainability (e.g., maintainability, scalability)]",
    "Which sustainability dimension(s) do you feel you lack sufficient knowledge or tools to effectively address? [Other]"
]

JOB_TASK_MULTI_SUPPORT = [
    "What additional support or resources would help you integrate digital sustainability into your work? [Theoretical knowledge (self-study learning material)]",
    "What additional support or resources would help you integrate digital sustainability into your work? [Tutorials (co-present or online training)]",
    "What additional support or resources would help you integrate digital sustainability into your work? [Curricula (educational programs)]",
    "What additional support or resources would help you integrate digital sustainability into your work? [Practical knowledge (how-to's)]",
    "What additional support or resources would help you integrate digital sustainability into your work? [Positive case studies (real-world examples demonstrating benefits, including financial value)]",
    "What additional support or resources would help you integrate digital sustainability into your work? [Structures (frameworks, definitions, standards)]",
    "What additional support or resources would help you integrate digital sustainability into your work? [Tools (assessment checklists, creativity methods)]",
    "What additional support or resources would help you integrate digital sustainability into your work? [I do not want to integrate more digital sustainability into my work]",
    "What additional support or resources would help you integrate digital sustainability into your work? [Other]"
]

# Define which columns are numeric for histogram usage
NUMERIC_COLS = [
    "How many years of professional experience do you have in IT/software engineering?",
    "How many times training(s) or educational program(s) on digital sustainability did you participate in?"
] 