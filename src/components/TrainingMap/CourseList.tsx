'use client';

import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { TrackItem } from '@/types/TrainingMap';
import dynamic from 'next/dynamic';
import { DragEndEvent } from '@dnd-kit/core';

// Import Cloudscape components
import ExpandableSection from "@cloudscape-design/components/expandable-section";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Badge from "@cloudscape-design/components/badge";
import Link from "@cloudscape-design/components/link";
import Box from "@cloudscape-design/components/box";

// Dynamically import the DndContextWrapper with ssr: false
const DndContextWrapper = dynamic(() => import('./DndContextWrapper'), { ssr: false });

const CourseList: React.FC = () => {
  const [isCertificationsExpanded, setIsCertificationsExpanded] = useState(false);
  const [isCoursesExpanded, setIsCoursesExpanded] = useState(false);
  const [isExamPrepExpanded, setIsExamPrepExpanded] = useState(false);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over) {
      // Handle the drag end event, e.g., update the grid
      console.log('Dragged item:', active.id, 'to:', over.id);
    }
  };

  return (
    <Box padding="n" className="course-list-container max-h-[calc(100vh-200px)] overflow-y-auto">
      <SpaceBetween size="l">
        {/* Certifications Section */}
        <ExpandableSection 
          headerText="AWS Certifications"
          expanded={isCertificationsExpanded}
          onChange={({ detail }) => setIsCertificationsExpanded(detail.expanded)}
          variant="container"
        >
          <div className="max-h-[300px] overflow-y-auto">
            <SpaceBetween size="xs">
              {AWS_CERTIFICATIONS.map((cert) => (
                <DraggableCourseItem key={cert.title} course={cert} />
              ))}
            </SpaceBetween>
          </div>
        </ExpandableSection>

        {/* Courses Section */}
        <ExpandableSection
          headerText="Training Courses"
          expanded={isCoursesExpanded}
          onChange={({ detail }) => setIsCoursesExpanded(detail.expanded)}
          variant="container"
        >
          <div className="max-h-[300px] overflow-y-auto">
            <SpaceBetween size="xs">
              {TRAINING_COURSES.map((course) => (
                <DraggableCourseItem key={course.title} course={course} />
              ))}
            </SpaceBetween>
          </div>
        </ExpandableSection>

        {/* Exam Prep Section */}
        <ExpandableSection
          headerText="Exam Preparation"
          expanded={isExamPrepExpanded}
          onChange={({ detail }) => setIsExamPrepExpanded(detail.expanded)}
          variant="container"
        >
          <div className="max-h-[300px] overflow-y-auto">
            <SpaceBetween size="xs">
              {EXAM_PREP_COURSES.map((course) => (
                <DraggableCourseItem key={course.title} course={course} />
              ))}
            </SpaceBetween>
          </div>
        </ExpandableSection>
      </SpaceBetween>
    </Box>
  );
};

// DraggableCourseItem component
const DraggableCourseItem: React.FC<{ course: TrackItem }> = ({ course }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: course.title,
    data: course
  });

  const style = transform ? {
    transform: CSS.Transform.toString(transform),
  } : undefined;

  // Remove aria-describedby from attributes spread
  const { 'aria-describedby': _, ...restAttributes } = attributes;

  // Use a static or consistent ID for aria-describedby
  const describedById = `description-${course.title.replace(/\s+/g, '-')}`;

  return (
    <div 
      ref={setNodeRef} 
      style={{
        ...style,
        opacity: isDragging ? 0.3 : 1,
        transition: 'all 0.2s ease-in-out',
      }} 
      className={`
        p-2 rounded-lg border border-gray-200
        bg-white cursor-grab active:cursor-grabbing
        hover:shadow-md hover:border-blue-300
        transform hover:scale-[1.02]
        transition-all duration-200
        ${isDragging ? 'shadow-2xl scale-105' : ''}
      `}
      aria-describedby={describedById}
      {...restAttributes} 
      {...listeners}
    >
      <SpaceBetween size="xs">
        <Link href={course.url} external>
          {course.title}
        </Link>
        <Box>
          <SpaceBetween size="xs" direction="horizontal">
            <Badge>{course.duration}</Badge>
            <Badge 
              color={
                course.level === 'fundamental' ? 'blue' : 
                course.level === 'associate' ? 'green' : 'grey'
              }
            >
              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
            </Badge>
          </SpaceBetween>
        </Box>
      </SpaceBetween>
    </div>
  );
};

// Exam Preparation Courses
const EXAM_PREP_COURSES: TrackItem[] = [
  // Fundamental Level
  {
    title: 'Exam Prep Official Practice Exam: AWS Certified Developer - Associate (DVA-C02)',
    url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/14196/exam-prep-official-practice-exam-aws-certified-developer-associate-dva-c02-english',
    duration: '2h 10m',
    type: 'course',
    level: 'fundamental'
  },
  {
    title: 'Exam Prep Enhanced Course: AWS Certified Solutions Architect - Associate (SAA-C03)',
    url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/14776/exam-prep-enhanced-course-aws-certified-solutions-architect-associate-saa-c03',
    duration: '9h 30m',
    type: 'course',
    level: 'fundamental'
  },
  {
    title: 'Exam Prep Enhanced Course: AWS Certified Developer - Associate (DVA-C02)',
    url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/14723/exam-prep-enhanced-course-aws-certified-developer-associate-dva-c02',
    duration: '11h',
    type: 'course',
    level: 'fundamental'
  },
  {
    title: 'Exam Prep Enhanced Course: AWS Certified Cloud Practitioner (CLF-C02)',
    url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/16485/exam-prep-enhanced-course-aws-certified-cloud-practitioner-clf-c02-english',
    duration: '11h',
    type: 'course',
    level: 'fundamental'
  },
  {
    title: 'Exam Prep Official Pretest: AWS Certified Cloud Practitioner (CLF-C02)',
    url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/18115/exam-prep-official-pretest-aws-certified-cloud-practitioner-clf-c02-english',
    duration: '1h 30m',
    type: 'course',
    level: 'fundamental'
  },
  {
    title: 'Exam Prep Official Practice Exam: AWS Certified Cloud Practitioner (CLF-C02)',
    url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/14637/exam-prep-official-practice-exam-aws-certified-cloud-practitioner-clf-c02-english',
    duration: '1h 30m',
    type: 'course',
    level: 'fundamental'
  },
  {
    title: 'Exam Prep Enhanced Course: AWS Certified Data Engineer - Associate (DEA-C01)',
    url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/18603/exam-prep-enhanced-course-aws-certified-data-engineer-associate-dea-c01-english',
    duration: '15h 25m',
    type: 'course',
    level: 'fundamental'
  },
  {
    title: 'Exam Prep Official Practice Exam: AWS Certified SysOps Administrator - Associate (SOA-C02)',
    url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/12480/exam-prep-official-practice-exam-aws-certified-sysops-administrator-associate-soa-c02-english',
    duration: '3h',
    type: 'course',
    level: 'fundamental'
  },
  {
    title: 'Exam Prep Official Practice Exam: AWS Certified Solutions Architect - Associate (SAA-C03)',
    url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/13593/exam-prep-official-practice-exam-aws-certified-solutions-architect-associate-saa-c03-english',
    duration: '2h 10m',
    type: 'course',
    level: 'fundamental'
  },
  {
    title: 'Exam Prep Official Pretest: AWS Certified Data Engineer - Associate (DEA-C01)',
    url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/18609/exam-prep-official-pretest-aws-certified-data-engineer-associate-dea-c01-english',
    duration: '2h 10m',
    type: 'course',
    level: 'fundamental'
  },
  {
    title: 'Exam Prep Official Pretest: AWS Certified Machine Learning Engineer - Associate (MLA-C01)',
    url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/19742/exam-prep-official-pretest-aws-certified-machine-learning-engineer-associate-mla-c01-english',
    duration: '2h 10m',
    type: 'course',
    level: 'fundamental'
  },
  {
    title: 'Exam Prep Official Practice Exam: AWS Certified Data Engineer - Associate (DEA-C01)',
    url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/19881/exam-prep-official-practice-exam-aws-certified-data-engineer-associate-dea-c01-english',
    duration: '2h 10m',
    type: 'course',
    level: 'fundamental'
  },
  {
    title: 'Exam Prep Official Pretest: AWS Certified AI Practitioner (AIF-C01)',
    url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/20274/exam-prep-official-pretest-aws-certified-ai-practitioner-aif-c01-english',
    duration: '1h 30m',
    type: 'course',
    level: 'fundamental'
  },
  {
    title: 'Exam Prep Enhanced Course: AWS Certified Machine Learning Engineer - Associate (MLA-C01)',
    url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/19876/exam-prep-enhanced-course-aws-certified-machine-learning-engineer-associate-mla-c01-english',
    duration: '12h 45m',
    type: 'course',
    level: 'fundamental'
  },
  {
    title: 'Exam Prep Enhanced Course: AWS Certified AI Practitioner (AIF-C01)',
    url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/20479/exam-prep-enhanced-course-aws-certified-ai-practitioner-aif-c01-english',
    duration: '16h 30m',
    type: 'course',
    level: 'fundamental'
  },
  {
    title: 'AWS Escape Room: Exam Prep for AWS Certified AI Practitioner (AIF-C01)',
    url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/20657/aws-escape-room-exam-prep-for-aws-certified-ai-practitioner-aif-c01-english',
    duration: '4h',
    type: 'course',
    level: 'fundamental'
  },
  {
    title: 'Exam Prep Enhanced Course: AWS Certified SysOps Administrator - Associate (SOA-C02)',
    url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/21675/exam-prep-enhanced-course-aws-certified-sysops-administrator-associate-soa-c02',
    duration: '9h',
    type: 'course',
    level: 'fundamental'
  },
  // Intermediate Level
  {
    title: 'Exam Prep Enhanced Course: AWS Certified Solutions Architect - Professional (SAP-C02)',
    url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/14953/exam-prep-enhanced-course-aws-certified-solutions-architect-professional-sap-c02',
    duration: '10h 30m',
    type: 'course',
    level: 'professional'
  },
  {
    title: 'Exam Prep Official Practice Exam: AWS Certified DevOps Engineer - Professional (DOP-C02)',
    url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/14810/exam-prep-official-practice-exam-aws-certified-devops-engineer-professional-dop-c02-english',
    duration: '3h',
    type: 'course',
    level: 'professional'
  },
  {
    title: 'Exam Prep Enhanced Course: AWS Certified DevOps Engineer - Professional (DOP-C02)',
    url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/16512/exam-prep-enhanced-course-aws-certified-devops-engineer-professional-dop-c02-english',
    duration: '12h',
    type: 'course',
    level: 'professional'
  },
  {
    title: 'Exam Prep Official Practice Exam: AWS Certified Solutions Architect - Professional (SAP-C02)',
    url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/14048/exam-prep-official-practice-exam-aws-certified-solutions-architect-professional-sap-c02-english',
    duration: '3h',
    type: 'course',
    level: 'professional'
  },
  // Advanced Level
  {
    title: 'Exam Prep Enhanced Course: AWS Certified Security - Specialty (SCS-C02)',
    url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/18292/exam-prep-enhanced-course-aws-certified-security-specialty-scs-c02-english',
    duration: '14h 15m',
    type: 'course',
    level: 'professional'
  },
  {
    title: 'Exam Prep Official Practice Exam: AWS Certified Security - Specialty (SCS-C02)',
    url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/15719/exam-prep-official-practice-exam-aws-certified-security-specialty-scs-c02-english',
    duration: '3h',
    type: 'course',
    level: 'professional'
  },
  {
    title: 'Exam Prep Enhanced Course: AWS Certified Advanced Networking - Specialty (ANS-C01)',
    url: 'https://explore.skillbuilder.aws/learn/course/external/view/elearning/14773/exam-prep-enhanced-course-aws-certified-advanced-networking-specialty-ans-c01',
    duration: '6h',
    type: 'course',
    level: 'professional'
  }
];

// AWS Certifications
const AWS_CERTIFICATIONS: TrackItem[] = [
  // Fundamental Level
  {
    title: 'AWS Certified Cloud Practitioner',
    url: 'https://aws.amazon.com/certification/certified-cloud-practitioner',
    duration: 'CLF-C02',
    type: 'certification',
    level: 'fundamental'
  },
  {
    title: 'AWS Certified AI Practitioner',
    url: 'https://aws.amazon.com/certification/certified-ai-practitioner',
    duration: 'AIP-C01',
    type: 'certification',
    level: 'fundamental'
  },

  // Associate Level
  {
    title: 'AWS Certified Solutions Architect - Associate',
    url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate',
    duration: 'SAA-C03',
    type: 'certification',
    level: 'associate'
  },
  {
    title: 'AWS Certified Developer - Associate',
    url: 'https://aws.amazon.com/certification/certified-developer-associate',
    duration: 'DVA-C02',
    type: 'certification',
    level: 'associate'
  },
  {
    title: 'AWS Certified SysOps Administrator - Associate',
    url: 'https://aws.amazon.com/certification/certified-sysops-admin-associate',
    duration: 'SOA-C02',
    type: 'certification',
    level: 'associate'
  },
  {
    title: 'AWS Certified Data Engineer - Associate',
    url: 'https://aws.amazon.com/certification/certified-data-engineer-associate',
    duration: 'DAS-C01',
    type: 'certification',
    level: 'associate'
  },
  {
    title: 'AWS Certified Machine Learning Engineer - Associate',
    url: 'https://aws.amazon.com/certification/certified-machine-learning-engineer-associate',
    duration: 'MLS-C01',
    type: 'certification',
    level: 'associate'
  },

  // Professional Level
  {
    title: 'AWS Certified Solutions Architect - Professional',
    url: 'https://aws.amazon.com/certification/certified-solutions-architect-professional',
    duration: 'SAP-C02',
    type: 'certification',
    level: 'professional'
  },
  {
    title: 'AWS Certified DevOps Engineer - Professional',
    url: 'https://aws.amazon.com/certification/certified-devops-engineer-professional',
    duration: 'DOP-C02',
    type: 'certification',
    level: 'professional'
  },

  // Specialty Level
  {
    title: 'AWS Certified Advanced Networking - Specialty',
    url: 'https://aws.amazon.com/certification/certified-advanced-networking-specialty',
    duration: 'ANS-C01',
    type: 'certification',
    level: 'professional'
  },
  {
    title: 'AWS Certified Security - Specialty',
    url: 'https://aws.amazon.com/certification/certified-security-specialty',
    duration: 'SCS-C02',
    type: 'certification',
    level: 'professional'
  },
  {
    title: 'AWS Certified Machine Learning - Specialty',
    url: 'https://aws.amazon.com/certification/certified-machine-learning-specialty',
    duration: 'MLS-C01',
    type: 'certification',
    level: 'professional'
  }
];

// Training Courses
const TRAINING_COURSES: TrackItem[] = [
  // Fundamental Level Courses
  {
    title: 'AWS Cloud Practitioner Essentials',
    url: 'https://aws.amazon.com/training/classroom/aws-cloud-practitioner-essentials/',
    duration: '1D',
    type: 'course',
    level: 'fundamental'
  },
  {
    title: 'AWS Cloud Essentials for Business Leaders',
    url: 'https://aws.amazon.com/training/classroom/aws-cloud-essentials-for-business-leaders/',
    duration: '4H',
    type: 'course',
    level: 'fundamental'
  },
  {
    title: 'AWS Technical Essentials',
    url: 'https://aws.amazon.com/training/classroom/aws-technical-essentials/',
    duration: '1D',
    type: 'course',
    level: 'fundamental'
  },
  {
    title: 'AWS Migration Essentials',
    url: 'https://aws.amazon.com/training/classroom/aws-migration-essentials/',
    duration: '1D',
    type: 'course',
    level: 'fundamental'
  },
  {
    title: 'AWS Security Essentials',
    url: 'https://aws.amazon.com/training/classroom/aws-security-essentials/',
    duration: '1D',
    type: 'course',
    level: 'fundamental'
  },
  {
    title: 'Generative AI for Executives',
    url: 'https://aws.amazon.com/training/classroom/generative-ai-for-executives/',
    duration: '4H',
    type: 'course',
    level: 'fundamental'
  },
  {
    title: 'Generative AI Essentials on AWS',
    url: 'https://aws.amazon.com/training/classroom/generative-ai-essentials-on-aws/',
    duration: '1D',
    type: 'course',
    level: 'fundamental'
  },

  // Associate Level Courses
  {
    title: 'Architecting on AWS',
    url: 'https://aws.amazon.com/training/classroom/architecting-on-aws/',
    duration: '3D',
    type: 'course',
    level: 'associate'
  },
  {
    title: 'Architecting on AWS with JAM',
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
    title: 'Building Data Analytics Solutions Using Amazon Redshift',
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
    title: 'Cloud Operations on AWS',
    url: 'https://aws.amazon.com/training/classroom/cloud-operations-on-aws/',
    duration: '3D',
    type: 'course',
    level: 'associate'
  },
  {
    title: 'Cloud Operations on AWS with JAM',
    url: 'https://aws.amazon.com/training/classroom/cloud-operations-on-aws/',
    duration: '4D',
    type: 'course',
    level: 'associate'
  },
  {
    title: 'Developing on AWS with JAM',
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
    title: 'Designing and Implementing Storage on AWS',
    url: 'https://aws.amazon.com/training/classroom/designing-and-implementing-storage-on-aws/',
    duration: '3D',
    type: 'course',
    level: 'associate'
  },
  {
    title: 'MLOps Engineering on AWS',
    url: 'https://aws.amazon.com/training/classroom/mlops-engineering-on-aws/',
    duration: '3D',
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
    title: 'Networking Essentials for Cloud Applications on AWS',
    url: 'https://aws.amazon.com/training/classroom/networking-essentials-for-cloud-applications-on-aws/',
    duration: '1D',
    type: 'course',
    level: 'associate'
  },
  {
    title: 'Practical Data Science with Amazon SageMaker',
    url: 'https://aws.amazon.com/training/classroom/practical-data-science-with-amazon-sagemaker/',
    duration: '1D',
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
    title: 'Security Engineering on AWS',
    url: 'https://aws.amazon.com/training/classroom/security-engineering-on-aws/',
    duration: '3D',
    type: 'course',
    level: 'associate'
  },
  {
    title: 'Security Engineering on AWS with JAM',
    url: 'https://aws.amazon.com/training/classroom/security-engineering-on-aws/',
    duration: '4D',
    type: 'course',
    level: 'associate'
  },

  // Professional Level Courses
  {
    title: 'Advanced Architecting on AWS',
    url: 'https://aws.amazon.com/training/classroom/advanced-architecting-aws/',
    duration: '3D',
    type: 'course',
    level: 'professional'
  },
  {
    title: 'Advanced Architecting on AWS with JAM',
    url: 'https://aws.amazon.com/training/classroom/advanced-architecting-aws/',
    duration: '4D',
    type: 'course',
    level: 'professional'
  },
  {
    title: 'Advanced AWS Well-Architected Best Practices',
    url: 'https://aws.amazon.com/training/classroom/advanced-well-architected-best-practices/',
    duration: '1D',
    type: 'course',
    level: 'professional'
  },
  {
    title: 'Advanced Developing on AWS with JAM',
    url: 'https://aws.amazon.com/training/classroom/advanced-developing-aws/',
    duration: '4D',
    type: 'course',
    level: 'professional'
  },
  {
    title: 'DevOps Engineering on AWS with JAM',
    url: 'https://aws.amazon.com/training/classroom/devops-engineering-on-aws/',
    duration: '4D',
    type: 'course',
    level: 'professional'
  },
  {
    title: 'Amazon SageMaker Studio for Data Scientists',
    url: 'https://aws.amazon.com/training/classroom/amazon-sagemaker-studio-for-data-scientists/',
    duration: '3D',
    type: 'course',
    level: 'professional'
  },
  {
    title: 'Data Warehousing on AWS',
    url: 'https://aws.amazon.com/training/classroom/data-warehousing-on-aws/',
    duration: '3D',
    type: 'course',
    level: 'professional'
  },
  {
    title: 'Developing Generative AI Applications on AWS',
    url: 'https://aws.amazon.com/training/classroom/developing-generative-ai-applications-on-aws/',
    duration: '2D',
    type: 'course',
    level: 'professional'
  },
  {
    title: 'Developing Generative AI Applications on AWS with JAM',
    url: 'https://aws.amazon.com/training/classroom/developing-generative-ai-applications-on-aws/',
    duration: '3D',
    type: 'course',
    level: 'professional'
  }
];

export default CourseList; 