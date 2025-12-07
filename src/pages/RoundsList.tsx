import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import { RoundCard } from '../components/RoundCard';
import { useAuth } from '../hooks/useAuth';
import { roundsAPI } from '../api/endpoints';
import { transformRoundList } from '../utils/transformRounds';
import type { RoundForList } from '../types';

interface PaginationState {
  limit: number;
  nextCursor: string | null;
  hasMore: boolean;
}

const ITEMS_PER_PAGE = 5;

export const RoundsList: React.FC = () => {
  const { user, logout } = useAuth();
  const [rounds, setRounds] = useState<RoundForList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    limit: ITEMS_PER_PAGE,
    nextCursor: null,
    hasMore: false,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [cursors, setCursors] = useState<Array<string | null>>([null]);
  const [creatingRound, setCreatingRound] = useState(false);

  // Загрузка данных для текущей страницы
  const loadPageData = async (cursor: string | null) => {
    try {
      setLoading(true);
      setError(null);

      const response = await roundsAPI.getAll(
        cursor || undefined,
        ITEMS_PER_PAGE,
      );

      const transformedRounds = transformRoundList(response.data);
      setRounds(transformedRounds);

      setPagination({
        limit: response.pagination.limit,
        nextCursor: response.pagination.nextCursor,
        hasMore: response.pagination.hasMore,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка загрузки раундов');
      console.error('Ошибка загрузки раундов:', err);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка начальной страницы
  useEffect(() => {
    if (user) {
      loadPageData(null);
    }
  }, [user]);

  // Обработчик смены страницы
  const handlePageClick = (data: { selected: number }) => {
    const newPage = data.selected;
    setCurrentPage(newPage);

    // Если у нас уже есть курсор для этой страницы, используем его
    if (cursors[newPage] !== undefined) {
      loadPageData(cursors[newPage]);
    } else {
      // Если нет, используем курсор предыдущей страницы
      const cursor = pagination.nextCursor;
      setCursors((prev) => [...prev, cursor]);
      loadPageData(cursor);
    }
  };

  const handleCreateRound = async () => {
    if (user?.role !== 'ADMIN') return;

    try {
      setCreatingRound(true);
      const newRound = await roundsAPI.create();

      // Добавляем новый раунд в начало списка
      setRounds((prev) => [newRound, ...prev]);

      // Перенаправляем на страницу нового раунда
      window.location.href = `/round/${newRound.id}`;
    } catch (error) {
      console.error('Ошибка создания раунда:', error);
      setError('Не удалось создать раунд');
    } finally {
      setCreatingRound(false);
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>Загрузка...</div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <h1 style={{ margin: 0 }}>Список РАУНДОВ</h1>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontWeight: '500' }}>Имя игрока: {user.username}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={logout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Выйти
            </button>
          </div>
        </div>
      </div>

      {user.role === 'ADMIN' && (
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={handleCreateRound}
            disabled={creatingRound}
            style={{
              padding: '12px 24px',
              backgroundColor: creatingRound ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: creatingRound ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {creatingRound ? (
              <>
                <span
                  style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                Создание...
              </>
            ) : (
              'Создать раунд'
            )}
          </button>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      {loading && rounds.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6c757d',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          Загрузка раундов...
        </div>
      ) : (
        <>
          {rounds.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                color: '#6c757d',
              }}
            >
              <h3>Нет доступных раундов</h3>
              {user.role === 'ADMIN' && (
                <p>Создайте первый раунд, используя кнопку выше</p>
              )}
            </div>
          ) : (
            <div style={{ marginBottom: '24px' }}>
              {rounds.map((round) => (
                <RoundCard key={round.id} round={round} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Пагинация */}
      {(pagination.hasMore || currentPage > 0) && rounds.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '32px',
          }}
        >
          <ReactPaginate
            previousLabel={'← Назад'}
            nextLabel={'Вперед →'}
            breakLabel={'...'}
            pageCount={pagination.hasMore ? currentPage + 2 : currentPage + 1}
            marginPagesDisplayed={2}
            pageRangeDisplayed={3}
            onPageChange={handlePageClick}
            containerClassName={'pagination'}
            pageClassName={'page-item'}
            pageLinkClassName={'page-link'}
            previousClassName={'page-item'}
            previousLinkClassName={'page-link'}
            nextClassName={'page-item'}
            nextLinkClassName={'page-link'}
            breakClassName={'page-item'}
            breakLinkClassName={'page-link'}
            activeClassName={'active'}
            forcePage={currentPage}
            disabledClassName={'disabled'}
          />
        </div>
      )}

      {/* Стили для пагинации */}
      <style>
        {`
          .pagination {
            display: flex;
            list-style: none;
            padding: 0;
            margin: 0;
            gap: 4px;
            flex-wrap: wrap;
            justify-content: center;
          }

          .page-item {
            margin: 0;
          }

          .page-link {
            display: block;
            padding: 8px 12px;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            color: #007bff;
            text-decoration: none;
            background-color: white;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 14px;
          }

          .page-link:hover {
            background-color: #e9ecef;
            border-color: #dee2e6;
          }

          .active .page-link {
            background-color: #007bff;
            color: white;
            border-color: #007bff;
          }

          .disabled .page-link {
            color: #6c757d;
            pointer-events: none;
            cursor: not-allowed;
            background-color: #f8f9fa;
          }

          @media (max-width: 600px) {
            .pagination {
              gap: 2px;
            }

            .page-link {
              padding: 6px 8px;
              font-size: 12px;
            }
          }
        `}
      </style>

      {/* Информация о пагинации */}
      <div
        style={{
          marginTop: '16px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#6c757d',
        }}
      >
        {rounds.length > 0 && (
          <>
            <div>
              Показано: {rounds.length} раунд{rounds.length !== 1 ? 'ов' : ''}
            </div>
            {pagination.hasMore && <div>Есть еще раунды →</div>}
          </>
        )}
      </div>
    </div>
  );
};
