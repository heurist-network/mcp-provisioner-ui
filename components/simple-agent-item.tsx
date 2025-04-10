"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useProvisioner } from "@/lib/provisioner-context";
import { AnimatePresence, motion } from "framer-motion";
import { Trophy, Users } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { SidebarToggle } from "./sidebar-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSidebar } from "@/components/ui/sidebar"; // Import the useSidebar hook

interface AgentItemProps {
  name?: string;
  author?: string;
  description?: string;
  tags?: string[];
  image_url?: string;
  total_calls?: number;
  agentId: string;
}

export interface Agent {
  id: string;
  name: string;
  author: string;
  description: string;
  tags: string[];
  image_url?: string;
  total_calls?: number;
  recommended?: boolean;
  tools?: any[];
}

const fetchAgents = async (): Promise<Agent[]> => {
  try {
    const response = await fetch("/api/agents");
    const data = await response.json();
    const agents = data.agents;

    if (agents && typeof agents === "object") {
      const agentsArray = Object.keys(agents).map((key) => {
        const agent = agents[key];
        const metadata = {
          id: key,
          name: "Unnamed Agent",
          author: "Heurist",
          description: "",
          tags: [],
          image_url: "",
          recommended: false,
        };
        return Object.assign(metadata, agent.metadata);
      });
      agentsArray.sort((a, b) => (b.total_calls || 0) - (a.total_calls || 0));
      return agentsArray.filter((item) => item.name && !(item as any).hidden);
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch agents:", error);
    return [];
  }
};

const AgentItemCard: FC<AgentItemProps> = ({
  name = "Name",
  author = "Heurist",
  description = "A cutting-edge AI agent",
  tags = ["Tag"],
  image_url = "",
  total_calls = 0,
  agentId = "",
}) => {
  const { isAgentSelected, toggleAgentSelection } = useProvisioner();
  return (
    <Card className="p-1 border-none h-full w-full">
      <div className="rounded-md border-solid h-full flex flex-col justify-between border text-white overflow-hidden w-full">
        <CardContent className="p-3">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.05 }}>
                <Avatar className="size-10 rounded-lg">
                  <AvatarImage src={image_url} />
                  <AvatarFallback className="rounded-lg bg-blue-600 text-white">
                    {name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <div>
                <h3 className="font-medium text-lg">{name}</h3>
                <p className="text-xs text-muted-foreground">By {author}</p>
              </div>
            </div>

            <div className="flex gap-1">
              {tags.map((tag, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge
                    className="bg-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-300"
                  >
                    {tag}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm text-foreground line-clamp-2">{description}</p>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[300px] break-words">
                {description}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>

        <CardFooter className="m-3 p-3 rounded-lg flex justify-between items-center bg-muted">
          <div className="flex flex-1 gap-4 text-xs items-center">
            <div className="grow-[4]">
              <p className="text-muted-foreground">Price per Use</p>
              <p className="font-medium text-foreground">
                1 Credit
              </p>
            </div>

            <div className="h-8 w-px bg-secondary"></div>

            <div className="grow-[3]">
              <p className="text-muted-foreground">Used</p>
              <p className="font-medium text-foreground">
                {total_calls.toLocaleString()}x
              </p>
            </div>

            <div className="h-8 w-px bg-secondary"></div>

            <div className="shrink-0">
                <motion.div 
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.9 }}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    toggleAgentSelection(agentId);
                  }}
                >
                  <div
                    className={`size-8 group -rotate-45 ${
                      isAgentSelected(agentId) 
                        ? "bg-[#cdf138]" 
                        : "bg-zinc-600"
                    } rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`${
                        isAgentSelected(agentId) 
                          ? "text-zinc-600" 
                          : "text-zinc-300"
                      } duration-150 group-hover:rotate-45`}
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </motion.div>
            </div>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
};

export const SimpleAgentItem: FC = () => {
  const { isAgentSelected, toggleAgentSelection } = useProvisioner();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [recommendedAgents, setRecommendedAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const { state } = useSidebar(); // Get the sidebar state

  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoading(true);
        const data = await fetchAgents();
        setAgents(data);
        setRecommendedAgents(data.filter((agent) => agent.recommended));
      } catch (err) {
        console.error("Failed to load agents:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-white">Loading...</div>;
  }

  // Determine the grid column classes based on sidebar state
  const getGridColumns = () => {
    const isExpanded = state === "expanded";
    
    // Base columns for the 'All Agents' tab
    return {
      all: isExpanded 
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3" 
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
      recommended: isExpanded
        ? "grid-cols-1 lg:grid-cols-1 xl:grid-cols-2" 
        : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
    };
  };

  const gridColumns = getGridColumns();

  // This class helps with transitions when the sidebar state changes
  const containerClass = state === "expanded" 
    ? "flex-1 transition-all duration-300" 
    : "w-full transition-all duration-300";

  return (
    <div className={`flex flex-col gap-4 p-0 md:p-6 ${containerClass}`}>
      <div className="absolute top-2 left-2 flex md:hidden flex-row justify-end items-center">
        <SidebarToggle />
      </div>

      <Tabs defaultValue="all agent" className="w-full">
        <TabsList className="grid grid-cols-2 w-full md:w-[300px] mx-2">
          <TabsTrigger value="all agent">
            <Users className="size-4 mr-2" />
            All Agents
          </TabsTrigger>
          <TabsTrigger value="recommended">
            <Trophy className="size-4 mr-2" />
            Recommended
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all agent" className="w-full">
          <div className={`grid ${gridColumns.all} gap-4 w-full p-2`}>
            <AnimatePresence>
              {agents.map((agent: Agent) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{
                    duration: 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className="w-full"
                >
                  <AgentItemCard
                    name={agent.name}
                    author={agent.author}
                    description={agent.description}
                    tags={agent.tags}
                    image_url={agent.image_url}
                    total_calls={agent.total_calls}
                    agentId={agent.id}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>
        <TabsContent value="recommended" className="w-full">
          <div className={`grid ${gridColumns.recommended} gap-4 w-full p-2`}>
            <AnimatePresence>
              {recommendedAgents.map((agent: Agent) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{
                    duration: 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className="w-full"
                >
                  <AgentItemCard
                    name={agent.name}
                    author={agent.author}
                    description={agent.description}
                    tags={agent.tags}
                    image_url={agent.image_url}
                    total_calls={agent.total_calls}
                    agentId={agent.id}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};