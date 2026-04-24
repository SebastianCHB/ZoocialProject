import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

interface StreakData {
    current_streak: number;
    max_streak: number;
    last_interaction_date: string;
}

export const useStreak = () => {
    const [streakData, setStreakData] = useState<StreakData>({
        current_streak: 0,
        max_streak: 0,
        last_interaction_date: '',
    });
    const [loading, setLoading] = useState(true);

    const fetchStreak = useCallback(async () => {
        try {
            const res = await api.get('/streak/me');
            setStreakData(res.data);
        } catch (error) {
            console.warn('Could not fetch streak data');
        } finally {
            setLoading(false);
        }
    }, []);

    const pingStreak = useCallback(async () => {
        try {
            const res = await api.post('/streak/ping');
            setStreakData(prev => ({
                ...prev,
                current_streak: res.data.current_streak,
                max_streak: res.data.max_streak,
                last_interaction_date: res.data.last_interaction_date,
            }));
        } catch (error) {
            console.warn('Could not ping streak');
        }
    }, []);

    useEffect(() => {
        fetchStreak();
    }, [fetchStreak]);

    return {
        currentStreak: streakData.current_streak,
        maxStreak: streakData.max_streak,
        lastInteractionDate: streakData.last_interaction_date,
        loading,
        pingStreak,
        refresh: fetchStreak,
    };
};
