CREATE TYPE event_category AS ENUM ('milestone', 'release', 'incident');

CREATE TABLE
    IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category event_category NOT NULL
    );

INSERT INTO
    events (date, title, description, category)
VALUES
    (
        '2026-01-15',
        'Project Kickoff',
        'Initial project planning and team onboarding.',
        'milestone'
    ),
    (
        '2026-02-01',
        'v1.0.0 Released',
        'First public release of the application.',
        'release'
    ),
    (
        '2026-02-20',
        'Database Outage',
        'Unexpected database downtime for 2 hours.',
        'incident'
    ),
    (
        '2026-03-10',
        'MVP Complete',
        'All MVP features implemented and tested.',
        'milestone'
    ),
    (
        '2026-03-18',
        'v1.1.0 Released',
        'Bug fixes and performance improvements.',
        'release'
    );