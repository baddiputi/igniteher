import { Mentor, Student } from './types'

export interface MentorMatch {
    mentor: Mentor
    score: number
    matchReasons: string[]
}

export function getTopMentors(
    student: Partial<Student>,
    mentors: Mentor[],
    limit = 3
): MentorMatch[] {
    const matches: MentorMatch[] = mentors.map((mentor) => {
        let score = 0
        const matchReasons: string[] = []

        // +5 if mentor domain matches student interest
        const domainMatch = (student.interests || []).some(
            (interest) =>
                mentor.domain.toLowerCase().includes(interest.toLowerCase()) ||
                interest.toLowerCase().includes(mentor.domain.toLowerCase())
        )
        if (domainMatch) {
            score += 5
            matchReasons.push(`Expert in ${mentor.domain} – aligns with your interests`)
        }

        // +3 if mentor type matches preference
        if (
            student.preferred_mentor_type &&
            mentor.mentor_type.toLowerCase() === student.preferred_mentor_type.toLowerCase()
        ) {
            score += 3
            matchReasons.push(`${mentor.mentor_type} – your preferred mentor type`)
        }

        // +2 if language matches
        const langMatch = (student.languages || []).some((lang) =>
            mentor.languages.some((ml) => ml.toLowerCase() === lang.toLowerCase())
        )
        if (langMatch) {
            score += 2
            matchReasons.push('Speaks a language you know')
        }

        // +1 if communication style matches
        const commMatch = (mentor.communication_styles || []).some(
            (style) => style.toLowerCase() === (student.communication_style || '').toLowerCase()
        )
        if (commMatch) {
            score += 1
            matchReasons.push(`Available via ${student.communication_style}`)
        }

        return { mentor: { ...mentor, score }, score, matchReasons }
    })

    return matches
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
}
