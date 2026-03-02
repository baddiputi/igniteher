import { CareerDomain, Student } from './types'

export interface CareerRecommendation {
    domain: CareerDomain
    score: number
    careerTitles: Array<{ title: string; desc: string }>
    matchReasons: string[]
}

export function getCareerRecommendations(
    student: Partial<Student>,
    domains: CareerDomain[],
    limit = 4
): CareerRecommendation[] {
    const recommendations: CareerRecommendation[] = domains.map((domain) => {
        let score = 0
        const matchReasons: string[] = []

        // +5 for each matching interest
        const interestMatches = (student.interests || []).filter(
            (interest) => domain.related_interests.some(
                (ri) => ri.toLowerCase().includes(interest.toLowerCase()) ||
                    interest.toLowerCase().includes(ri.toLowerCase())
            )
        )
        if (interestMatches.length > 0) {
            score += interestMatches.length * 5
            matchReasons.push(`Matches your interest in ${interestMatches.join(', ')}`)
        }

        // +3 for each matching skill
        const skillMatches = (student.skills || []).filter(
            (skill) => domain.required_skills.some(
                (rs) => rs.toLowerCase().includes(skill.toLowerCase()) ||
                    skill.toLowerCase().includes(rs.toLowerCase())
            )
        )
        if (skillMatches.length > 0) {
            score += skillMatches.length * 3
            matchReasons.push(`Uses your skills: ${skillMatches.join(', ')}`)
        }

        // +1 for learning style alignment
        const learningStyleDomainMap: Record<string, string[]> = {
            'Visual': ['Artificial Intelligence', 'Data Science', 'Cybersecurity'],
            'Hands-on': ['Robotics', 'App Development', 'Web Development', 'Electronics'],
            'Theoretical': ['Research', 'Biotechnology', 'Aerospace'],
            'Hybrid': ['Artificial Intelligence', 'Data Science', 'Biotechnology'],
        }
        if (student.learning_style &&
            learningStyleDomainMap[student.learning_style]?.includes(domain.name)) {
            score += 1
            matchReasons.push(`Suits your ${student.learning_style} learning style`)
        }

        return {
            domain,
            score,
            careerTitles: domain.career_titles || [],
            matchReasons,
        }
    })

    return recommendations
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
}
