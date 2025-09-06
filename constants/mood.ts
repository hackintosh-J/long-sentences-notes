import type { Mood } from '../types';

export const MOODS_CONFIG: { [key in Mood]: { emoji: string; label: string; colors: string } } = {
    1: { emoji: '😞', label: '很糟糕', colors: 'bg-red-400' },
    2: { emoji: '😕', label: '不太好', colors: 'bg-orange-400' },
    3: { emoji: '😐', label: '一般般', colors: 'bg-yellow-400' },
    4: { emoji: '😊', label: '还不错', colors: 'bg-sky-400' },
    5: { emoji: '😄', label: '棒极了', colors: 'bg-green-400' },
};
