import React from 'react';
import { Link } from 'react-router-dom';
import type { RoundForList } from '../types';
import { Timer } from './Timer';
import styles from './RoundCard.module.css';

interface RoundCardProps {
  round: RoundForList;
}

export const RoundCard: React.FC<RoundCardProps> = ({ round }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU');
  };

  const getStatusText = (state: string) => {
    switch (state) {
      case 'active':
        return 'Активен';
      case 'cooldown':
        return 'Cooldown';
      case 'completed':
        return 'Завершен';
      default:
        return state;
    }
  };

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'active':
        return '#28a745';
      case 'cooldown':
        return '#fd7e14';
      case 'completed':
        return '#6c757d';
      default:
        return '#000';
    }
  };

  // Форматирование большого числа для totalScore
  const formatTotalScore = (score: number) => {
    if (score >= 1000000) {
      return `${(score / 1000000).toFixed(1)}M`;
    }
    if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}K`;
    }
    return score.toString();
  };

  return (
    <Link
      to={`/round/${round.id}`}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        marginBottom: '16px',
      }}
    >
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease',
        }}
        className={styles.container}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(round.round_state),
              marginRight: '10px',
              flexShrink: 0,
            }}
          />
          <div
            style={{
              fontWeight: 'bold',
              fontSize: '14px',
              color: '#495057',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            ID: {round.id.substring(0, 8)}...
          </div>
        </div>

        <div style={{ margin: '12px 0', fontSize: '14px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
            }}
          >
            <span style={{ color: '#6c757d' }}>Начало:</span>
            <span style={{ fontWeight: '500', textAlign: 'right' }}>
              {formatDate(round.startTime)}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
            }}
          >
            <span style={{ color: '#6c757d' }}>Конец:</span>
            <span style={{ fontWeight: '500', textAlign: 'right' }}>
              {formatDate(round.endTime)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6c757d' }}>Всего очков:</span>
            <span style={{ fontWeight: 'bold', color: '#007bff' }}>
              {formatTotalScore(round.totalScore)}
            </span>
          </div>
        </div>

        <hr
          style={{
            margin: '16px 0',
            border: 'none',
            borderTop: '1px solid #e9ecef',
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontWeight: 'bold',
              color: getStatusColor(round.round_state),
              fontSize: '14px',
            }}
          >
            {getStatusText(round.round_state)}
          </div>

          {round.round_state === 'active' && (
            <div
              style={{ fontSize: '13px', color: '#28a745', fontWeight: '500' }}
            >
              <Timer targetDate={round.endTime} />
            </div>
          )}

          {round.round_state === 'cooldown' && (
            <div
              style={{ fontSize: '13px', color: '#fd7e14', fontWeight: '500' }}
            >
              <Timer targetDate={round.startTime} />
            </div>
          )}

          {round.round_state === 'completed' && (
            <div style={{ fontSize: '13px', color: '#6c757d' }}>Завершен</div>
          )}
        </div>
      </div>
    </Link>
  );
};
