import { useEffect, useMemo, useState } from 'react';
import { reportsService, type ClassOverview, type StudentReport } from '../services/reports';
import './InstructorDashboard.css';

type DifficultyLevel = 'very-hard' | 'hard' | 'medium' | 'easy';

const describeDifficulty = (accuracy: number): { level: DifficultyLevel; label: string } => {
  if (accuracy >= 80) return { level: 'easy', label: 'Easy' };
  if (accuracy >= 60) return { level: 'medium', label: 'Moderate' };
  if (accuracy >= 40) return { level: 'hard', label: 'Challenging' };
  return { level: 'very-hard', label: 'Critical' };
};

const createDownload = (data: unknown, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

export default function InstructorDashboard() {
  const [classOverview, setClassOverview] = useState<ClassOverview | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadClassOverview();
  }, []);

  const loadClassOverview = async () => {
    try {
      const data = await reportsService.getClassOverview();
      setClassOverview(data);
    } catch (error) {
      console.error('Failed to load class overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewStudentReport = async (studentId: number) => {
    try {
      const report = await reportsService.getStudentReport(studentId);
      setSelectedStudent(report);
    } catch (error) {
      console.error('Failed to load student report:', error);
    }
  };

  const handleExport = () => {
    if (!classOverview) {
      return;
    }
    createDownload(classOverview, 'class-overview.json');
  };

  const recentActivity = classOverview?.recent_activity ?? [];
  const maxQuestionsInActivity =
    recentActivity.length > 0
      ? Math.max(...recentActivity.map((day) => day.questions_answered))
      : 0;

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredTopPerformers = useMemo(() => {
    if (!classOverview) return [];
    if (!normalizedSearch) return classOverview.top_performers;
    return classOverview.top_performers.filter((student) =>
      student.student_name.toLowerCase().includes(normalizedSearch),
    );
  }, [classOverview, normalizedSearch]);

  const filteredStrugglers = useMemo(() => {
    if (!classOverview) return [];
    if (!normalizedSearch) return classOverview.struggling_students;
    return classOverview.struggling_students.filter((student) =>
      student.student_name.toLowerCase().includes(normalizedSearch),
    );
  }, [classOverview, normalizedSearch]);

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard…</div>;
  }

  if (selectedStudent) {
    const topicsCompleted = selectedStudent.topic_breakdown.filter(
      (topic) => topic.completion_percentage >= 100,
    ).length;
    const topicsStarted = selectedStudent.topic_breakdown.length;

    return (
      <div className="instructor-dashboard">
        <button onClick={() => setSelectedStudent(null)} className="back-button">
          Back to Class Overview
        </button>

        <div className="student-detail-header">
          <div>
            <h1>{selectedStudent.student_name}</h1>
            <p className="student-email">{selectedStudent.student_email}</p>
          </div>
          <div className="student-detail-badge">
            {selectedStudent.overall_stats.overall_accuracy >= 80
              ? 'Performance: Excellent'
              : selectedStudent.overall_stats.overall_accuracy >= 60
                ? 'Performance: On Track'
                : 'Performance: Needs Support'}
          </div>
        </div>

        <div className="stats-grid stats-grid--compact">
          <div className="stat-card">
            <div>
              <h3>Questions</h3>
              <p className="stat-value">
                {selectedStudent.overall_stats.total_questions_answered}
              </p>
              <p className="stat-detail">
                {selectedStudent.overall_stats.total_correct} correct ·{' '}
                {selectedStudent.overall_stats.total_incorrect} incorrect ·{' '}
                {selectedStudent.overall_stats.total_skipped} skipped
              </p>
            </div>
          </div>
          <div className="stat-card stat-card--accent">
            <div>
              <h3>Accuracy</h3>
              <p className="stat-value">
                {selectedStudent.overall_stats.overall_accuracy.toFixed(1)}%
              </p>
              <p className="stat-detail">Average across all topics</p>
            </div>
          </div>
          <div className="stat-card">
            <div>
              <h3>Average Time</h3>
              <p className="stat-value">
                {selectedStudent.overall_stats.avg_time_per_question.toFixed(0)}s
              </p>
              <p className="stat-detail">Per question</p>
            </div>
          </div>
          <div className="stat-card stat-card--success">
            <div>
              <h3>Topic Progress</h3>
              <p className="stat-value">
                {topicsCompleted}/{topicsStarted}
              </p>
              <p className="stat-detail">Topics completed</p>
            </div>
          </div>
        </div>

        <section className="dashboard-section">
          <h2>Topic Performance</h2>
          <div className="topics-grid">
            {selectedStudent.topic_breakdown.map((topic) => (
              <div key={topic.topic} className="topic-detail-card">
                <div className="topic-detail-card__header">
                  <h3>{topic.topic_name}</h3>
                  <span className="completion-badge">
                    {topic.completion_percentage.toFixed(0)}%
                  </span>
                </div>

                <div className="topic-metrics-row">
                  <div className="mini-metric">
                    <span>Accuracy</span>
                    <strong>{topic.accuracy.toFixed(0)}%</strong>
                  </div>
                  <div className="mini-metric">
                    <span>Questions</span>
                    <strong>{topic.questions_answered}</strong>
                  </div>
                  <div className="mini-metric">
                    <span>Avg Time</span>
                    <strong>{topic.avg_time.toFixed(0)}s</strong>
                  </div>
                </div>

                <div className="progress-bar-detailed">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min(topic.completion_percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {selectedStudent.struggling_subtopics &&
          selectedStudent.struggling_subtopics.length > 0 && (
            <section className="dashboard-section">
              <h2>Areas for Improvement</h2>
              <div className="struggling-topics">
                {selectedStudent.struggling_subtopics.map((subtopic, index) => (
                  <div key={`${subtopic.topic}-${subtopic.subtopic_type}-${index}`} className="struggling-card">
                    <h4>
                      {subtopic.topic} · {subtopic.subtopic_type}
                    </h4>
                    <div className="struggling-stats">
                      <span>{subtopic.attempts} attempts</span>
                      <span className="accuracy-low">
                        {subtopic.accuracy.toFixed(0)}% accuracy
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
      </div>
    );
  }

  return (
    <div className="instructor-dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header__content">
          <h1>Class Analytics</h1>
          <p className="dashboard-subtitle">
            Comprehensive overview of student progress and performance
          </p>
        </div>
        <div className="dashboard-header__actions">
          <button className="btn-secondary" onClick={handleExport}>
            Export Data
          </button>
        </div>
      </header>

      <section className="dashboard-overview">
        <div className="overview-stats">
          <div className="stat-card stat-card--large">
            <div className="stat-card__content">
              <p className="stat-card__label">Total Students</p>
              <p className="stat-card__value">{classOverview?.total_students ?? 0}</p>
              <p className="stat-card__detail">
                {classOverview?.active_students_last_week ?? 0} active this week
              </p>
            </div>
          </div>

          <div className="stat-card stat-card--large stat-card--accent">
            <div className="stat-card__content">
              <p className="stat-card__label">Class Average</p>
              <p className="stat-card__value">
                {(classOverview?.class_avg_accuracy ?? 0).toFixed(1)}%
              </p>
              <p className="stat-card__detail">
                {classOverview?.total_questions_answered ?? 0} questions answered
              </p>
            </div>
          </div>

          <div className="stat-card stat-card--large stat-card--success">
            <div className="stat-card__content">
              <p className="stat-card__label">Top Performer</p>
              <p className="stat-card__value">
                {classOverview?.top_performers[0]?.accuracy.toFixed(1) ?? '0.0'}%
              </p>
              <p className="stat-card__detail">
                {classOverview?.top_performers[0]?.student_name ?? 'No data'}
              </p>
            </div>
          </div>
        </div>

        {recentActivity.length > 0 && (
          <div className="activity-chart">
            <h3>Recent Activity (Last 7 Days)</h3>
            <div className="chart-container">
              {recentActivity.map((day) => {
                const height =
                  maxQuestionsInActivity > 0
                    ? Math.max((day.questions_answered / maxQuestionsInActivity) * 100, 5)
                    : 5;
                return (
                  <div key={day.date} className="chart-bar">
                    <div
                      className="chart-bar__fill"
                      style={{ height: `${height}%` }}
                      title={`${day.questions_answered} questions · ${day.active_students} students`}
                    />
                    <div className="chart-bar__label">
                      {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                    </div>
                    <div className="chart-bar__value">{day.questions_answered}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Topics Performance</h2>
        <div className="topics-performance-grid">
          {classOverview?.topics_overview
            .slice()
            .sort((a, b) => a.avg_accuracy - b.avg_accuracy)
            .map((topic) => {
              const difficulty = describeDifficulty(topic.avg_accuracy);
              const completionRate =
                topic.students_started > 0
                  ? (topic.students_completed / topic.students_started) * 100
                  : 0;
              return (
                <div
                  key={topic.topic}
                  className={`topic-card topic-card--${difficulty.level}`}
                >
                  <div className="topic-card__header">
                    <h3>{topic.topic_name}</h3>
                    <span className={`difficulty-badge difficulty-badge--${difficulty.level}`}>
                      {difficulty.label}
                    </span>
                  </div>
                  <div className="topic-card__metrics">
                    <div className="metric">
                      <span className="metric__label">Accuracy</span>
                      <span className="metric__value">{topic.avg_accuracy.toFixed(0)}%</span>
                    </div>
                    <div className="metric">
                      <span className="metric__label">Completion</span>
                      <span className="metric__value">{completionRate.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="topic-card__stats">
                    <span>{topic.students_started} started</span>
                    <span>·</span>
                    <span>{topic.students_completed} completed</span>
                  </div>
                  <div className="topic-card__progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(topic.avg_accuracy, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <h2>Student Performance</h2>
          <input
            type="search"
            placeholder="Search students…"
            className="search-input"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="performance-categories">
          <div className="performance-category">
            <h3>Top Performers</h3>
            <div className="students-table">
              {filteredTopPerformers.length === 0 ? (
                <div className="students-table__empty">No matches found.</div>
              ) : (
                filteredTopPerformers.map((student, index) => (
                  <div
                    key={student.student_id}
                    className="student-row student-row--excellent"
                    onClick={() => viewStudentReport(student.student_id)}
                  >
                    <div className="student-row__rank">#{index + 1}</div>
                    <div className="student-row__info">
                      <h4>{student.student_name}</h4>
                      <p>{student.questions_answered} questions answered</p>
                    </div>
                    <div className="student-row__metrics">
                      <div className="metric-pill metric-pill--success">
                        {student.accuracy.toFixed(1)}% accuracy
                      </div>
                    </div>
                    <div className="student-row__action">View</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="performance-category">
            <h3>Needs Attention</h3>
            <div className="students-table">
              {filteredStrugglers.length === 0 ? (
                <div className="students-table__empty">No matches found.</div>
              ) : (
                filteredStrugglers.map((student) => (
                  <div
                    key={student.student_id}
                    className="student-row student-row--warning"
                    onClick={() => viewStudentReport(student.student_id)}
                  >
                    <div className="student-row__rank">!</div>
                    <div className="student-row__info">
                      <h4>{student.student_name}</h4>
                      <p>{student.questions_answered} questions answered</p>
                    </div>
                    <div className="student-row__metrics">
                      <div className="metric-pill metric-pill--warning">
                        {student.accuracy.toFixed(1)}% accuracy
                      </div>
                    </div>
                    <div className="student-row__action">Review</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

