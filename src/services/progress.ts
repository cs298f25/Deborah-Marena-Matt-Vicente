import api from './api';

export interface TopicProgress {
  user_id: number;
  topic: string;
  topic_name: string;
  subtopics_completed: number;
  total_subtopics: number;
  completion_percentage: number;
  questions_answered: number;
  last_accessed: string | null;
}

export interface UpdateProgressRequest {
  subtopics_completed: number;
  total_subtopics: number;
}

export const progressService = {
  async getUserProgress(userId: number): Promise<TopicProgress[]> {
    const response = await api.get(`/api/progress/${userId}`);
    return response.data.progress;
  },

  async getTopicProgress(userId: number, topic: string): Promise<TopicProgress> {
    const response = await api.get(`/api/progress/${userId}/${topic}`);
    return response.data;
  },

  async updateProgress(
    userId: number,
    topic: string,
    data: UpdateProgressRequest,
  ): Promise<void> {
    await api.put(`/api/progress/${userId}/${topic}`, data);
  },

  async incrementProgress(userId: number, topic: string): Promise<void> {
    await api.post(`/api/progress/${userId}/${topic}/increment`);
  },
};

