import type { RoundListItem, RoundForList } from '../types';

export const transformRoundList = (rounds: RoundListItem[]): RoundForList[] => {
  const now = new Date();

  return rounds.map((round) => {
    const startTime = new Date(round.startTime);
    const endTime = new Date(round.endTime);

    let round_state: 'active' | 'cooldown' | 'completed';

    if (now < startTime) {
      round_state = 'cooldown';
    } else if (now >= startTime && now <= endTime) {
      round_state = 'active';
    } else {
      round_state = 'completed';
    }

    return {
      ...round,
      round_state,
    };
  });
};
