import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { Goose } from '../components/Goose';
import { Timer } from '../components/Timer';
import { useAuth } from '../hooks/useAuth';
import { roundsAPI } from '../api/endpoints';
import type { RoundResponse, TapResponse, RoundStats } from '../types';

export const RoundPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isTapping, setIsTapping] = useState(false);
  const [localStats, setLocalStats] = useState<RoundStats>({
    taps: 0,
    score: 0,
  });
  const [lastTapResult, setLastTapResult] = useState<TapResponse | null>(null);

  const {
    data: roundData,
    error,
    mutate,
  } = useSWR<RoundResponse>(id ? `/rounds/${id}` : null, () =>
    roundsAPI.getById(id!),
  );

  useEffect(() => {
    if (roundData?.myStats) {
      setLocalStats(roundData.myStats);
    }
  }, [roundData]);

  const getRoundState = () => {
    if (!roundData) return 'loading';

    const now = new Date();
    const startTime = new Date(roundData.round.startTime);
    const endTime = new Date(roundData.round.endTime);

    if (now < startTime) return 'cooldown';
    if (now >= startTime && now <= endTime) return 'active';
    return 'completed';
  };

  const roundState = getRoundState();

  useEffect(() => {
    if (!id || roundState === 'completed') return;

    const interval = setInterval(() => {
      mutate();
    }, 5000);

    return () => clearInterval(interval);
  }, [id, roundState, mutate]);

  const handleGooseClick = async () => {
    if (!id || roundState !== 'active' || isTapping) return;

    setIsTapping(true);
    try {
      const result: TapResponse = await roundsAPI.tap(id);

      setLastTapResult(result);

      setLocalStats({
        taps: result.taps,
        score: result.score,
      });

      mutate({
        ...roundData!,
        myStats: {
          taps: result.taps,
          score: result.score,
        },
        round: {
          ...roundData!.round,
          totalScore:
            roundData!.round.totalScore + (result.score - localStats.score),
        },
      });

      setTimeout(() => {
        setLastTapResult(null);
      }, 300);
    } catch (error) {
      console.error('Ошибка тапа:', error);
    } finally {
      setIsTapping(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU');
  };

  if (!user) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Раунд не найден</h2>
        <button onClick={() => navigate('/rounds')}>
          Вернуться к списку раундов
        </button>
      </div>
    );
  }

  if (!roundData) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>Загрузка...</div>
    );
  }

  const getTitle = () => {
    switch (roundState) {
      case 'active':
        return 'Раунд активен!';
      case 'cooldown':
        return 'Cooldown';
      case 'completed':
        return 'Раунд завершен';
      default:
        return 'Раунд';
    }
  };

  const getWinner = () => {
    if (!roundData.topStats.length) return null;

    const sortedStats = [...roundData.topStats].sort(
      (a, b) => b.score - a.score,
    );
    return sortedStats[0];
  };

  const winner = getWinner();

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <h1>{getTitle()}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Имя игрока: {user.username}</span>
          <button
            onClick={() => navigate('/rounds')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            К раундам
          </button>
          <button
            onClick={logout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Выйти
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <strong>Round ID: {roundData.round.id}</strong>
        <div>Start: {formatDate(roundData.round.startTime)}</div>
        <div>End: {formatDate(roundData.round.endTime)}</div>
      </div>

      <div
        style={{
          position: 'relative',
          marginBottom: '16px',
        }}
      >
        <Goose onClick={handleGooseClick} disabled={roundState !== 'active'} />

        {lastTapResult && (
          <div
            style={{
              position: 'absolute',
              top: '30%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '24px',
              color: '#ffcc00',
              fontWeight: 'bold',
              animation: 'pulse 0.3s forwards',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              zIndex: 10,
            }}
          >
            +{lastTapResult.score - (localStats.score - lastTapResult.taps)}
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -100%) scale(1.5); opacity: 0; }
          }
        `}
      </style>

      <div
        style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '18px',
        }}
      >
        {roundState === 'active' && (
          <>
            <div style={{ marginBottom: '8px' }}>Раунд активен!</div>
            <div style={{ marginBottom: '8px' }}>
              До конца осталось: <Timer targetDate={roundData.round.endTime} />
            </div>
            <div style={{ marginBottom: '8px' }}>
              Мои очки - {localStats.score}
            </div>
          </>
        )}

        {roundState === 'cooldown' && (
          <>
            <div style={{ marginBottom: '8px' }}>Cooldown</div>
            <div>
              до начала раунда <Timer targetDate={roundData.round.startTime} />
            </div>
          </>
        )}

        {roundState === 'completed' && (
          <div style={{ marginTop: '24px' }}>
            <hr style={{ margin: '16px 0' }} />
            <div style={{ textAlign: 'left' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '16px',
                }}
              >
                <span>Всего очков в раунде</span>
                <strong>{roundData.round.totalScore.toLocaleString()}</strong>
              </div>

              {winner && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    fontSize: '16px',
                    color: '#d4af37',
                  }}
                >
                  <span>Победитель - {winner.user.username}</span>
                  <strong>{winner.score.toLocaleString()}</strong>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '16px',
                }}
              >
                <span>Мои очки</span>
                <strong>{localStats.score.toLocaleString()}</strong>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  color: '#666',
                }}
              >
                <span>Мои тапы</span>
                <span>{localStats.taps}</span>
              </div>
            </div>

            {roundData.topStats.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h3>Топ игроков:</h3>
                <div
                  style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '8px',
                  }}
                >
                  {roundData.topStats
                    .sort((a, b) => b.score - a.score)
                    .map((stat, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '8px',
                          backgroundColor:
                            index % 2 === 0 ? '#f8f9fa' : 'white',
                          borderBottom: '1px solid #eee',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <span
                            style={{
                              width: '20px',
                              textAlign: 'center',
                              fontWeight: 'bold',
                              color:
                                index === 0
                                  ? '#d4af37'
                                  : index === 1
                                    ? '#c0c0c0'
                                    : index === 2
                                      ? '#cd7f32'
                                      : '#666',
                            }}
                          >
                            #{index + 1}
                          </span>
                          <span>{stat.user.username}</span>
                          {stat.user.username === user.username && (
                            <span
                              style={{
                                fontSize: '12px',
                                color: '#007bff',
                                backgroundColor: '#e7f3ff',
                                padding: '2px 6px',
                                borderRadius: '10px',
                              }}
                            >
                              Вы
                            </span>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 'bold' }}>
                            {stat.score.toLocaleString()}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {stat.taps} тап{stat.taps !== 1 ? 'ов' : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {roundState === 'active' && (
        <div
          style={{
            marginTop: '24px',
            padding: '12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '16px',
            }}
          >
            <span>Текущий счёт:</span>
            <strong>{localStats.score.toLocaleString()}</strong>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '14px',
            }}
          >
            <span>Тапов в этом раунде:</span>
            <strong>{localStats.taps}</strong>
          </div>

          {localStats.taps > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '14px',
              }}
            >
              <span>Средний счёт за тап:</span>
              <strong>{(localStats.score / localStats.taps).toFixed(2)}</strong>
            </div>
          )}

          <div style={{ marginTop: '16px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#666',
                marginBottom: '4px',
              }}
            >
              <span>Прогресс раунда:</span>
              <span>
                {(() => {
                  const start = new Date(roundData.round.startTime).getTime();
                  const end = new Date(roundData.round.endTime).getTime();
                  const now = new Date().getTime();
                  const progress = Math.min(
                    100,
                    Math.max(0, ((now - start) / (end - start)) * 100),
                  );
                  return `${progress.toFixed(1)}%`;
                })()}
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '6px',
                backgroundColor: '#e9ecef',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(() => {
                    const start = new Date(roundData.round.startTime).getTime();
                    const end = new Date(roundData.round.endTime).getTime();
                    const now = new Date().getTime();
                    return Math.min(
                      100,
                      Math.max(0, ((now - start) / (end - start)) * 100),
                    );
                  })()}%`,
                  height: '100%',
                  backgroundColor: '#28a745',
                  transition: 'width 1s linear',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
