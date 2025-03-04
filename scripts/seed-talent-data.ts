import { db } from '../lib/db/drizzle';
import { users, talentProfiles } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Mock data for talents
const mockTalents = [
  {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    password: 'password123',
    profile: {
      fullName: 'Alex Johnson',
      phoneNumber: '(555) 123-4567',
      location: 'San Francisco, CA',
      currentTitle: 'Senior Frontend Developer',
      currentCompany: 'TechCorp Inc.',
      yearsOfExperience: 7,
      skills: 'JavaScript, React, TypeScript, CSS, HTML, Redux, GraphQL',
      primarySkills: 'React, TypeScript, GraphQL',
      experience: JSON.stringify([
        {
          title: 'Senior Frontend Developer',
          company: 'TechCorp Inc.',
          location: 'San Francisco, CA',
          startDate: '2020-03',
          endDate: null,
          description: 'Lead frontend development for enterprise SaaS platform.'
        },
        {
          title: 'Frontend Developer',
          company: 'WebSolutions',
          location: 'San Francisco, CA',
          startDate: '2017-06',
          endDate: '2020-02',
          description: 'Developed responsive web applications using React.'
        }
      ]),
      education: JSON.stringify([
        {
          degree: 'B.S. Computer Science',
          institution: 'Stanford University',
          location: 'Stanford, CA',
          graduationYear: 2017
        }
      ]),
      desiredRole: 'Lead Frontend Engineer',
      desiredSalary: '$140,000 - $160,000',
      desiredLocation: 'San Francisco Bay Area',
      remotePreference: 'Hybrid',
      currentlyEmployed: true,
      openToOpportunities: true,
      recruiterNotes: 'Strong candidate with excellent React skills',
      talentRating: 5
    }
  },
  {
    name: 'Samantha Lee',
    email: 'samantha.lee@example.com',
    password: 'password123',
    profile: {
      fullName: 'Samantha Lee',
      phoneNumber: '(555) 234-5678',
      location: 'New York, NY',
      currentTitle: 'Full Stack Developer',
      currentCompany: 'FinTech Solutions',
      yearsOfExperience: 5,
      skills: 'Python, Django, JavaScript, React, PostgreSQL, Docker',
      primarySkills: 'Python, Django, React',
      experience: JSON.stringify([
        {
          title: 'Full Stack Developer',
          company: 'FinTech Solutions',
          location: 'New York, NY',
          startDate: '2021-01',
          endDate: null,
          description: 'Developing financial applications using Python and React.'
        },
        {
          title: 'Backend Developer',
          company: 'DataSystems Inc.',
          location: 'Boston, MA',
          startDate: '2018-05',
          endDate: '2020-12',
          description: 'Built RESTful APIs and microservices using Python and Django.'
        }
      ]),
      education: JSON.stringify([
        {
          degree: 'M.S. Computer Science',
          institution: 'NYU',
          location: 'New York, NY',
          graduationYear: 2018
        },
        {
          degree: 'B.S. Information Technology',
          institution: 'Boston University',
          location: 'Boston, MA',
          graduationYear: 2016
        }
      ]),
      desiredRole: 'Senior Full Stack Developer',
      desiredSalary: '$130,000 - $150,000',
      desiredLocation: 'New York City',
      remotePreference: 'Remote',
      currentlyEmployed: true,
      openToOpportunities: true,
      recruiterNotes: 'Great communication skills, strong technical background',
      talentRating: 4
    }
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    password: 'password123',
    profile: {
      fullName: 'Michael Chen',
      phoneNumber: '(555) 345-6789',
      location: 'Seattle, WA',
      currentTitle: 'DevOps Engineer',
      currentCompany: 'CloudTech Systems',
      yearsOfExperience: 6,
      skills: 'AWS, Kubernetes, Docker, Terraform, CI/CD, Python, Bash',
      primarySkills: 'AWS, Kubernetes, Terraform',
      experience: JSON.stringify([
        {
          title: 'DevOps Engineer',
          company: 'CloudTech Systems',
          location: 'Seattle, WA',
          startDate: '2019-08',
          endDate: null,
          description: 'Managing cloud infrastructure and CI/CD pipelines.'
        },
        {
          title: 'Systems Administrator',
          company: 'TechOps Inc.',
          location: 'Portland, OR',
          startDate: '2017-03',
          endDate: '2019-07',
          description: 'Managed on-premise and cloud infrastructure.'
        }
      ]),
      education: JSON.stringify([
        {
          degree: 'B.S. Computer Engineering',
          institution: 'University of Washington',
          location: 'Seattle, WA',
          graduationYear: 2017
        }
      ]),
      desiredRole: 'Senior DevOps Engineer',
      desiredSalary: '$140,000 - $160,000',
      desiredLocation: 'Seattle, WA',
      remotePreference: 'Remote',
      currentlyEmployed: true,
      openToOpportunities: false,
      recruiterNotes: 'Excellent AWS knowledge, not actively looking but open to right opportunity',
      talentRating: 4
    }
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    password: 'password123',
    profile: {
      fullName: 'Emily Rodriguez',
      phoneNumber: '(555) 456-7890',
      location: 'Austin, TX',
      currentTitle: 'Data Scientist',
      currentCompany: 'Analytics Pro',
      yearsOfExperience: 4,
      skills: 'Python, R, SQL, Machine Learning, TensorFlow, Data Visualization, Pandas',
      primarySkills: 'Python, Machine Learning, SQL',
      experience: JSON.stringify([
        {
          title: 'Data Scientist',
          company: 'Analytics Pro',
          location: 'Austin, TX',
          startDate: '2020-06',
          endDate: null,
          description: 'Developing machine learning models for customer segmentation and prediction.'
        },
        {
          title: 'Data Analyst',
          company: 'DataInsight',
          location: 'Dallas, TX',
          startDate: '2018-09',
          endDate: '2020-05',
          description: 'Analyzed customer data to provide business insights.'
        }
      ]),
      education: JSON.stringify([
        {
          degree: 'M.S. Data Science',
          institution: 'University of Texas',
          location: 'Austin, TX',
          graduationYear: 2018
        },
        {
          degree: 'B.S. Statistics',
          institution: 'Texas A&M',
          location: 'College Station, TX',
          graduationYear: 2016
        }
      ]),
      desiredRole: 'Senior Data Scientist',
      desiredSalary: '$130,000 - $150,000',
      desiredLocation: 'Austin, TX',
      remotePreference: 'Hybrid',
      currentlyEmployed: true,
      openToOpportunities: true,
      recruiterNotes: 'Strong analytical skills, looking for more challenging role',
      talentRating: 5
    }
  },
  {
    name: 'David Kim',
    email: 'david.kim@example.com',
    password: 'password123',
    profile: {
      fullName: 'David Kim',
      phoneNumber: '(555) 567-8901',
      location: 'Chicago, IL',
      currentTitle: 'Mobile Developer',
      currentCompany: 'AppWorks',
      yearsOfExperience: 5,
      skills: 'Swift, iOS, Objective-C, React Native, Firebase, UI/UX Design',
      primarySkills: 'Swift, iOS, React Native',
      experience: JSON.stringify([
        {
          title: 'Mobile Developer',
          company: 'AppWorks',
          location: 'Chicago, IL',
          startDate: '2019-11',
          endDate: null,
          description: 'Developing iOS applications for enterprise clients.'
        },
        {
          title: 'iOS Developer',
          company: 'MobileTech',
          location: 'Chicago, IL',
          startDate: '2017-07',
          endDate: '2019-10',
          description: 'Built consumer-facing iOS applications.'
        }
      ]),
      education: JSON.stringify([
        {
          degree: 'B.S. Computer Science',
          institution: 'University of Illinois',
          location: 'Urbana-Champaign, IL',
          graduationYear: 2017
        }
      ]),
      desiredRole: 'Lead Mobile Developer',
      desiredSalary: '$130,000 - $150,000',
      desiredLocation: 'Chicago, IL',
      remotePreference: 'On-site',
      currentlyEmployed: true,
      openToOpportunities: true,
      recruiterNotes: 'Excellent iOS skills, prefers on-site work',
      talentRating: 4
    }
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    password: 'password123',
    profile: {
      fullName: 'Sarah Wilson',
      phoneNumber: '(555) 678-9012',
      location: 'Denver, CO',
      currentTitle: 'UX/UI Designer',
      currentCompany: 'DesignHub',
      yearsOfExperience: 6,
      skills: 'Figma, Sketch, Adobe XD, User Research, Wireframing, Prototyping, HTML/CSS',
      primarySkills: 'Figma, User Research, Prototyping',
      experience: JSON.stringify([
        {
          title: 'UX/UI Designer',
          company: 'DesignHub',
          location: 'Denver, CO',
          startDate: '2020-02',
          endDate: null,
          description: 'Creating user-centered designs for web and mobile applications.'
        },
        {
          title: 'UI Designer',
          company: 'Creative Solutions',
          location: 'Boulder, CO',
          startDate: '2017-05',
          endDate: '2020-01',
          description: 'Designed interfaces for client websites and applications.'
        }
      ]),
      education: JSON.stringify([
        {
          degree: 'B.F.A. Graphic Design',
          institution: 'Colorado State University',
          location: 'Fort Collins, CO',
          graduationYear: 2017
        }
      ]),
      desiredRole: 'Senior UX Designer',
      desiredSalary: '$120,000 - $140,000',
      desiredLocation: 'Denver, CO',
      remotePreference: 'Remote',
      currentlyEmployed: true,
      openToOpportunities: true,
      recruiterNotes: 'Great portfolio, strong design thinking process',
      talentRating: 5
    }
  },
  {
    name: 'James Taylor',
    email: 'james.taylor@example.com',
    password: 'password123',
    profile: {
      fullName: 'James Taylor',
      phoneNumber: '(555) 789-0123',
      location: 'Atlanta, GA',
      currentTitle: 'Backend Developer',
      currentCompany: 'ServerTech',
      yearsOfExperience: 3,
      skills: 'Java, Spring Boot, Hibernate, MySQL, MongoDB, RESTful APIs',
      primarySkills: 'Java, Spring Boot, MongoDB',
      experience: JSON.stringify([
        {
          title: 'Backend Developer',
          company: 'ServerTech',
          location: 'Atlanta, GA',
          startDate: '2021-03',
          endDate: null,
          description: 'Developing backend services for enterprise applications.'
        },
        {
          title: 'Junior Java Developer',
          company: 'CodeCraft',
          location: 'Atlanta, GA',
          startDate: '2019-06',
          endDate: '2021-02',
          description: 'Developed and maintained Java applications.'
        }
      ]),
      education: JSON.stringify([
        {
          degree: 'B.S. Computer Science',
          institution: 'Georgia Tech',
          location: 'Atlanta, GA',
          graduationYear: 2019
        }
      ]),
      desiredRole: 'Senior Backend Developer',
      desiredSalary: '$110,000 - $130,000',
      desiredLocation: 'Atlanta, GA',
      remotePreference: 'Hybrid',
      currentlyEmployed: true,
      openToOpportunities: true,
      recruiterNotes: 'Solid Java skills, looking to grow in backend development',
      talentRating: 3
    }
  },
  {
    name: 'Olivia Martinez',
    email: 'olivia.martinez@example.com',
    password: 'password123',
    profile: {
      fullName: 'Olivia Martinez',
      phoneNumber: '(555) 890-1234',
      location: 'Los Angeles, CA',
      currentTitle: 'Product Manager',
      currentCompany: 'ProductLabs',
      yearsOfExperience: 7,
      skills: 'Product Strategy, Agile, Scrum, User Stories, Roadmapping, Market Research, A/B Testing',
      primarySkills: 'Product Strategy, Agile, Roadmapping',
      experience: JSON.stringify([
        {
          title: 'Product Manager',
          company: 'ProductLabs',
          location: 'Los Angeles, CA',
          startDate: '2019-09',
          endDate: null,
          description: 'Leading product development for SaaS platform.'
        },
        {
          title: 'Associate Product Manager',
          company: 'TechInnovate',
          location: 'San Diego, CA',
          startDate: '2016-07',
          endDate: '2019-08',
          description: 'Managed feature development and product roadmap.'
        }
      ]),
      education: JSON.stringify([
        {
          degree: 'MBA',
          institution: 'UCLA',
          location: 'Los Angeles, CA',
          graduationYear: 2016
        },
        {
          degree: 'B.S. Business Administration',
          institution: 'UC San Diego',
          location: 'San Diego, CA',
          graduationYear: 2014
        }
      ]),
      desiredRole: 'Senior Product Manager',
      desiredSalary: '$150,000 - $170,000',
      desiredLocation: 'Los Angeles, CA',
      remotePreference: 'Hybrid',
      currentlyEmployed: true,
      openToOpportunities: true,
      recruiterNotes: 'Strong product sense, excellent communication skills',
      talentRating: 5
    }
  },
  {
    name: 'Ryan Patel',
    email: 'ryan.patel@example.com',
    password: 'password123',
    profile: {
      fullName: 'Ryan Patel',
      phoneNumber: '(555) 901-2345',
      location: 'Boston, MA',
      currentTitle: 'Data Engineer',
      currentCompany: 'DataFlow',
      yearsOfExperience: 4,
      skills: 'Python, Spark, Hadoop, ETL, SQL, AWS, Airflow, Kafka',
      primarySkills: 'Python, Spark, ETL',
      experience: JSON.stringify([
        {
          title: 'Data Engineer',
          company: 'DataFlow',
          location: 'Boston, MA',
          startDate: '2020-08',
          endDate: null,
          description: 'Building data pipelines and ETL processes.'
        },
        {
          title: 'Software Engineer',
          company: 'TechSolutions',
          location: 'Boston, MA',
          startDate: '2018-05',
          endDate: '2020-07',
          description: 'Developed backend services for data processing.'
        }
      ]),
      education: JSON.stringify([
        {
          degree: 'M.S. Data Engineering',
          institution: 'MIT',
          location: 'Cambridge, MA',
          graduationYear: 2018
        },
        {
          degree: 'B.S. Computer Science',
          institution: 'Boston University',
          location: 'Boston, MA',
          graduationYear: 2016
        }
      ]),
      desiredRole: 'Senior Data Engineer',
      desiredSalary: '$130,000 - $150,000',
      desiredLocation: 'Boston, MA',
      remotePreference: 'Remote',
      currentlyEmployed: true,
      openToOpportunities: true,
      recruiterNotes: 'Strong technical skills, particularly in data pipeline development',
      talentRating: 4
    }
  },
  {
    name: 'Emma Thompson',
    email: 'emma.thompson@example.com',
    password: 'password123',
    profile: {
      fullName: 'Emma Thompson',
      phoneNumber: '(555) 012-3456',
      location: 'Portland, OR',
      currentTitle: 'QA Engineer',
      currentCompany: 'QualityTech',
      yearsOfExperience: 5,
      skills: 'Manual Testing, Automated Testing, Selenium, Cypress, Jest, Test Planning, JIRA',
      primarySkills: 'Automated Testing, Selenium, Cypress',
      experience: JSON.stringify([
        {
          title: 'QA Engineer',
          company: 'QualityTech',
          location: 'Portland, OR',
          startDate: '2019-04',
          endDate: null,
          description: 'Leading QA efforts for web applications.'
        },
        {
          title: 'QA Analyst',
          company: 'SoftTest',
          location: 'Seattle, WA',
          startDate: '2017-02',
          endDate: '2019-03',
          description: 'Performed manual and automated testing for client applications.'
        }
      ]),
      education: JSON.stringify([
        {
          degree: 'B.S. Information Technology',
          institution: 'Oregon State University',
          location: 'Corvallis, OR',
          graduationYear: 2017
        }
      ]),
      desiredRole: 'Senior QA Engineer',
      desiredSalary: '$110,000 - $130,000',
      desiredLocation: 'Portland, OR',
      remotePreference: 'Remote',
      currentlyEmployed: true,
      openToOpportunities: true,
      recruiterNotes: 'Strong in test automation, looking for remote opportunities',
      talentRating: 4
    }
  }
];

async function seedTalentData() {
  console.log('Starting to seed talent data...');

  try {
    // First, check if we already have talent users
    const existingTalents = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.userType, 'talent'));
    
    const existingEmails = new Set(existingTalents.map(user => user.email));
    
    console.log(`Found ${existingEmails.size} existing talent users`);
    
    // Create new talents that don't already exist
    for (const talent of mockTalents) {
      if (existingEmails.has(talent.email)) {
        console.log(`Skipping ${talent.email} - already exists`);
        continue;
      }
      
      // Hash the password
      const passwordHash = await bcrypt.hash(talent.password, 10);
      
      // Insert the user
      const [newUser] = await db
        .insert(users)
        .values({
          name: talent.name,
          email: talent.email,
          passwordHash,
          userType: 'talent',
          role: 'member',
        })
        .returning({ id: users.id });
      
      console.log(`Created talent user: ${talent.name} (ID: ${newUser.id})`);
      
      // Insert the talent profile
      await db
        .insert(talentProfiles)
        .values({
          userId: newUser.id,
          ...talent.profile,
        });
      
      console.log(`Created talent profile for: ${talent.name}`);
    }
    
    console.log('Talent data seeding completed successfully');
  } catch (error) {
    console.error('Error seeding talent data:', error);
    throw error;
  }
}

// Run the seeding function if this file is executed directly
if (require.main === module) {
  seedTalentData()
    .then(() => {
      console.log('Talent data seeding completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Talent data seeding failed:', error);
      process.exit(1);
    });
} 