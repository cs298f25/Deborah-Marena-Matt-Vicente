import api from './api';

export interface StudentReport {
  student_id: number;
  student_name: string;
  student_email: string;
  overall_stats: {
    total_questions_answered: number;
    total_correct: number;
    total_incorrect: number;
    total_skipped: number;
    overall_accuracy: number;
    avg_time_per_question: number;
  };
  topic_breakdown: Array<{
    topic: string;
    topic_name: string;
    questions_answered: number;
    correct: number;
    incorrect: number;
    accuracy: number;
    avg_time: number;
    completion_percentage: number;
  }>;
  struggling_subtopics?: Array<{
    topic: string;
    subtopic_type: string;
    attempts: number;
    accuracy: number;
  }>;
}

export interface ClassOverview {
  total_students: number;
  active_students_last_week: number;
  total_questions_answered: number;
  class_avg_accuracy: number;
  topics_overview: Array<{
    topic: string;
    topic_name: string;
    students_started: number;
    students_completed: number;
    avg_accuracy: number;
  }>;
  top_performers: Array<{
    student_id: number;
    student_name: string;
    questions_answered: number;
    accuracy: number;
  }>;
  struggling_students: Array<{
    student_id: number;
    student_name: string;
    questions_answered: number;
    accuracy: number;
  }>;
  recent_activity?: Array<{
    date: string;
    questions_answered: number;
    active_students: number;
  }>;
}

export const reportsService = {
  async getStudentReport(studentId: number): Promise<StudentReport> {
    const response = await api.get(`reports/student/${studentId}`);
    return response.data;
  },

  async getClassOverview(): Promise<ClassOverview> {
    const response = await api.get('reports/class/overview');
    return response.data;
  },

  async getTopicReport(topicId: string): Promise<unknown> {
    const response = await api.get(`reports/topic/${topicId}`);
    return response.data;
  },
};
