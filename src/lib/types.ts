export interface Student {
    id: string;
    user_id: string;
    full_name: string;
    age?: number;
    location_city?: string;
    location_country?: string;
    education_level?: 'School' | 'UG' | 'PG' | 'Other';
    field_of_study?: string;
    interests: string[];
    skills: string[];
    career_aspirations?: string;
    preferred_mentor_type?: 'Academic' | 'Industry Professional' | 'Researcher' | 'Entrepreneur';
    availability: string[];
    learning_style?: 'Visual' | 'Hands-on' | 'Theoretical' | 'Hybrid';
    languages: string[];
    extracurriculars?: string;
    achievements?: string;
    challenges: string[];
    personality_traits: string[];
    communication_style?: 'Chat' | 'Email' | 'Video';
    created_at: string;
    updated_at: string;
}

export interface Mentor {
    id: string;
    name: string;
    domain: string;
    mentor_type: string;
    languages: string[];
    bio?: string;
    expertise_areas: string[];
    inspirational_message?: string;
    photo_url?: string;
    communication_styles: string[];
    created_at: string;
    score?: number;
}

export interface RoleModel {
    id: string;
    name: string;
    photo_url?: string;
    biography?: string;
    achievements?: string;
    quote?: string;
    domain?: string;
    category: string;
    is_featured: boolean;
    created_at: string;
}

export interface CareerDomain {
    id: string;
    name: string;
    description?: string;
    required_skills: string[];
    related_interests: string[];
    roadmap_link?: string;
    beginner_resources: BeginnerResource[];
    career_titles: CareerTitle[];
    created_at: string;
    score?: number;
}

export interface CareerTitle {
    title: string;
    desc: string;
}

export interface BeginnerResource {
    title: string;
    url: string;
}

export interface LearningResource {
    id: string;
    title: string;
    url?: string;
    type?: 'course' | 'video' | 'project' | 'competition' | 'hackathon' | 'playlist';
    domain?: string;
    skill_level?: 'Beginner' | 'Intermediate' | 'Advanced';
    learning_style?: string;
    description?: string;
    created_at: string;
}
