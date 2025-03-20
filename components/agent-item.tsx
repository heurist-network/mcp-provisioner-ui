"use client";

import { FC, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { generateUUID } from "@/lib/utils";
import { SidebarToggle } from "./sidebar-toggle";
import { Users } from "lucide-react";
import { useAgent } from "@/lib/context/agent-context";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 定义单个代理项的属性接口
interface AgentItemProps {
  name?: string;
  author?: string;
  description?: string;
  price?: number;
  usageCount?: number;
  apiCount?: number;
  tags?: string[];
  onClick?: () => void;
  imageSrc?: string;
}

// 代理项数据模型
export interface Agent {
  id: string;
  name: string;
  author: string;
  description: string;
  tags: string[];
  imageSrc?: string;
  recommended?: boolean;
}

// 模拟数据
const mockAgents: Agent[] = [
  {
    id: "1",
    name: "区块链猎手",
    author: "Heurist",
    description:
      "A cutting-edge AI agent designed to scour blockchain networks for emerging memecoins. Leveraging real-time data analysis, it identifies potential opportunities before they gain mainstream attention.",
    tags: ["区块链", "分析"],
    imageSrc: "/images/agents/blockchain.png",
    recommended: true,
  },
  {
    id: "2",
    name: "交易策略师",
    author: "Heurist",
    description:
      "专注于加密货币市场分析的AI代理，实时追踪价格动向并提供交易建议，结合技术分析和市场情绪指标。",

    tags: ["交易", "策略"],
    imageSrc: "/images/agents/trading.png",
    recommended: true,
  },
];

// 模拟API获取函数
const fetchAgents = async (): Promise<Agent[]> => {
  try {
    const response = await fetch(
      "https://mesh.heurist.ai/mesh_agents_metadata.json"
    );
    const data = await response.json();
    console.log("得到数据 -- == --", data);
    const agents = data.agents;

    // 将获取的数据转换为Agent对象数组
    if (agents && typeof agents === "object") {
      // 如果data是一个对象而不是数组，需要将其转换为数组
      const agentsArray = Object.keys(agents).map((key) => {
        const agent = agents[key];
        // 确保metadata存在，并包含所需的字段
        const metadata = agent.metadata || {};
        return {
          id: key,
          name: metadata.name || "Unnamed Agent",
          author: metadata.author || "Heurist",
          description: metadata.description || "",
          tags: Array.isArray(metadata.tags) ? metadata.tags : [],
          imageSrc: metadata.imageSrc,
          recommended: metadata.recommended || false,
        } as Agent;
      });

      const filteredAgents = agentsArray.filter(
        (item) => item.name && !(item as any).hidden
      );
      return filteredAgents;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch agents:", error);
    return [];
  }
};

// 单个代理项组件
const AgentItemCard: FC<AgentItemProps> = ({
  name = "Name",
  author = "Heurist",
  description = "A cutting-edge AI agent designed to scour blockchain networks for emerging memecoins. Leveraging real-time data analysis, it identifies potential opportunities before they gain mainstream attention.",
  price = 2.2,
  usageCount = 1123329,
  apiCount = 2,
  tags = ["Tag", "Tag"],
  onClick,
  imageSrc,
}) => {
  return (
    <Card className="p-1 border-none h-full ">
      <div className="rounded-md border-solid h-full flex flex-col justify-between border text-white overflow-hidden">
        <CardContent className="p-3">
          {/* 头部：头像、名称、作者和标签 */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.05 }}>
                <Avatar className="w-10 h-10 rounded-lg bg-blue-600">
                  <AvatarImage src={imageSrc} />
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
                    variant="secondary"
                    className="bg-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-300"
                  >
                    {tag}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 描述文本 */}
          <p className="text-sm text-foreground line-clamp-2">{description}</p>
        </CardContent>

        {/* 底部：价格、使用次数、API 和箭头按钮 */}
        <CardFooter className="m-3 p-3 rounded-lg flex justify-between items-center bg-muted">
          <div className="flex flex-1 gap-4 text-xs items-center">
            <div className="flex-grow-[4]">
              <p className="text-muted-foreground">Price per Token</p>
              <p className="font-medium text-foreground">{price} Credits</p>
            </div>

            {/* 第一个分隔线 */}
            <div className="h-8 w-px bg-secondary"></div>

            <div className="flex-grow-[3]">
              <p className="text-muted-foreground">Used</p>
              <p className="font-medium text-foreground">
                {usageCount.toLocaleString()}x
              </p>
            </div>

            {/* 第二个分隔线 */}
            <div className="h-8 w-px bg-secondary"></div>

            <div className="flex-grow-[2]">
              <p className="text-muted-foreground">APIs</p>
              <div className="flex gap-1 mt-1 text-foreground">
                {Array(apiCount)
                  .fill(0)
                  .map((_, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.2 }}
                      className="w-4 h-4 rounded-full border border-white"
                    />
                  ))}
              </div>
            </div>

            {/* 第三个分隔线 */}
            <div className="h-8 w-px bg-secondary"></div>

            <div className="flex-shrink-0">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  size="icon"
                  variant="secondary"
                  className="w-8 h-8 group rotate-[-45deg] bg-[#cdf138] hover:bg-[#cdf138] rounded-full  "
                  onClick={onClick}
                >
                  <ArrowRight className="h-4 w-4 text-zinc-600 duration-150 group-hover:rotate-45" />
                </Button>
              </motion.div>
            </div>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
};

// 主组件 - 代理项容器
export const AgentItem: FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [recommendedAgents, setRecommendedAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { setSelectedAgent } = useAgent();
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

  // 修改handleAgentClick函数
  const handleAgentClick = async (agent: Agent) => {
    const chatId = generateUUID();
    try {
      // 创建新的聊天记录
      const response = await fetch("/api/chat/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: chatId,
          title: agent.name, // 使用代理名称作为初始标题
          agentId: agent.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create chat");
      }

      // 跳转到聊天页面
      // 新增状态存储
      setSelectedAgent(agent);

      router.push(`/chat/${chatId}?agent=${agent.id}`);
    } catch (error) {
      console.error("Failed to create chat:", error);
      // 可以添加错误提示
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-white">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-10">
      <Tabs defaultValue="all agent" className="w-full ">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="all agent">All Agents</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>
        <TabsContent value="all agent" className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {agents.map((agent, index) => (
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
                >
                  <AgentItemCard
                    name={agent.name}
                    author={agent.author}
                    description={agent.description}
                    tags={agent.tags}
                    imageSrc={agent.imageSrc}
                    onClick={() => handleAgentClick(agent)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>
        <TabsContent value="recommended" className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {recommendedAgents.map((agent, index) => (
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
                >
                  <AgentItemCard
                    name={agent.name}
                    author={agent.author}
                    description={agent.description}
                    tags={agent.tags}
                    imageSrc={agent.imageSrc}
                    onClick={() => handleAgentClick(agent)}
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
