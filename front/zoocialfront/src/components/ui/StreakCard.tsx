interface StreakCardProps {
    currentStreak: number;
    maxStreak: number;
    loading?: boolean;
}

const MILESTONES = [7, 14, 30, 60, 100];

function getNextMilestone(current: number): number {
    return MILESTONES.find(m => m > current) ?? MILESTONES[MILESTONES.length - 1];
}

function getMotivationalMessage(streak: number): string {
    if (streak === 0) return '¡Empieza hoy tu racha! 🐾';
    if (streak === 1) return '¡Gran comienzo! Vuelve mañana 🌱';
    if (streak < 7) return `¡Vas bien! ${7 - streak} días para tu primera racha`;
    if (streak < 14) return '¡Una semana en racha! Sigues creciendo 💪';
    if (streak < 30) return '¡Dos semanas! Eres un verdadero zoocialero 🐶';
    if (streak < 100) return '¡Increíble constancia! ¡Sigue así! 🔥';
    return '¡LEYENDA DE ZOOCIAL! 🏆';
}

export const StreakCard = ({ currentStreak, maxStreak, loading = false }: StreakCardProps) => {
    if (loading) {
        return (
            <div className="streak-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="spinner" />
                <span style={{ color: '#9a3412', fontSize: '0.875rem' }}>Cargando racha...</span>
            </div>
        );
    }

    const nextMilestone = getNextMilestone(currentStreak);
    const prevMilestone = MILESTONES.filter(m => m <= currentStreak).pop() ?? 0;
    const progress = nextMilestone === prevMilestone
        ? 100
        : Math.min(((currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100, 100);

    return (
        <div className="streak-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.875rem' }}>
                {/* Flame */}
                <div style={{ flexShrink: 0 }}>
                    <span className="streak-flame">🔥</span>
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                        <span style={{
                            fontSize: '2rem', fontWeight: 800,
                            color: '#c2410c', lineHeight: 1
                        }}>
                            {currentStreak}
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#9a3412', fontWeight: 600 }}>
                            {currentStreak === 1 ? 'día' : 'días'} en racha
                        </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#b45309', marginTop: '0.15rem', fontWeight: 500 }}>
                        Récord: {maxStreak} {maxStreak === 1 ? 'día' : 'días'}
                    </div>
                </div>

                {/* Milestone badge */}
                <div style={{
                    textAlign: 'center', flexShrink: 0,
                    backgroundColor: 'rgba(234, 88, 12, 0.12)',
                    borderRadius: '10px', padding: '0.35rem 0.6rem'
                }}>
                    <div style={{ fontSize: '0.95rem' }}>
                        {currentStreak >= 100 ? '🏆' : currentStreak >= 30 ? '⭐' : currentStreak >= 7 ? '✨' : '🌱'}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#9a3412', fontWeight: 700 }}>
                        {currentStreak >= 100 ? 'Leyenda' : currentStreak >= 30 ? 'Pro' : currentStreak >= 7 ? 'Activo' : 'Nuevo'}
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 600 }}>
                        {currentStreak}/{nextMilestone} días
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 600 }}>
                        Meta: {nextMilestone} días
                    </span>
                </div>
                <div className="streak-bar-container">
                    <div
                        className="streak-bar-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Motivational message */}
            <p style={{ fontSize: '0.78rem', color: '#92400e', fontWeight: 500, margin: 0 }}>
                {getMotivationalMessage(currentStreak)}
            </p>
        </div>
    );
};
