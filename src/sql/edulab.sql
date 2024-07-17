DROP TABLE IF EXISTS tasks, lessons, homeworks, materials, tests_lessons, tests, question_options, questions, answer_options, notifications, groups_courses, groups_teachers, courses, groups, students, users, roles, tokens, test_results, homework_result CASCADE;

CREATE TYPE role AS ENUM ('admin','teacher','student');
CREATE TYPE task_status AS ENUM ('done', 'check', 'null');
CREATE TYPE task_type AS ENUM ('test', 'homework');
CREATE TYPE question_type AS ENUM ('single', 'many', 'open');
CREATE TYPE test_result_status AS ENUM ('done', 'null');
CREATE TYPE notify_status AS ENUM ('viewed', 'notviewed');
CREATE TYPE notify_type AS ENUM ('studentHWdone', 'teacherHWchecked', 'studentGetCourse', 'teacherGetGroup');
CREATE TYPE source_type AS ENUM ('tasks', 'courses', 'groups');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_activated BOOLEAN DEFAULT FALSE,
    activation_link VARCHAR(255),
    role role NOT NULL,
    avatar_url VARCHAR(255),
    is_subscribed_to_emails BOOLEAN DEFAULT FALSE
);

CREATE TABLE tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    refresh_token TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE students (
    id INT NOT NULL GENERATED ALWAYS AS IDENTITY,
    user_id INTEGER,
    group_id INTEGER,
    CONSTRAINT pk_students PRIMARY KEY (id),
    CONSTRAINT fk_students_users FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_students_groups FOREIGN KEY (group_id) REFERENCES groups(id)
);

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    img_url VARCHAR(255),
    year_course VARCHAR(4) NOT NULL,
    is_active BOOLEAN NOT NULL,
    teacher_user_id INTEGER NOT NULL,
    CONSTRAINT fk_courses_teacher FOREIGN KEY (teacher_user_id) REFERENCES users(id)
);

CREATE TABLE groups_courses (
    group_id INT NOT NULL,
    course_id INT NOT NULL,
    CONSTRAINT fk_groups_courses_groups FOREIGN KEY (group_id) REFERENCES groups(id),
    CONSTRAINT fk_groups_courses_courses FOREIGN KEY (course_id) REFERENCES courses(id),
    PRIMARY KEY (group_id, course_id)
);

CREATE TABLE groups_teachers (
    group_id INT NOT NULL,
    teacher_user_id INT NOT NULL,
    CONSTRAINT fk_groups_teachers_groups FOREIGN KEY (group_id) REFERENCES groups(id),
    CONSTRAINT fk_groups_teachers_teachers FOREIGN KEY (teacher_user_id) REFERENCES users(id),
    PRIMARY KEY(group_id, teacher_user_id)
);

CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_number INT NOT NULL,
    course_id INTEGER NOT NULL,
    CONSTRAINT fk_lessons_courses FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    source_url VARCHAR(255) NOT NULL,
    lesson_id INTEGER NOT NULL,
    CONSTRAINT fk_materials_lessons FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

CREATE TABLE homeworks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    source_url VARCHAR(255) NOT NULL,
    lesson_id INTEGER UNIQUE NOT NULL,
    CONSTRAINT fk_homeworks_lessons FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    status task_status,
    task_type task_type,
    grade INTEGER,
    CONSTRAINT fk_tasks_lessons FOREIGN KEY (lesson_id) REFERENCES lessons(id),
    CONSTRAINT fk_tasks_students FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE tests (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    max_scores INTEGER NOT NULL,
    teacher_id INTEGER NOT NULL,
    CONSTRAINT fk_tests_teacher FOREIGN KEY (teacher_id) REFERENCES users(id)
);

CREATE TABLE tests_lessons (
    lesson_id INTEGER NOT NULL,
    test_id INTEGER NOT NULL,
    CONSTRAINT fk_tests_lessons_lessons FOREIGN KEY (lesson_id) REFERENCES lessons(id),
    CONSTRAINT fk_tests_lessons_tests FOREIGN KEY (test_id) REFERENCES tests(id),
    PRIMARY KEY (lesson_id, test_id)
);

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    test_id INTEGER NOT NULL,
    question_type question_type NOT NULL,
    img_url VARCHAR(255),
    CONSTRAINT fk_questions_tests FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);

CREATE TABLE answer_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    CONSTRAINT fk_multiple_choice_options_questions FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE test_results (
    id SERIAL PRIMARY KEY,
    test_id INTEGER,
    task_id INTEGER,
    scores REAL,
    status test_result_status NOT NULL,
    total_questions INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    answers TEXT,    
    CONSTRAINT fk_test_id FOREIGN KEY (test_id) REFERENCES tests(id),
    CONSTRAINT fk_task_id FOREIGN KEY (task_id) REFERENCES tasks(id)
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    initiator_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    source INTEGER NOT NULL,
    source_type source_type,
    notify_type notify_type,
    status notify_status,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_initiator FOREIGN KEY (initiator_id) REFERENCES users(id),
    CONSTRAINT fk_notifications_recipient FOREIGN KEY (recipient_id) REFERENCES users(id)
);

CREATE TABLE homework_result (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL,
    homework_url VARCHAR(255) NOT NULL,
    CONSTRAINT fk_task_id FOREIGN KEY (task_id) REFERENCES tasks(id)
);