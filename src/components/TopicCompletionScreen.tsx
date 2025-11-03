import React from 'react';
import { Topic } from '../topics';
import './TopicCompletionScreen.css';

interface TopicCompletionScreenProps {
  topic: Topic;
  onRestartTopic: () => void;
  onNextTopic: () => void;
  nextTopic: Topic | null;
}

const TopicCompletionScreen: React.FC<TopicCompletionScreenProps> = ({
  topic,
  onRestartTopic,
  onNextTopic,
  nextTopic
}) => {
  return (
    <div className="topic-completion-screen">
      <div className="completion-content">
        <div className="completion-icon">🎉</div>
        <h2>Congratulations!</h2>
        <p>You have completed <strong>{topic.name}</strong></p>
        
        <div className="completion-actions">
          <button 
            className="action-button restart-button"
            onClick={onRestartTopic}
          >🔄 Study Again</button>
          
          {nextTopic ? (
            <button 
              className="action-button next-button"
              onClick={onNextTopic}
            >➡️ Next Topic<br/>{nextTopic.name}</button>
          ) : (
            <button 
              className="action-button next-button"
              onClick={onNextTopic}
            >🏁 Finished (for now)</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicCompletionScreen;
