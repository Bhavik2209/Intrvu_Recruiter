/*
  # Add sample candidates with extracted resume data

  1. Sample Data
    - Insert 5 sample candidates with realistic resume data
    - Each candidate has extracted_data with structured resume information
    - Status set to 'completed' to indicate processing is done
    - Diverse skill sets and experience levels for testing

  2. Data Structure
    - extracted_data contains: summary, experience, education, skills, contact_info
    - Realistic job titles, companies, and skill combinations
    - Varying experience levels (junior to senior)
*/

-- Insert sample candidates with extracted resume data
INSERT INTO candidates (name, email, extracted_data, status) VALUES 
(
  'Michael Chen',
  'michael.chen@email.com',
  '{
    "summary": "Senior Frontend Developer with 7+ years of experience building scalable web applications using React, TypeScript, and modern JavaScript frameworks. Led development teams and mentored junior developers at high-growth startups.",
    "experience": [
      {
        "title": "Senior Frontend Developer",
        "company": "TechCorp Inc",
        "duration": "2020-2024",
        "description": "Led frontend development for e-commerce platform serving 1M+ users. Built responsive web applications using React, Redux, TypeScript, and Next.js. Implemented automated testing with Jest and React Testing Library."
      },
      {
        "title": "Frontend Developer",
        "company": "StartupXYZ",
        "duration": "2018-2020",
        "description": "Developed user interfaces for SaaS platform using React and JavaScript. Collaborated with UX designers and backend engineers. Improved application performance by 40%."
      }
    ],
    "education": [
      {
        "degree": "Bachelor of Science in Computer Science",
        "school": "Stanford University",
        "year": "2017"
      }
    ],
    "skills": {
      "technical": ["React", "TypeScript", "JavaScript", "Redux", "Next.js", "HTML5", "CSS3", "Jest", "React Testing Library", "Git", "Webpack", "Node.js"],
      "soft": ["Team Leadership", "Mentoring", "Problem Solving", "Communication", "Project Management"]
    },
    "contact_info": {
      "phone": "+1(555)123-4567",
      "location": "San Francisco, CA",
      "linkedin": "linkedin.com/in/michael-chen-dev"
    }
  }',
  'completed'
),
(
  'Sarah Johnson',
  'sarah.johnson@email.com',
  '{
    "summary": "Full-stack developer with 6 years of experience in React, Node.js, and cloud technologies. Passionate about building user-centric applications and implementing best practices in software development.",
    "experience": [
      {
        "title": "Senior React Developer",
        "company": "FinTech Solutions",
        "duration": "2021-2024",
        "description": "Built complex financial applications using React, TypeScript, and GraphQL. Implemented real-time data visualization and trading interfaces. Worked with AWS services and microservices architecture."
      },
      {
        "title": "Full Stack Developer",
        "company": "Digital Agency",
        "duration": "2019-2021",
        "description": "Developed web applications using React frontend and Node.js backend. Integrated third-party APIs and payment systems. Optimized application performance and SEO."
      }
    ],
    "education": [
      {
        "degree": "Bachelor of Software Engineering",
        "school": "MIT",
        "year": "2018"
      }
    ],
    "skills": {
      "technical": ["React", "TypeScript", "Node.js", "GraphQL", "Next.js", "AWS", "MongoDB", "PostgreSQL", "Jest", "Docker", "Git"],
      "soft": ["Problem Solving", "Analytical Thinking", "Communication", "Teamwork", "Adaptability"]
    },
    "contact_info": {
      "phone": "+1(555)456-7890",
      "location": "Boston, MA",
      "linkedin": "linkedin.com/in/sarah-johnson-react"
    }
  }',
  'completed'
),
(
  'David Rodriguez',
  'david.rodriguez@email.com',
  '{
    "summary": "Frontend Tech Lead with 8+ years of experience leading development teams and architecting scalable web applications. Expert in React ecosystem with strong background in team management and technical strategy.",
    "experience": [
      {
        "title": "Frontend Tech Lead",
        "company": "Enterprise Corp",
        "duration": "2022-2024",
        "description": "Led team of 6 frontend developers building enterprise web applications. Architected component libraries and design systems. Implemented CI/CD pipelines and code quality standards."
      },
      {
        "title": "Senior Frontend Developer",
        "company": "Growth Startup",
        "duration": "2019-2022",
        "description": "Developed customer-facing applications using React and Redux. Mentored junior developers and established frontend best practices. Improved application performance and user experience."
      }
    ],
    "education": [
      {
        "degree": "Master of Computer Science",
        "school": "UC Berkeley",
        "year": "2016"
      }
    ],
    "skills": {
      "technical": ["React", "Redux", "TypeScript", "JavaScript", "Jest", "Webpack", "HTML5", "CSS3", "Git", "Jenkins"],
      "soft": ["Leadership", "Team Management", "Strategic Planning", "Communication", "Mentoring", "Problem Solving"]
    },
    "contact_info": {
      "phone": "+1(555)987-6543",
      "location": "San Francisco, CA",
      "linkedin": "linkedin.com/in/david-rodriguez-tech"
    }
  }',
  'completed'
),
(
  'Emily Watson',
  'emily.watson@email.com',
  '{
    "summary": "Junior Frontend Developer with 2 years of experience in React and modern web technologies. Recent computer science graduate with strong foundation in algorithms and data structures.",
    "experience": [
      {
        "title": "Junior Frontend Developer",
        "company": "WebDev Agency",
        "duration": "2022-2024",
        "description": "Developed responsive web applications using React and CSS frameworks. Collaborated with senior developers on feature implementation. Participated in code reviews and agile development processes."
      },
      {
        "title": "Frontend Intern",
        "company": "Tech Startup",
        "duration": "2021-2022",
        "description": "Built user interface components using React and JavaScript. Assisted with bug fixes and feature enhancements. Learned modern development practices and version control."
      }
    ],
    "education": [
      {
        "degree": "Bachelor of Computer Science",
        "school": "University of Washington",
        "year": "2021"
      }
    ],
    "skills": {
      "technical": ["React", "JavaScript", "HTML5", "CSS3", "Git", "Bootstrap", "Responsive Design"],
      "soft": ["Learning Agility", "Attention to Detail", "Communication", "Teamwork", "Time Management"]
    },
    "contact_info": {
      "phone": "+1(555)234-5678",
      "location": "Seattle, WA",
      "linkedin": "linkedin.com/in/emily-watson-dev"
    }
  }',
  'completed'
),
(
  'Alex Kumar',
  'alex.kumar@email.com',
  '{
    "summary": "Full-stack engineer with 5 years of experience in Python, Django, and React. Strong background in backend development with growing expertise in frontend technologies.",
    "experience": [
      {
        "title": "Full Stack Engineer",
        "company": "Data Analytics Co",
        "duration": "2020-2024",
        "description": "Built data visualization dashboards using React and D3.js. Developed REST APIs using Python and Django. Worked with PostgreSQL and Redis for data storage and caching."
      },
      {
        "title": "Backend Developer",
        "company": "SaaS Platform",
        "duration": "2018-2020",
        "description": "Developed scalable backend services using Python and Django. Implemented authentication and authorization systems. Optimized database queries and API performance."
      }
    ],
    "education": [
      {
        "degree": "Bachelor of Engineering in Computer Science",
        "school": "Georgia Tech",
        "year": "2018"
      }
    ],
    "skills": {
      "technical": ["Python", "Django", "React", "JavaScript", "PostgreSQL", "Redis", "Docker", "AWS", "Git", "REST APIs"],
      "soft": ["Problem Solving", "Analytical Thinking", "Communication", "Collaboration", "Continuous Learning"]
    },
    "contact_info": {
      "phone": "+1(555)345-6789",
      "location": "Atlanta, GA",
      "linkedin": "linkedin.com/in/alex-kumar-fullstack"
    }
  }',
  'completed'
);