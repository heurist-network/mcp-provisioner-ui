'use client';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';

import { Button } from '@/components/ui/button';
import { memo } from 'react';
import { PlusIcon } from './icons';

import { useAgent } from '@/lib/context/agent-context';
import { ExternalLink, MessageSquareMore } from 'lucide-react';
import Image from 'next/image';
import { useSidebar } from './ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import type { VisibilityType } from './visibility-selector';

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
}: {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const router = useRouter();
  const { open } = useSidebar();

  const { width: windowWidth } = useWindowSize();
  const { selectedAgent } = useAgent();

  return (
    <header className="flex sticky top-4 bg-background items-center px-2 md:px-2 gap-2">
      {!open || windowWidth < 768 ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
              onClick={() => {
                router.push('/');
                router.refresh();
              }}
            >
              <PlusIcon />
              <span className="md:sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
      ) : (
        <div className="flex flex-row justify-between items-center w-full">
          <div className="flex flex-row gap-2">
            <Button
              variant="outline"
              className=""
              onClick={() => {
                router.push(`/${selectedAgent.id}`);
                router.refresh();
              }}
            >
              <MessageSquareMore />
              New Chat
            </Button>
            <Button
              variant="outline"
              className=""
              onClick={() => {
                window.open(
                  'https://docs.heurist.ai/dev-guide/heurist-mesh/endpoint',
                  '_blank',
                );
              }}
            >
              <ExternalLink />
              API Key
            </Button>
          </div>
          <div>
            <div className="logo">
              <Image
                src="/images/logo-white.svg"
                width="100"
                height="41"
                alt="Logo"
              />
            </div>
          </div>
          <div className="w-60" />
        </div>
      )}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId;
});
