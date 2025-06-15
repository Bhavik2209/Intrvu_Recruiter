import { supabase } from '../lib/supabase'

export const createSampleCandidates = async () => {
  const sampleCandidates = [
    {
      name: "Michael Chen",
      email: "michael.chen@email.com",
      resume_filename: "michael_chen_resume.pdf",
      extracted_data: {
        text: `Michael Chen
Senior Frontend Developer
Email: michael.chen@email.com
Phone: +1(555)123-4567
Location: San Francisco, CA
LinkedIn: linkedin.com/in/michael-chen-dev

SUMMARY
Experienced Senior Frontend Developer with 7+ years of expertise in React, TypeScript, and modern web technologies. Led development of high-traffic e-commerce platforms serving 1M+ users. Strong advocate for clean code, testing, and modern development practices.

EXPERIENCE
Senior Frontend Developer | Airbnb | 2020 - Present
• Led development of booking platform frontend serving 1M+ daily users
• Implemented React hooks and Redux for state management
• Built responsive components using TypeScript and Next.js
• Achieved 95% test coverage using Jest and React Testing Library
• Mentored 3 junior developers and established coding standards

Frontend Developer | Uber | 2018 - 2020
• Developed rider and driver web applications using React and Redux
• Implemented real-time features using WebSockets and GraphQL
• Optimized application performance resulting in 40% faster load times
• Collaborated with design team to implement pixel-perfect UI components

Junior Frontend Developer | Startup Inc | 2017 - 2018
• Built responsive web applications using React and JavaScript
• Integrated REST APIs and implemented client-side routing
• Participated in agile development process and code reviews

EDUCATION
Bachelor of Science in Computer Science
Stanford University | 2013 - 2017
GPA: 3.8/4.0

TECHNICAL SKILLS
• Frontend: React, TypeScript, JavaScript, HTML5, CSS3, SASS
• State Management: Redux, Context API, Zustand
• Testing: Jest, React Testing Library, Cypress, Enzyme
• Build Tools: Webpack, Vite, Babel, ESLint, Prettier
• Frameworks: Next.js, Gatsby, Create React App
• Version Control: Git, GitHub, GitLab
• APIs: REST, GraphQL, Apollo Client
• Databases: PostgreSQL, MongoDB (basic)
• Cloud: AWS S3, CloudFront, Vercel, Netlify

PROJECTS
E-commerce Platform (2021)
• Built full-featured e-commerce platform using Next.js and TypeScript
• Implemented payment processing with Stripe integration
• Achieved 99.9% uptime and handled 10k+ concurrent users

Open Source Contributions
• Contributor to React ecosystem libraries
• Maintained popular npm package with 50k+ weekly downloads
• Active in React community forums and conferences

CERTIFICATIONS
• AWS Certified Developer Associate (2022)
• React Developer Certification (2021)`,
        extracted_at: new Date().toISOString(),
        extraction_method: 'sample_data',
        status: 'extracted'
      },
      status: 'completed'
    },
    {
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com", 
      resume_filename: "sarah_johnson_resume.pdf",
      extracted_data: {
        text: `Sarah Johnson
Senior React Developer
Email: sarah.johnson@email.com
Phone: +1(555)456-7890
Location: Boston, MA
LinkedIn: linkedin.com/in/sarah-johnson-react

PROFESSIONAL SUMMARY
Senior React Developer with 6+ years of experience building complex web applications for fintech companies. Expertise in modern frontend technologies including React, TypeScript, Next.js, and GraphQL. Excellent problem-solving skills and experience with performance optimization.

WORK EXPERIENCE
Senior React Developer | Fidelity Investments | 2021 - Present
• Developed trading platform frontend handling $2B+ daily transactions
• Built real-time dashboard using React, TypeScript, and GraphQL
• Implemented micro-frontend architecture using Next.js
• Optimized application performance resulting in 50% faster rendering
• Led code reviews and established frontend architecture standards

React Developer | Charles Schwab | 2019 - 2021
• Built client portfolio management interface using React and Redux
• Integrated with financial APIs and real-time market data feeds
• Implemented responsive design supporting mobile and desktop
• Achieved 98% test coverage using Jest and React Testing Library
• Collaborated with UX team to improve user experience metrics

Frontend Developer | Bank of America | 2018 - 2019
• Developed online banking features using React and JavaScript
• Implemented secure authentication and authorization flows
• Built accessible components following WCAG 2.1 guidelines
• Participated in agile development and sprint planning

EDUCATION
Bachelor of Science in Software Engineering
Massachusetts Institute of Technology (MIT) | 2014 - 2018
Magna Cum Laude, GPA: 3.9/4.0

TECHNICAL EXPERTISE
• Languages: TypeScript, JavaScript, HTML5, CSS3
• Frontend Frameworks: React, Next.js, Gatsby
• State Management: Redux Toolkit, Zustand, React Query
• Testing: Jest, React Testing Library, Cypress, Playwright
• GraphQL: Apollo Client, Relay, GraphQL Code Generator
• Styling: Styled Components, Emotion, Tailwind CSS, SASS
• Build Tools: Webpack, Vite, Rollup, Babel
• Version Control: Git, GitHub Actions, GitLab CI
• Performance: Web Vitals, Lighthouse, Bundle Analysis
• Accessibility: WCAG 2.1, ARIA, Screen Reader Testing

NOTABLE PROJECTS
Trading Platform Redesign (2022-2023)
• Led frontend redesign of trading platform serving 500k+ users
• Implemented real-time price updates using WebSockets
• Reduced page load time by 60% through code splitting and lazy loading
• Achieved 100% accessibility compliance

Investment Portfolio Dashboard (2021)
• Built interactive dashboard for portfolio management
• Integrated with multiple financial data providers
• Implemented advanced charting using D3.js and React
• Delivered project 2 weeks ahead of schedule

COMMUNITY INVOLVEMENT
• Active contributor to React community on GitHub
• Speaker at React Boston meetup (2022, 2023)
• Mentor for Women in Tech bootcamp program
• Technical blog writer with 10k+ monthly readers

CERTIFICATIONS
• Certified React Developer (2022)
• GraphQL Certified Developer (2021)
• AWS Certified Solutions Architect Associate (2023)`,
        extracted_at: new Date().toISOString(),
        extraction_method: 'sample_data',
        status: 'extracted'
      },
      status: 'completed'
    },
    {
      name: "David Rodriguez",
      email: "david.rodriguez@email.com",
      resume_filename: "david_rodriguez_resume.pdf", 
      extracted_data: {
        text: `David Rodriguez
Frontend Tech Lead
Email: david.rodriguez@email.com
Phone: +1(555)987-6543
Location: San Francisco, CA
LinkedIn: linkedin.com/in/david-rodriguez-tech

EXECUTIVE SUMMARY
Frontend Tech Lead with 8+ years of experience building scalable web applications and leading development teams. Currently leading a team of 6 developers at a high-growth startup. Strong background in React ecosystem and modern development practices. Proven track record of delivering high-impact projects on time and within budget.

PROFESSIONAL EXPERIENCE
Frontend Tech Lead | Stripe | 2022 - Present
• Lead team of 6 frontend developers building payment processing interfaces
• Architected micro-frontend system handling 100M+ transactions monthly
• Implemented React, TypeScript, and Redux for complex state management
• Established engineering best practices and code review processes
• Reduced deployment time by 70% through CI/CD pipeline improvements
• Mentored junior developers and conducted technical interviews

Senior Frontend Developer | Shopify | 2020 - 2022
• Developed merchant dashboard serving 1M+ online stores
• Built responsive components using React and modern CSS techniques
• Integrated with GraphQL APIs and implemented real-time features
• Led migration from JavaScript to TypeScript across 50+ components
• Improved application performance by 45% through optimization techniques

Frontend Developer | Square | 2018 - 2020
• Built point-of-sale web application using React and Redux
• Implemented offline-first architecture for reliable operation
• Developed reusable component library used across multiple products
• Collaborated with product and design teams on user experience improvements
• Participated in on-call rotation and incident response

Software Developer | Tech Startup | 2016 - 2018
• Developed full-stack web applications using React and Node.js
• Built RESTful APIs and integrated with third-party services
• Implemented responsive design and cross-browser compatibility
• Participated in agile development process and sprint planning

EDUCATION
Master of Science in Computer Science
University of California, Berkeley | 2014 - 2016
Specialization: Human-Computer Interaction

Bachelor of Science in Computer Engineering  
UC San Diego | 2010 - 2014
Cum Laude, GPA: 3.7/4.0

TECHNICAL SKILLS
• Programming Languages: TypeScript, JavaScript, Python, Java
• Frontend Technologies: React, Redux, HTML5, CSS3, SASS
• Frameworks & Libraries: Next.js, Express.js, Node.js
• Testing: Jest, React Testing Library, Cypress, Selenium
• Build Tools: Webpack, Vite, Babel, ESLint, Prettier
• Version Control: Git, GitHub, GitLab, Bitbucket
• Databases: PostgreSQL, MongoDB, Redis
• Cloud Platforms: AWS, Google Cloud, Vercel, Netlify
• DevOps: Docker, Kubernetes, Jenkins, GitHub Actions
• Design Tools: Figma, Sketch, Adobe Creative Suite

LEADERSHIP & ACHIEVEMENTS
Team Leadership
• Successfully led cross-functional teams of 6-10 members
• Established engineering culture focused on quality and collaboration
• Implemented agile methodologies resulting in 30% faster delivery
• Conducted 100+ technical interviews and hired 15+ engineers

Technical Achievements
• Architected frontend systems serving 100M+ users monthly
• Reduced application bundle size by 50% through code splitting
• Improved Core Web Vitals scores by 40% across all products
• Led successful migration of legacy codebase to modern stack

PROJECTS & CONTRIBUTIONS
Payment Processing Platform (2023)
• Led development of next-generation payment interface
• Implemented advanced fraud detection UI components
• Achieved 99.99% uptime and sub-100ms response times
• Managed team of 6 developers across 3 time zones

Open Source Contributions
• Maintainer of popular React component library (5k+ stars)
• Regular contributor to React, Redux, and TypeScript projects
• Published 10+ npm packages with 100k+ total downloads

SPEAKING & COMMUNITY
• Keynote speaker at React Conf 2023
• Regular speaker at Bay Area React meetups
• Technical mentor for coding bootcamp graduates
• Guest lecturer at UC Berkeley Computer Science program

CERTIFICATIONS
• AWS Certified Solutions Architect Professional (2023)
• Certified Kubernetes Administrator (2022)
• React Advanced Certification (2021)`,
        extracted_at: new Date().toISOString(),
        extraction_method: 'sample_data',
        status: 'extracted'
      },
      status: 'completed'
    },
    {
      name: "Emily Zhang",
      email: "emily.zhang@email.com",
      resume_filename: "emily_zhang_resume.pdf",
      extracted_data: {
        text: `Emily Zhang
Full Stack Developer
Email: emily.zhang@email.com
Phone: +1(555)234-5678
Location: Seattle, WA
LinkedIn: linkedin.com/in/emily-zhang-dev

PROFESSIONAL SUMMARY
Full Stack Developer with 5+ years of experience building web applications using React, Node.js, and cloud technologies. Strong background in both frontend and backend development with expertise in modern JavaScript frameworks and database design.

WORK EXPERIENCE
Full Stack Developer | Microsoft | 2021 - Present
• Developed Azure portal features using React and TypeScript
• Built backend APIs using Node.js and Express.js
• Implemented authentication and authorization using Azure AD
• Worked with PostgreSQL and MongoDB databases
• Participated in code reviews and agile development process

Frontend Developer | Amazon | 2019 - 2021
• Built e-commerce features for Amazon marketplace
• Developed responsive components using React and CSS
• Integrated with AWS services and REST APIs
• Implemented A/B testing and analytics tracking
• Collaborated with UX designers on user interface improvements

Junior Developer | Local Agency | 2018 - 2019
• Developed client websites using React and WordPress
• Built custom themes and plugins for content management
• Implemented responsive design and mobile optimization
• Provided technical support and maintenance for existing projects

EDUCATION
Bachelor of Science in Computer Science
University of Washington | 2014 - 2018
GPA: 3.6/4.0

TECHNICAL SKILLS
• Frontend: React, JavaScript, TypeScript, HTML, CSS
• Backend: Node.js, Express.js, Python, Java
• Databases: PostgreSQL, MongoDB, MySQL
• Cloud: AWS, Azure, Google Cloud Platform
• Tools: Git, Docker, Jenkins, VS Code
• Testing: Jest, Mocha, Cypress

PROJECTS
E-learning Platform (2022)
• Built online learning platform using React and Node.js
• Implemented video streaming and progress tracking
• Integrated payment processing with Stripe
• Deployed on AWS with auto-scaling capabilities

Task Management App (2021)
• Developed project management tool using MERN stack
• Implemented real-time collaboration features
• Built responsive design for mobile and desktop
• Used Redux for state management

CERTIFICATIONS
• AWS Certified Developer Associate (2022)
• Microsoft Azure Fundamentals (2021)`,
        extracted_at: new Date().toISOString(),
        extraction_method: 'sample_data',
        status: 'extracted'
      },
      status: 'completed'
    },
    {
      name: "Alex Thompson",
      email: "alex.thompson@email.com",
      resume_filename: "alex_thompson_resume.pdf",
      extracted_data: {
        text: `Alex Thompson
Backend Developer
Email: alex.thompson@email.com
Phone: +1(555)345-6789
Location: Austin, TX
LinkedIn: linkedin.com/in/alex-thompson-backend

PROFESSIONAL SUMMARY
Backend Developer with 4+ years of experience building scalable server-side applications. Expertise in Node.js, Python, and database design. Strong understanding of API development and microservices architecture.

WORK EXPERIENCE
Backend Developer | Dell Technologies | 2020 - Present
• Developed REST APIs using Node.js and Express.js
• Designed and implemented database schemas using PostgreSQL
• Built microservices architecture for enterprise applications
• Implemented caching strategies using Redis
• Worked with Docker and Kubernetes for containerization

Software Engineer | IBM | 2019 - 2020
• Developed enterprise software using Java and Spring Boot
• Built data processing pipelines using Apache Kafka
• Implemented security features and authentication systems
• Participated in code reviews and technical documentation
• Collaborated with frontend teams on API integration

Junior Developer | Startup Company | 2018 - 2019
• Built web applications using Python and Django
• Developed database models and API endpoints
• Implemented user authentication and authorization
• Worked with MySQL and PostgreSQL databases
• Participated in agile development process

EDUCATION
Bachelor of Science in Software Engineering
University of Texas at Austin | 2014 - 2018
GPA: 3.5/4.0

TECHNICAL SKILLS
• Languages: JavaScript, Python, Java, SQL
• Backend: Node.js, Express.js, Django, Spring Boot
• Databases: PostgreSQL, MySQL, MongoDB, Redis
• Cloud: AWS, Google Cloud Platform
• Tools: Docker, Kubernetes, Git, Jenkins
• APIs: REST, GraphQL, gRPC

PROJECTS
Inventory Management System (2022)
• Built REST API using Node.js and PostgreSQL
• Implemented real-time inventory tracking
• Used Redis for caching and session management
• Deployed on AWS with load balancing

Data Analytics Platform (2021)
• Developed data processing pipeline using Python
• Built APIs for data visualization dashboard
• Implemented ETL processes for large datasets
• Used Apache Kafka for real-time data streaming

CERTIFICATIONS
• AWS Certified Solutions Architect Associate (2022)
• Oracle Database Certified Professional (2021)`,
        extracted_at: new Date().toISOString(),
        extraction_method: 'sample_data',
        status: 'extracted'
      },
      status: 'completed'
    }
  ]

  try {
    const { data, error } = await supabase
      .from('candidates')
      .insert(sampleCandidates)
      .select()

    if (error) {
      console.error('Error creating sample candidates:', error)
      return { success: false, error }
    }

    console.log('Sample candidates created successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error creating sample candidates:', error)
    return { success: false, error }
  }
}

export const clearAllCandidates = async () => {
  try {
    const { error } = await supabase
      .from('candidates')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records

    if (error) {
      console.error('Error clearing candidates:', error)
      return { success: false, error }
    }

    console.log('All candidates cleared successfully')
    return { success: true }
  } catch (error) {
    console.error('Error clearing candidates:', error)
    return { success: false, error }
  }
}