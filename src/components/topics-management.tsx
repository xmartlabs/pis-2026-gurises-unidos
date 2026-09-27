'use client';

import { Input } from '@base-ui/react';
import { Card, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

type TopicsManagementProps = {
  topicCount: number;
};

export function TopicsManagement( {topicCount}: TopicsManagementProps) {
  return (
    <Card className="border-border flex w-full max-w-190 flex-col gap-4 rounded-[14px] border bg-white p-6 ring-0">
      <CardHeader>
        <CardTitle className="font-sans text-base leading-6 font-semibold tracking-normal">
          Temáticas de proyectos
        </CardTitle>
      </CardHeader>
      <div className="flex w-full max-w-178 items-center gap-2">
        <Input
          className="border-border placeholder:text-muted-foreground h-9 min-w-0 flex-1 rounded-md border bg-white px-3 py-1 font-sans text-base leading-6 font-normal tracking-normal shadow-[0_1px_2px_0_rgb(0_0_0/0.1)]"
          placeholder="Nueva temática..."
        />
        <Button
          type="submit"
          variant="default"
          className="[0_1px 2px_0_rgb(0_0_0/0.1] h-9 rounded-lg px-4 py-2 shadow"
        >
          Agregar
        </Button>
      </div>
      <Separator className="w-full max-w-178 bg-[#EFF2F4]" />
      <p className="font-sans text-xs leading-4 font-normal tracking-normal">
        {topicCount} temáticas
      </p>
    </Card>
  );
}
