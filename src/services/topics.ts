import api from './api';

export interface TopicMetadata {
  id: string;
  name: string;
  is_visible: boolean;
  order_index: number | null;
}

export const topicsService = {
  async getTopics(role: 'student' | 'instructor' = 'student'): Promise<TopicMetadata[]> {
    const response = await api.get(`topics?role=${role}`);
    return response.data.topics;
  },

  async getTopic(topicId: string): Promise<TopicMetadata> {
    const response = await api.get(`topics/${topicId}`);
    return response.data;
  },

  async updateVisibility(topicId: string, isVisible: boolean): Promise<void> {
    await api.patch(`topics/${topicId}/visibility`, { is_visible: isVisible });
  },
};
