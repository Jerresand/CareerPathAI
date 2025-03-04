import { db } from './drizzle';
import { users, talentProfiles } from './schema';
import bcrypt from 'bcryptjs';
import { ensureTalentProfileExists, updateTalentProfile } from './queries';

// Mock data for talents
const mockTalents = [
  {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    password: 'password123',
    profile: {
      phoneNumber: '555-123-4567',
      location: 'San Francisco, CA',
      currentTitle: 'Senior Software Engineer',
      currentCompany: 'TechCorp Inc.',
      yearsOfExperience: 8,
      skills: 'JavaScript, React, Node.js, TypeScript, GraphQL, AWS',
      primarySkills: 'React, TypeScript, AWS',
      experience: JSON.stringify([
        {
          title: 'Senior Software Engineer',
          company: 'TechCorp Inc.',
          location: 'San Francisco, CA',
          startDate: '2020-03',
          endDate: null,
          description: 'Leading frontend development for enterprise SaaS products.'
        },
        {
          title: 'Software Engineer',
          company: 'WebSolutions',
          location: 'San Francisco, CA',
          startDate: '2016-05',
          endDate: '2020-02',
          description: 'Developed responsive web applications using React and Node.js.'
        }
      ]),
      education: JSON.stringify([
        {
          degree: 'M.S. Computer Science',
          institution: 'Stanford University',
          location: 'Stanford, CA',
          graduationYear: 2016
        },
        {
          degree: 'B.S. Computer Science',
          institution: 'UC Berkeley',
          location: 'Berkeley, CA',
          graduationYear: 2014
        }
      ]),
      desiredRole: 'Lead Frontend Engineer',
      desiredSalary: '$150,000 - $180,000',
      desiredLocation: 'San Francisco Bay Area',
      remotePreference: 'Hybrid',
      openToOpportunities: true,
      currentlyEmployed: true
    }
  },
  {
    name: 'Samantha Lee',
    email: 'samantha.lee@example.com',
    password: 'password123',
    profile: {
      phoneNumber: '555-987-6543',
      location: 'New York, NY',
      currentTitle: 'Product Manager',
      currentCompany: 'FinTech Solutions',
      yearsOfExperience: 5,
      skills: 'Product Strategy, User Research, Agile, Scrum, Data Analysis, Wireframing',
      primarySkills: 'Product Strategy, Agile, Data Analysis',
      experience: JSON.stringify([
        {
          title: 'Product Manager',
          company: 'FinTech Solutions',
          location: 'New York, NY',
          startDate: '2021-01',
          endDate: null,
          description: 'Managing financial products with $10M annual revenue.'
        },
        {
          title: 'Associate Product Manager',
          company: 'Tech Innovations',
          location: 'Boston, MA',
          startDate: '2018-06',
          endDate: '2020-12',
          description: 'Developed product roadmaps and conducted user research.'
        }
      ]),
      education: JSON.stringify([
        {
          degree: 'MBA',
          institution: 'Harvard Business School',
          location: 'Cambridge, MA',
          graduationYear: 2018
        },
        {
          degree: 'B.A. Economics',
          institution: 'Columbia University',
          location: 'New York, NY',
          graduationYear: 2016
        }
      ]),
      desiredRole: 'Senior Product Manager',
      desiredSalary: '$140,000 - $160,000',
      desiredLocation: 'New York, NY',
      remotePreference: 'In-office',
      openToOpportunities: true,
      currentlyEmployed: true
    }
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    password: 'password123',
    profile: {
      phoneNumber: '555-456-7890',
      location: 'Seattle, WA',
      currentTitle: 'Data Scientist',
      currentCompany: 'DataInsights',
      yearsOfExperience: 4,
      skills: 'Python, R, SQL, Machine Learning, TensorFlow, Data Visualization, Statistics',
      primarySkills: 'Python, Machine Learning, Data Visualization',
      experience: JSON.stringify([
        {
          title: 'Data Scientist',
          company: 'DataInsights',
          location: 'Seattle, WA',
          startDate: '2020-08',
          endDate: null,
          description: 'Building predictive models for retail customer behavior.'
        },
        {
          title: 'Data Analyst',
          company: 'E-commerce Solutions',
          location: 'Portland, OR',
          startDate: '2018-03',
          endDate: '2020-07',
          description: 'Analyzed customer data to improve conversion rates.'
        }
      ]),
      education: JSON.stringify([
        {
          degree: 'M.S. Data Science',
          institution: 'University of Washington',
          location: 'Seattle, WA',
          graduationYear: 2018
        },
        {
          degree: 'B.S. Statistics',
          institution: 'UCLA',
          location: 'Los Angeles, CA',
          graduationYear: 2016
        }
      ]),
      desiredRole: 'Senior Data Scientist',
      desiredSalary: '$130,000 - $150,000',
      desiredLocation: 'Seattle, WA',
      remotePreference: 'Remote',
      openToOpportunities: false,
      currentlyEmployed: true
    }
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    password: 'password123',
    profile: {
      phoneNumber: '555-789-0123',
      location: 'Austin, TX',
      currentTitle: 'UX/UI Designer',
      currentCompany: 'Creative Designs',
      yearsOfExperience: 6,
      skills: 'UI Design, UX Research, Figma, Sketch, Adobe XD, Prototyping, User Testing',
      primarySkills: 'UI Design, Figma, User Testing',
      experience: JSON.stringify([
        {
          title: 'UX/UI Designer',
          company: 'Creative Designs',
          location: 'Austin, TX',
          startDate: '2019-04',
          endDate: null,
          description: 'Designing user interfaces for mobile and web applications.'
        },
        {
          title: 'UI Designer',
          company: 'Digital Agency',
          location: 'Dallas, TX',
          startDate: '2017-02',
          endDate: '2019-03',
          description: 'Created visual designs for client websites and applications.'
        }
      ]),
      education: JSON.stringify([
        {
          degree: 'B.F.A. Graphic Design',
          institution: 'Rhode Island School of Design',
          location: 'Providence, RI',
          graduationYear: 2017
        }
      ]),
      desiredRole: 'Senior UX Designer',
      desiredSalary: '$120,000 - $140,000',
      desiredLocation: 'Austin, TX',
      remotePreference: 'Hybrid',
      openToOpportunities: true,
      currentlyEmployed: true
    }
  },
  {
    name: 'David Kim',
    email: 'david.kim@example.com',
    password: 'password123',
    profile: {
      phoneNumber: '555-234-5678',
      location: 'Chicago, IL',
      currentTitle: 'DevOps Engineer',
      currentCompany: 'CloudTech',
      yearsOfExperience: 7,
      skills: 'AWS, Docker, Kubernetes, CI/CD, Terraform, Jenkins, Linux, Python',
      primarySkills: 'Kubernetes, Terraform, AWS',
      experience: JSON.stringify([
        {
          title: 'DevOps Engineer',
          company: 'CloudTech',
          location: 'Chicago, IL',
          startDate: '2019-10',
          endDate: null,
          description: 'Managing cloud infrastructure and CI/CD pipelines.'
        },
        {
          title: 'Systems Administrator',
          company: 'IT Solutions',
          location: 'Chicago, IL',
          startDate: '2016-08',
          endDate: '2019-09',
          description: 'Maintained server infrastructure and automated deployments.'
        }
      ]),
      education: JSON.stringify([
        {
          degree: 'B.S. Computer Engineering',
          institution: 'University of Illinois',
          location: 'Urbana-Champaign, IL',
          graduationYear: 2016
        }
      ]),
      desiredRole: 'Senior DevOps Engineer',
      desiredSalary: '$140,000 - $160,000',
      desiredLocation: 'Chicago, IL',
      remotePreference: 'Remote',
      openToOpportunities: true,
      currentlyEmployed: true
    }
  },
  {
    name: 'Olivia Martinez',
    email: 'olivia.martinez@example.com',
    password: 'password123',
    profile: {
      phoneNumber: '555-345-6789',
      location: 'Los Angeles, CA',
      currentTitle: 'Marketing Manager',
      currentCompany: 'Brand Innovators',
      yearsOfExperience: 5,
      skills: 'Digital Marketing, SEO, Content Strategy, Social Media, Analytics, Campaign Management',
      primarySkills: 'Digital Marketing, Content Strategy, Analytics',
      experience: JSON.stringify([
        {
          title: 'Marketing Manager',
          company: 'Brand Innovators',
          location: 'Los Angeles, CA',
          startDate: '2020-06',
          endDate: null,
          description: 'Managing digital marketing campaigns and brand strategy.'
        },
        {
          title: 'Marketing Specialist',
          company: 'Media Group',
          location: 'San Diego, CA',
          startDate: '2018-03',
          endDate: '2020-05',
          description: 'Executed social media and content marketing initiatives.'
        }
      ]),
      education: JSON.stringify([
        {
          degree: 'B.A. Marketing',
          institution: 'USC',
          location: 'Los Angeles, CA',
          graduationYear: 2018
        }
      ]),
      desiredRole: 'Senior Marketing Manager',
      desiredSalary: '$110,000 - $130,000',
      desiredLocation: 'Los Angeles, CA',
      remotePreference: 'Hybrid',
      openToOpportunities: true,
      currentlyEmployed: true
    }
  },
  {
    name: 'James Wilson',
    email: 'james.wilson@example.com',
    password: 'password123',
    profile: {
      phoneNumber: '555-456-7890',
      location: 'Denver, CO',
      currentTitle: 'Full Stack Developer',
      currentCompany: 'Tech Startups Inc.',
      yearsOfExperience: 3,
      skills: 'JavaScript, React, Node.js, Python, Django, MongoDB, PostgreSQL',
      primarySkills: 'React, Node.js, MongoDB',
      experience: JSON.stringify([
        {
          title: 'Full Stack Developer',
          company: 'Tech Startups Inc.',
          location: 'Denver, CO',
          startDate: '2021-02',
          endDate: null,
          description: 'Developing web applications using MERN stack.'
        },
        {
          title: 'Junior Developer',
          company: 'Web Solutions',
          location: 'Boulder, CO',
          startDate: '2019-05',
          endDate: '2021-01',
          description: 'Built and maintained client websites and applications.'
        }
      ]),
      education: JSON.stringify([
        {
          degree: 'B.S. Computer Science',
          institution: 'Colorado State University',
          location: 'Fort Collins, CO',
          graduationYear: 2019
        }
      ]),
      desiredRole: 'Senior Full Stack Developer',
      desiredSalary: '$120,000 - $140,000',
      desiredLocation: 'Denver, CO',
      remotePreference: 'Remote',
      openToOpportunities: true,
      currentlyEmployed: true
    }
  },
  {
    name: 'Sophia Patel',
    email: 'sophia.patel@example.com',
    password: 'password123',
    profile: {
      phoneNumber: '555-567-8901',
      location: 'Boston, MA',
      currentTitle: 'Project Manager',
      currentCompany: 'Consulting Group',
      yearsOfExperience: 6,
      skills: 'Project Management, Agile, Scrum, Budgeting, Risk Management, Stakeholder Communication',
      primarySkills: 'Project Management, Agile, Stakeholder Communication',
      experience: JSON.stringify([
        {
          title: 'Project Manager',
          company: 'Consulting Group',
          location: 'Boston, MA',
          startDate: '2019-08',
          endDate: null,
          description: 'Managing technology implementation projects for enterprise clients.'
        },
        {
          title: 'Associate Project Manager',
          company: 'Business Solutions',
          location: 'Boston, MA',
          startDate: '2017-03',
          endDate: '2019-07',
          description: 'Coordinated project timelines and resources for client engagements.'
        }
      ]),
      education: JSON.stringify([
        {
          degree: 'MBA',
          institution: 'Boston University',
          location: 'Boston, MA',
          graduationYear: 2017
        },
        {
          degree: 'B.S. Business Administration',
          institution: 'Northeastern University',
          location: 'Boston, MA',
          graduationYear: 2015
        }
      ]),
      desiredRole: 'Senior Project Manager',
      desiredSalary: '$130,000 - $150,000',
      desiredLocation: 'Boston, MA',
      remotePreference: 'Hybrid',
      openToOpportunities: false,
      currentlyEmployed: true
    }
  },
  {
    name: 'Ryan Thompson',
    email: 'ryan.thompson@example.com',
    password: 'password123',
    profile: {
      phoneNumber: '555-678-9012',
      location: 'Atlanta, GA',
      currentTitle: 'Sales Manager',
      currentCompany: 'Enterprise Solutions',
      yearsOfExperience: 8,
      skills: 'B2B Sales, Account Management, CRM, Negotiation, Sales Strategy, Team Leadership',
      primarySkills: 'B2B Sales, Account Management, Team Leadership',
      experience: JSON.stringify([
        {
          title: 'Sales Manager',
          company: 'Enterprise Solutions',
          location: 'Atlanta, GA',
          startDate: '2018-11',
          endDate: null,
          description: 'Leading a team of 10 sales representatives for B2B software solutions.'
        },
        {
          title: 'Senior Sales Representative',
          company: 'Tech Sales Inc.',
          location: 'Charlotte, NC',
          startDate: '2015-04',
          endDate: '2018-10',
          description: 'Managed enterprise client accounts and exceeded sales targets.'
        }
      ]),
      education: JSON.stringify([
        {
          degree: 'B.A. Business',
          institution: 'University of Georgia',
          location: 'Athens, GA',
          graduationYear: 2015
        }
      ]),
      desiredRole: 'Sales Director',
      desiredSalary: '$150,000 - $180,000',
      desiredLocation: 'Atlanta, GA',
      remotePreference: 'In-office',
      openToOpportunities: true,
      currentlyEmployed: true
    }
  },
  {
    name: 'Emma Davis',
    email: 'emma.davis@example.com',
    password: 'password123',
    profile: {
      phoneNumber: '555-789-0123',
      location: 'Portland, OR',
      currentTitle: 'Content Strategist',
      currentCompany: 'Digital Content Co.',
      yearsOfExperience: 4,
      skills: 'Content Strategy, Copywriting, SEO, Content Marketing, Editorial Planning, Brand Voice',
      primarySkills: 'Content Strategy, Copywriting, Editorial Planning',
      experience: JSON.stringify([
        {
          title: 'Content Strategist',
          company: 'Digital Content Co.',
          location: 'Portland, OR',
          startDate: '2020-03',
          endDate: null,
          description: 'Developing content strategies and editorial calendars for clients.'
        },
        {
          title: 'Content Writer',
          company: 'Marketing Agency',
          location: 'Seattle, WA',
          startDate: '2018-06',
          endDate: '2020-02',
          description: 'Created engaging content for various digital platforms.'
        }
      ]),
      education: JSON.stringify([
        {
          degree: 'B.A. English',
          institution: 'University of Oregon',
          location: 'Eugene, OR',
          graduationYear: 2018
        }
      ]),
      desiredRole: 'Senior Content Strategist',
      desiredSalary: '$90,000 - $110,000',
      desiredLocation: 'Portland, OR',
      remotePreference: 'Remote',
      openToOpportunities: true,
      currentlyEmployed: true
    }
  }
];

async function seedTalentData() {
  console.log('Starting to seed talent data...');

  try {
    // Create talent users
    for (const talent of mockTalents) {
      console.log(`Creating talent user: ${talent.name}`);
      
      // Hash password
      const passwordHash = await bcrypt.hash(talent.password, 10);
      
      // Insert user
      const [newUser] = await db
        .insert(users)
        .values({
          name: talent.name,
          email: talent.email,
          passwordHash,
          userType: 'talent',
          role: 'member',
        })
        .returning();
      
      console.log(`Created user with ID: ${newUser.id}`);
      
      // Create talent profile
      await ensureTalentProfileExists(newUser.id);
      
      // Update talent profile with mock data
      await updateTalentProfile(newUser.id, talent.profile);
      
      console.log(`Updated profile for ${talent.name}`);
    }
    
    console.log('Talent data seeding completed successfully!');
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

export { seedTalentData }; 