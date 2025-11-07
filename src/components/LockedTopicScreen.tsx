import React from 'react';
import { Topic } from '../topics';
import './LockedTopicScreen.css';

interface LockedTopicScreenProps {
  topic: Topic;
  completedTopics: Set<string>;
  onTopicSelect: (topic: Topic) => void;
}

const LockedTopicScreen: React.FC<LockedTopicScreenProps> = ({
  topic,
  completedTopics,
  onTopicSelect
}) => {
  // Get all required topics (dependencies) for this topic
  const getRequiredTopics = (): Topic[] => {
    let requiredTopics: Topic[] = [];
    const visited = new Set<string>();
    
    const collectDependencies = (currentTopic: Topic) => {
      for (const dep of currentTopic.dependencies) {
        if (!visited.has(dep.id)) {
          visited.add(dep.id);
          requiredTopics.push(dep);
          collectDependencies(dep);
        }
      }
    };
    
    collectDependencies(topic);
    return requiredTopics;
  };

  const requiredTopics = getRequiredTopics();
  const completedRequired = requiredTopics.filter(topic => completedTopics.has(topic.id));
  const remainingRequired = requiredTopics.filter(topic => !completedTopics.has(topic.id));

  return (
    <div className="locked-topic-screen">
      <div className="locked-topic-content">
        <div className="locked-topic-header">
          <h2>🔒 {topic.name}</h2>
          <p className="locked-topic-description">
            This topic is locked. Complete the required topics below to unlock it.
          </p>
        </div>

        <div className="requirements-section">
          <h3>Requirements to Unlock</h3>

          <div className="progress-summary">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${requiredTopics.length > 0 ? (completedRequired.length / requiredTopics.length) * 100 : 100}%` 
                }}
              ></div>
            </div>
            <p className="progress-text">
              {completedRequired.length} of {requiredTopics.length} requirements completed
            </p>
          </div>

          {requiredTopics.length === 0 ? (
            <div className="no-requirements">
              <p>No specific requirements found. This topic should be accessible.</p>
            </div>
          ) : (
            <div className="requirements-list">
              {remainingRequired.length > 0 && (
                <div className="remaining-requirements">
                  <h4>⏳ Remaining Requirements</h4>
                  <div className="topic-list">
                    {remainingRequired.map(topic => {
                      const isAccessible = topic.isAccessible(completedTopics);
                      return (
                        <div 
                          key={topic.id} 
                          className={`topic-item ${isAccessible ? 'accessible' : 'locked'}`}
                          onClick={() => isAccessible && onTopicSelect(topic)}
                        >
                          <span className="topic-name">{topic.name}</span>
                          <span className={`status-badge ${isAccessible ? 'available' : 'locked'}`}>
                            {isAccessible ? '→' : '🔒'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {completedRequired.length > 0 && (
                <div className="completed-requirements">
                  <h4>✅ Completed Requirements</h4>
                  <div className="topic-list">
                    {completedRequired.map(topic => (
                      <div key={topic.id} className="topic-item completed">
                        <span className="topic-name">{topic.name}</span>
                        <span className="status-badge completed">✓</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LockedTopicScreen;
