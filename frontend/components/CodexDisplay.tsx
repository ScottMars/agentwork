'use client';

import { useState, useEffect, useRef } from 'react';

interface CodexEntry {
    id: string;
    cycle: number;
    content: string;
    created_at: string;
}

export function CodexDisplay() {
    const [entries, setEntries] = useState<CodexEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [visibleEntries, setVisibleEntries] = useState<CodexEntry[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchEntries();
        // Обновляем записи каждые 10 секунд
        const interval = setInterval(fetchEntries, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (entries.length > 0) {
            // Показываем последние 3 записи
            setVisibleEntries(entries.slice(0, 3));
        }
    }, [entries]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const element = e.currentTarget;
        const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50; // 50px до конца
        
        if (isAtBottom && visibleEntries.length < entries.length) {
            const currentLength = visibleEntries.length;
            const newEntries = entries.slice(0, currentLength + 3);
            setVisibleEntries(newEntries);
        }
    };

    async function fetchEntries() {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/codex`);
            if (!response.ok) throw new Error('Failed to fetch codex entries');
            const data = await response.json();
            // Сортируем записи по убыванию номера цикла
            const sortedEntries = data.sort((a: CodexEntry, b: CodexEntry) => b.cycle - a.cycle);
            setEntries(sortedEntries);
        } catch (err) {
            console.error('Error fetching entries:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className="text-cyan-400">Loading codex entries...</div>;
    if (error) return <div className="text-red-400">{error}</div>;

    return (
        <div className="flex flex-col bg-[#0e2b36] border border-[#3a7c8c] rounded p-4" style={{ height: '300px' }}>
            <h3 className="text-lg font-bold text-[#c4f5ff] mb-2">Ethereal Codex</h3>
            <div 
                ref={containerRef}
                className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-[#3a7c8c] scrollbar-track-[#0e2b36]"
                onScroll={handleScroll}
            >
                {visibleEntries.length === 0 ? (
                    <div className="text-[#3a7c8c]">No entries found</div>
                ) : (
                    visibleEntries.map(entry => (
                        <div 
                            key={entry.id} 
                            className="bg-[#0f3a47] border-2 border-[#3a7c8c] p-3 rounded-lg transition-all duration-300 ease-in-out hover:bg-[#164e63] hover:border-[#4a8c9c] shadow-lg"
                        >
                            <p className="text-[#c4f5ff] font-mono text-base">{entry.content}</p>
                        </div>
                    ))
                )}
            </div>
            <div className="flex justify-end items-center mt-2 pt-2 border-t border-[#3a7c8c]">
                <span className="text-[#3a7c8c] text-sm">
                    {visibleEntries.length} of {entries.length} entries
                </span>
            </div>
        </div>
    );
} 