'use client';

import { useActionState, useState } from 'react';
import {
  createTopic,
  deleteTopic,
  type TopicActionState,
} from '@/app/actions/topics';
import { topicSchema } from '@/lib/validation/topic';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

type TopicsManagementProps = {
  topics: Topic[];
};

type Topic = {
  id: number;
  name: string;
  _count: {
    projects: number;
  };
};

const initialState: TopicActionState = {};

export function TopicsManagement({ topics }: TopicsManagementProps) {
  const [state, formAction, pending] = useActionState(createTopic, initialState);
  const [clientError, setClientError] = useState<string>();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const result = topicSchema.safeParse({
      name: formData.get('name'),
    });

    if (!result.success) {
      event.preventDefault();
      setClientError(result.error.issues[0].message);
      return;
    }

    setClientError(undefined);
  }

  return (
    <Card className="border-border flex w-full max-w-190 flex-col gap-4 rounded-[14px] border bg-white p-6 ring-0">
      <CardHeader className="px-0">
        <CardTitle className="font-sans text-base leading-6 font-semibold tracking-normal">
          Temáticas de proyectos
        </CardTitle>
      </CardHeader>
      <div className="flex w-full max-w-178 flex-col gap-1.5">
        <form
          action={formAction}
          onSubmit={handleSubmit}
          noValidate
          className="flex w-full items-center gap-2"
        >
          <Input
            name="name"
            defaultValue={state.values?.name}
            placeholder="Nueva temática..."
            required
            maxLength={100}
            className="border-border placeholder:text-muted-foreground h-9 min-w-0 flex-1 rounded-md border bg-white px-3 py-1 font-sans text-base leading-6 font-normal tracking-normal shadow-[0_1px_2px_0_rgb(0_0_0/0.1)]"
          />
          <Button type="submit" disabled={pending} className="h-9 rounded-lg px-4 py-2 shadow">
            Agregar
          </Button>
        </form>

        {(clientError ?? state.errors?.name?.[0]) && (
          <p className="text-destructive text-xs">
            {clientError ?? state.errors?.name?.[0]}
          </p>
        )}

        {state.formError && <p className="text-destructive text-xs">{state.formError}</p>}
      </div>
      <Separator className="w-full max-w-178 bg-[#EFF2F4]" />
      <p className="font-sans text-xs leading-4 font-normal tracking-normal text-[#a1a1aa]">
        {topics.length} temáticas
      </p>
      <ul className="w-full">
        {topics.map((topic) => (
          <TopicRow key={topic.id} topic={topic} />
        ))}
      </ul>
    </Card>
  );
}

function TopicRow({ topic }: { topic: Topic }) {
  const [state, formAction, pending] = useActionState(
    deleteTopic.bind(null, topic.id),
    initialState
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!window.confirm(`¿Querés eliminar la temática "${topic.name}"?`)) {
      event.preventDefault();
    }
  }

  return (
    <li className="border-b border-[#eff2f4] py-3">
      <div className="flex items-center justify-between">
        <span className="text-sm leading-5 font-medium text-[#333333]">{topic.name}</span>

        <div className="flex items-center gap-3">
          <span className="text-xs leading-4 font-normal text-[#a1a1a1]">
            {topic._count.projects === 1
              ? '1 proyecto'
              : `${topic._count.projects} proyectos`}
          </span>

          <form action={formAction} onSubmit={handleSubmit}>
            <Button type="submit" variant="ghost" disabled={pending}>
              Eliminar
            </Button>
          </form>
        </div>
      </div>

      {state.formError && (
        <p className="text-destructive mt-1 text-right text-xs">{state.formError}</p>
      )}
    </li>
  );
}
