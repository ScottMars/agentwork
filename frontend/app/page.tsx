'use client';

import { useEffect, useState } from 'react';
import { Entity, Environment, GuardianTrait, GuardianMood } from '@/types';
import { EntityDisplay } from '@/components/EntityDisplay';
import { EnvironmentDisplay } from '@/components/EnvironmentDisplay';
import { GuardianTraitDisplay } from '@/components/GuardianTraitDisplay';
import { ChatInterface } from '@/components/chat-interface';
import { CodexDisplay } from '../components/CodexDisplay';

export default function Home() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [traits, setTraits] = useState<GuardianTrait[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guardianMood, setGuardianMood] = useState<GuardianMood>("analytical");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [entitiesRes, environmentsRes, traitsRes] = await Promise.all([
          fetch('http://localhost:3001/api/entities'),
          fetch('http://localhost:3001/api/environments'),
          fetch('http://localhost:3001/api/guardian-traits'),
        ]);

        if (!entitiesRes.ok || !environmentsRes.ok || !traitsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [entitiesData, environmentsData, traitsData] = await Promise.all([
          entitiesRes.json(),
          environmentsRes.json(),
          traitsRes.json(),
        ]);

        setEntities(entitiesData);
        setEnvironments(environmentsData);
        setTraits(traitsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-[#7fdbff]">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a1a1f] text-[#c4f5ff] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-[#7fdbff]">
          Luminous Realm Interface
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#7fdbff]">Entities</h2>
            <div className="space-y-4">
              {entities.map((entity) => (
                <EntityDisplay key={entity.id} entity={entity} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#7fdbff]">Environments</h2>
            <div className="space-y-4">
              {environments.map((env) => (
                <EnvironmentDisplay key={env.id} environment={env} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-[#7fdbff]">Guardian Traits</h2>
            <div className="space-y-4">
              {traits.map((trait) => (
                <GuardianTraitDisplay key={trait.id} trait={trait} />
              ))}
            </div>
          </section>
        </div>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-[#7fdbff]">Ethereal Codex</h2>
          <CodexDisplay />
        </section>

        <ChatInterface guardianMood={guardianMood} onMoodChange={setGuardianMood} />
      </div>
    </main>
  );
} 