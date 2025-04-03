export interface TrackItem {
  title: string;
  url: string;
  duration: string;
  type: 'course' | 'certification';
  level: 'fundamental' | 'associate' | 'professional';
  status?: 'not-started' | 'in-progress' | 'completed';
  targetLevel?: string;
}

export interface Track {
  id: string;
  name: string;
  items: {
    title: string;
    url: string;
    duration: string;
    type: string;
    level: string;
    targetLevel?: string;
    sourceTrackId?: string;
    sourceLevelId?: string;
  }[];
}

export interface Level {
  id: string;
  name: string;
  description?: string;
}

export interface MergedCellData {
  startIndex: number;
  endIndex: number;
  items: TrackItem[];
}

export interface Profile {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  tracks: Track[];
}

export interface ProfileState {
  profiles: Profile[];
  activeProfileId: string | null;
}

export const TRACKS: Track[] = [
  {
    id: 'track-0',
    name: 'NON-TECHNICAL',
    items: [
      {
        title: 'Cloud Essential for Business Leaders Day (0.5D) or AWS Cloud Practitioner Essentials Day (0.5D)',
        url: 'https://aws.amazon.com/training/classroom/aws-cloud-essentials-for-business-leaders/',
        duration: '0.5D',
        type: 'course',
        level: 'fundamental'
      },
      {
        title: 'AWS Cloud for Finance Professionals',
        url: 'https://aws.amazon.com/training/classroom/aws-cloud-for-finance-professionals/',
        duration: '2D',
        type: 'course',
        level: 'fundamental'
      },
      {
        title: 'AWS Cloud Practitioner Essentials',
        url: 'https://aws.amazon.com/training/classroom/aws-cloud-practitioner-essentials/',
        duration: '1D',
        type: 'course',
        level: 'associate'
      },
      {
        title: 'Architecting on AWS + Arc JAM',
        url: 'https://aws.amazon.com/training/classroom/architecting-on-aws/',
        duration: '4D',
        type: 'course',
        level: 'associate'
      }
    ]
  },
  {
    id: 'track-1',
    name: 'ARCHITECTING / SECURITY',
    items: [
      {
        title: 'Architecting on AWS + Arc JAM',
        url: 'https://aws.amazon.com/training/classroom/architecting-on-aws/',
        duration: '4D',
        type: 'course',
        level: 'associate'
      },
      {
        title: 'AWS Well-Architected Best Practices',
        url: 'https://aws.amazon.com/training/classroom/aws-well-architected-best-practices/',
        duration: '1D',
        type: 'course',
        level: 'associate'
      },
      {
        title: 'Migrating to AWS',
        url: 'https://aws.amazon.com/training/classroom/migrating-to-aws/',
        duration: '3D',
        type: 'course',
        level: 'associate'
      },
      {
        title: 'Security Governance at Scale',
        url: 'https://aws.amazon.com/training/classroom/security-governance-at-scale/',
        duration: '1D',
        type: 'course',
        level: 'associate'
      },
      {
        title: 'Advanced AWS Well-Architected Best Practices',
        url: 'https://aws.amazon.com/training/classroom/advanced-well-architected-best-practices/',
        duration: '1D',
        type: 'course',
        level: 'professional'
      },
      {
        title: 'AWS Security Best Practices',
        url: 'https://aws.amazon.com/training/classroom/aws-security-best-practices/',
        duration: '1D',
        type: 'course',
        level: 'professional'
      },
      {
        title: 'Security Engineering on AWS + SEC JAM',
        url: 'https://aws.amazon.com/training/classroom/security-engineering-on-aws/',
        duration: '4D',
        type: 'course',
        level: 'professional'
      },
      {
        title: 'Advanced Architecting on AWS + AARC JAM',
        url: 'https://aws.amazon.com/training/classroom/advanced-architecting-aws/',
        duration: '4D',
        type: 'course',
        level: 'professional'
      }
    ]
  },
  {
    id: 'track-2',
    name: 'SYSOPS / DEVOPS',
    items: [
      {
        title: 'Cloud Operations on AWS + Cloud Operations JAM',
        url: 'https://aws.amazon.com/training/classroom/cloud-operations-on-aws/',
        duration: '4D',
        type: 'course',
        level: 'associate'
      },
      {
        title: 'AWS Cloud Financial Management for Builders',
        url: 'https://aws.amazon.com/training/classroom/aws-cloud-financial-management-for-builders/',
        duration: '3D',
        type: 'course',
        level: 'associate'
      },
      {
        title: 'DevOps Engineering on AWS + DevOps Jam',
        url: 'https://aws.amazon.com/training/classroom/devops-engineering-on-aws/',
        duration: '4D',
        type: 'course',
        level: 'professional'
      }
    ]
  },
  {
    id: 'track-3',
    name: 'DEV / DEVOPS',
    items: [
      {
        title: 'AWS Technical Essentials Day',
        url: 'https://aws.amazon.com/training/classroom/aws-technical-essentials/',
        duration: '0.5D',
        type: 'course',
        level: 'fundamental'
      },
      {
        title: 'AWS Certified Cloud Practitioner',
        url: 'https://aws.amazon.com/certification/certified-cloud-practitioner/',
        duration: 'Exam',
        type: 'certification',
        level: 'fundamental'
      },
      {
        title: 'Developing on AWS + Dev JAM',
        url: 'https://aws.amazon.com/training/classroom/developing-on-aws/',
        duration: '4D',
        type: 'course',
        level: 'associate'
      },
      {
        title: 'Developing Serverless Solutions on AWS',
        url: 'https://aws.amazon.com/training/classroom/developing-serverless-solutions-on-aws/',
        duration: '3D',
        type: 'course',
        level: 'associate'
      },
      {
        title: 'Running Containers on Amazon EKS',
        url: 'https://aws.amazon.com/training/classroom/running-containers-on-amazon-elastic-kubernetes-service-amazon-eks/',
        duration: '3D',
        type: 'course',
        level: 'associate'
      },
      {
        title: 'Advanced Developing on AWS + ADev JAM',
        url: 'https://aws.amazon.com/training/classroom/advanced-developing-on-aws/',
        duration: '4D',
        type: 'course',
        level: 'professional'
      },
      {
        title: 'MLOps Engineering on AWS',
        url: 'https://aws.amazon.com/training/classroom/mlops-engineering-on-aws/',
        duration: '3D',
        type: 'course',
        level: 'professional'
      }
    ]
  },
  {
    id: 'track-4',
    name: 'MACHINE LEARNING / Generative AI',
    items: [
      {
        title: 'Machine Learning Pipeline on AWS or Amazon SageMaker Studio for Data Scientists',
        url: 'https://aws.amazon.com/training/classroom/amazon-sagemaker-studio-for-data-scientists/',
        duration: '3D',
        type: 'course',
        level: 'professional'
      },
      {
        title: 'Deep Learning',
        url: 'https://aws.amazon.com/training/classroom/deep-learning/',
        duration: '1D',
        type: 'course',
        level: 'professional'
      },
      {
        title: 'Practical Data Science with Amazon SageMaker',
        url: 'https://aws.amazon.com/training/classroom/practical-data-science-with-amazon-sagemaker/',
        duration: '1D',
        type: 'course',
        level: 'professional'
      }
    ]
  },
  {
    id: 'track-5',
    name: 'DATA ANALYTICS',
    items: [
      {
        title: 'Building Data Lakes on AWS',
        url: 'https://aws.amazon.com/training/classroom/building-data-lakes/',
        duration: '1D',
        type: 'course',
        level: 'associate'
      },
      {
        title: 'Building Batch Data Analytics Solutions on AWS',
        url: 'https://aws.amazon.com/training/classroom/building-batch-data-analytics-solutions-on-aws/',
        duration: '1D',
        type: 'course',
        level: 'associate'
      },
      {
        title: 'Building Data Analytics Solutions using Amazon Redshift',
        url: 'https://aws.amazon.com/training/classroom/building-data-analytics-solutions-using-amazon-redshift/',
        duration: '1D',
        type: 'course',
        level: 'associate'
      },
      {
        title: 'Building Streaming Data Analytics Solutions on AWS',
        url: 'https://aws.amazon.com/training/classroom/building-streaming-data-analytics-solutions-on-aws/',
        duration: '1D',
        type: 'course',
        level: 'associate'
      },
      {
        title: 'Architecting on AWS + Arc JAM',
        url: 'https://aws.amazon.com/training/classroom/architecting-on-aws/',
        duration: '4D',
        type: 'course',
        level: 'associate'
      },
      {
        title: 'Data Warehousing on AWS',
        url: 'https://aws.amazon.com/training/classroom/data-warehousing-on-aws/',
        duration: '3D',
        type: 'course',
        level: 'professional'
      },
      {
        title: 'Planning and Designing Databases on AWS',
        url: 'https://aws.amazon.com/training/classroom/planning-and-designing-databases-on-aws/',
        duration: '3D',
        type: 'course',
        level: 'professional'
      }
    ]
  }
];

export const LEVELS: Level[] = [
  { id: 'level-1', name: 'Level 1 (Fundamental)' },
  { id: 'exam-readiness-1', name: 'L1 Exam Readiness' },
  { id: 'exam-1', name: 'L1 Exam' },
  { id: 'level-2-core', name: 'Level 2 (Associate – Core Topics)' },
  { id: 'exam-readiness-2', name: 'L2 Exam Readiness' },
  { id: 'exam-2', name: 'L2 Exam' },
  { id: 'level-2-additional', name: 'Level 2 (Associate – Additional Topics)' },
  { id: 'level-3', name: 'Level 3 (Specialty / Professional)' },
  { id: 'exam-readiness-3', name: 'L3 Exam Readiness' },
  { id: 'exam-3', name: 'L3 Exams' }
]; 