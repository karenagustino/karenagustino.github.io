import React from 'react';
let zigzagBg;
try {
    zigzagBg = require('../assets/zigzag-resume-bg.png');
} catch {
    zigzagBg = '';
}

const resumeContentStyle = {
    position: 'absolute',
    top: 5,
    left: 20,
    width: '100%',
    height: '100%',
    padding: '8rem 1.2rem 2.5rem 2rem',
    color: '#49523A',
    fontFamily: 'Roboto, sans-serif',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    boxSizing: 'border-box',
};

const sectionTitleStyle = {
    fontWeight: 700,
    fontSize: '1.6rem',
    marginBottom: 12,
    color: '#49523A',
    letterSpacing: 1,
};

const sectionBlockStyle = {
    marginBottom: 30,
};

const education = [
    {
        school: 'The University of British Columbia',
        detail: 'Sauder School of Business',
        degree: "Bachelor's in Combined Major in Business and Computer Science (BUCS)",
        grad: 'Expected graduation in May 2027',
    },
];

const experiences = [
    {
        title: 'HR Information Systems Analyst Co-op',
        company: 'Elk Valley Resources Ltd. (Glencore)',
        dates: 'Sept 2024 – present',
    },
    {
        title: 'Hackathon Organizer',
        company: 'nwPlus',
        dates: 'May 2023 – present',
    },
    {
        title: 'Community Operations Intern',
        company: 'Minivillage',
        dates: 'May 2024 – Aug 2024',
    },
    {
        title: 'Software Developer',
        company: 'UBC Product Management Club',
        dates: 'May 2024 – Aug 2024',
    },
    {
        title: 'Project Manager',
        company: 'Google Developer Student Club',
        dates: 'Oct 2023 – Apr 2024',
    },
    {
        title: 'Product Manager (Experiences Lead)',
        company: 'UBC Business Technology (BizTech) Network',
        dates: 'Sep 2023 – Apr 2024',
    },
    {
        title: 'Internal Lead',
        company: 'UBC Business Technology (BizTech) Network',
        dates: 'May 2023 – Sep 2023',
    },
    {
        title: 'Events Director',
        company: 'UBC Business Technology (BizTech) Network',
        dates: 'May 2022 – Apr 2023',
    },
    {
        title: 'Co-Vice Chair & VP Internal',
        company: 'Sauder International Student Association',
        dates: 'Sep 2021 – May 2022',
    },
    {
        title: 'Founder',
        company: 'Carelabel',
        dates: 'Apr 2016 – Aug 2021',
    },
];

const skills = [
    {
        category: 'Languages',
        items: ['Python', 'Java', 'JavaScript', 'TypeScript', 'HTML/CSS', 'SQL'],
    },
    {
        category: 'Frameworks',
        items: ['React', 'Flask', 'Node.js', 'jQuery'],
    },
    {
        category: 'Tools',
        items: ['Git & GitHub', 'Postman', 'Firebase', 'Azure DevOps', 'ServiceNow', 'Jira', 'Tableau', 'Power Apps'],
    },
    {
        category: 'Product',
        items: ['Figma', 'Prototyping/Wireframing', 'User Testing'],
    },
    {
        category: 'Methodologies',
        items: ['Scrum', 'Agile', 'Kanban', 'Design Thinking'],
    },
];

const Resume = () => (
    <section id="resume-section" style={{
        margin: '2.5rem auto 4rem auto',
        maxWidth: 1000,
        position: 'relative',
        minHeight: 700,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
    }}>
        <div style={{ width: '100%', maxWidth: 1000, minHeight: 700, position: 'relative', zIndex: 3, margin: '0 auto' }}>
            {zigzagBg && (
                <img src={zigzagBg} alt="zigzag background" style={{ width: '100%', height: 'auto', display: 'block', position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto' }} />
            )}
            <div style={resumeContentStyle}>
                <h2 style={sectionTitleStyle}>EDUCATION</h2>
                <div style={sectionBlockStyle}>
                    {education.map((edu, idx) => (
                        <div key={idx} style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 600, fontSize: '1.08rem', textAlign: 'left' }}>{edu.school} <span style={{ fontWeight: 400, fontSize: '1rem', color: '#888' }}>· {edu.detail}</span></div>
                            <div style={{ fontStyle: 'italic', fontSize: '1rem', color: '#49523A', marginBottom: 3, marginTop: 3, textAlign: 'left' }}>{edu.degree}</div>
                            <div style={{ fontSize: '0.97rem', color: '#888', textAlign: 'left' }}>{edu.grad}</div>
                        </div>
                    ))}
                </div>
                <h2 style={sectionTitleStyle}>EXPERIENCE</h2>
                <div style={sectionBlockStyle}>
                    {experiences.map((exp, idx) => (
                        <div key={idx} style={{ marginBottom: 22, textAlign: 'left' }}>
                            <div style={{ fontWeight: 600, fontSize: '1.08rem', textAlign: 'left' }}>{exp.title} <span style={{ fontWeight: 400, fontSize: '1rem', color: '#888' }}> - {exp.company}</span></div>
                            <div style={{ fontSize: '0.97rem', color: '#888', marginBottom: 3, marginTop: 3, textAlign: 'left' }}>{exp.dates}</div>
                        </div>
                    ))}
                </div>
                <h2 style={sectionTitleStyle}>SKILLS</h2>
                <div style={{ display: 'flex', justifyContent: 'flex-start', flexWrap: 'nowrap', gap: 32, width: '100%', maxWidth: 1000 }}>
                    {skills.map((skill, idx) => (
                        <div key={idx} style={{ minWidth: 120, textAlign: 'left' }}>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>{skill.category}</div>
                            <ul style={{ margin: 0, paddingLeft: 18, fontSize: '1rem', lineHeight: 1.5 }}>
                                {skill.items.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </section>
);

export default Resume; 