import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Chat, type ChatMessage } from "../src/components/chat";
import { Button } from "../src/components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuRadioGroup, DropdownMenuRadioItem,
} from "../src/components/ui/dropdown-menu";

const openingMessage: ChatMessage[] = [
  { id: "welcome", role: "assistant", content: "Hi! What would you like to work on today?" },
];

const streamedReply = [
  "Here is a small implementation plan.",
  ...Array.from({ length: 12 }, (_, index) => `${index + 1}. Complete one focused step, check it with the keyboard, and review the result before moving on.`),
  "Keep the first iteration focused.",
].join("\n\n");

function StreamingExample() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [position, setPosition] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setIsStreaming(false);
  };
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  const start = (content: string) => {
    stop();
    setPosition(0);
    setMessages((current) => [...current, { id: `user-${current.length}`, role: "user", content }, { id: `assistant-${current.length}`, role: "assistant", content: "" }]);
    setIsStreaming(true);
    let length = 0;
    timer.current = setInterval(() => {
      length = Math.min(length + 12, streamedReply.length);
      setPosition(length);
      setMessages((current) => current.map((message, index) => index === current.length - 1 ? { ...message, content: streamedReply.slice(0, length) } : message));
      if (length === streamedReply.length) stop();
    }, 100);
  };
  return <Chat title="Streaming demo" messages={messages} onSend={start} isStreaming={isStreaming} onStop={stop}
    defaultDraft="Show me an implementation plan."
    footer={`Simulated streaming demo. ${position} characters received.`}
    className="mx-auto h-[min(calc(100dvh-4rem),720px)] w-full max-w-3xl border border-border sm:rounded-2xl" />;
}

function ErrorExample() {
  const failed: ChatMessage = { id: "failed", role: "user", content: "Please review this project.", error: "Network unavailable. Your message has been preserved." };
  const [messages, setMessages] = useState<ChatMessage[]>([failed]);
  const [error, setError] = useState<string | undefined>("The assistant service could not be reached.");
  const [isRetrying, setIsRetrying] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (callback: () => void) => { timers.current.push(setTimeout(callback, 1500)); };
  return <Chat title="Retry demo" messages={messages} responseError={error} isRetrying={isRetrying} defaultDraft="My unsent follow-up stays here."
    onSend={(content) => setMessages((current) => [...current, { id: `message-${current.length}`, role: "user", content }])}
    onRetryMessage={(message) => {
      setMessages((current) => current.map((item) => item.id === message.id ? { ...item, retrying: true } : item));
      later(() => setMessages((current) => current.map((item) => item.id === message.id ? { ...item, error: undefined, retrying: false } : item)));
    }}
    onRetry={() => {
      setIsRetrying(true);
      later(() => {
        setIsRetrying(false);
        setError(undefined);
        setMessages((current) => [...current, { id: `response-${current.length}`, role: "assistant", content: "Retry succeeded. This is a simulated response." }]);
      });
    }}
    className="mx-auto h-[min(calc(100dvh-4rem),720px)] w-full max-w-3xl border border-border sm:rounded-2xl" />;
}

function ModelMenu() {
  const [model, setModel] = useState("Balanced");
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setContainer}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" aria-label={`Choose model: ${model}`}>
            {model}
            <svg aria-hidden="true" className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="m4 6 4 4 4-4" />
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent container={container} align="end">
          <DropdownMenuRadioGroup aria-label="Model" value={model} onValueChange={setModel}>
            <DropdownMenuRadioItem value="Balanced">Balanced</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Fast">Fast</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="Advanced" disabled>Advanced (coming soon)</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ComposerButtons() {
  const [includeContext, setIncludeContext] = useState(false);
  const [includeChanges, setIncludeChanges] = useState(false);
  return (
    <>
      <Button variant="ghost" size="icon-sm" aria-label="Include project context" aria-pressed={includeContext}
        onClick={() => setIncludeContext((value) => !value)}
        icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10" /></svg>} />
      <Button variant={includeChanges ? "outline" : "ghost"} size="sm" aria-pressed={includeChanges}
        onClick={() => setIncludeChanges((value) => !value)}>Changes</Button>
      <Button variant="ghost" size="icon-sm" disabled aria-label="Voice input (unavailable)"
        icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="6" y="2" width="4" height="8" rx="2" /><path d="M4 7v1a4 4 0 0 0 8 0V7M8 12v2" /></svg>} />
    </>
  );
}

function ToolUseExample() {
  const [finished, setFinished] = useState(false);
  const [replies, setReplies] = useState<ChatMessage[]>([]);
  return (
    <Chat
      title="Smol assistant"
      className="mx-auto h-[min(calc(100dvh-4rem),720px)] w-full max-w-3xl border border-border sm:rounded-2xl"
      isLoading={!finished}
      headerActions={<Button variant="outline" size="sm" onClick={() => setFinished((value) => !value)}>
        {finished ? "Restart demo" : "Finish tool calls"}
      </Button>}
      messages={[
        { id: "request", role: "user", content: "Review the project and run its checks." },
        { id: "read", role: "tool", toolName: "Read files", status: "completed", content: "Read package.json and the component source." },
        { id: "tests", role: "tool", toolName: "Run tests", status: finished ? "completed" : "running", content: finished ? "All checks passed." : "Checking component interactions..." },
        { id: "network", role: "tool", toolName: "Fetch documentation", status: "error", content: "The documentation server could not be reached. Retry this step when it is available." },
        ...(finished ? [{ id: "result", role: "assistant" as const, content: "Local checks passed. The documentation lookup failed; its error is preserved in the tool group." }] : []),
        ...replies,
      ]}
      onSend={(content) => setReplies((current) => [...current, { id: `reply-${current.length}`, role: "user", content }])}
    />
  );
}

function ChatExample({ initialMessages = openingMessage, initialLoading = false, disabled = false, defaultDraft = "", headerActions, composerActions, footer }: {
  initialMessages?: ChatMessage[];
  initialLoading?: boolean;
  disabled?: boolean;
  defaultDraft?: string;
  headerActions?: ReactNode;
  composerActions?: ReactNode;
  footer?: ReactNode;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const nextId = useRef(0);

  const sendMessage = (content: string) => {
    setMessages((current) => [...current, { id: `message-${++nextId.current}`, role: "user", content }]);
    setIsLoading(true);
    window.setTimeout(() => {
      setMessages((current) => [...current, {
        id: `message-${++nextId.current}`,
        role: "assistant",
        content: "This is a UI demo. Connect the onSend callback to your assistant service for real responses.",
      }]);
      setIsLoading(false);
    }, 350);
  };

  return (
    <Chat
      title="Smol assistant"
      headerActions={headerActions}
      composerActions={composerActions}
      footer={footer}
      messages={messages}
      onSend={sendMessage}
      isLoading={isLoading}
      disabled={disabled}
      defaultDraft={defaultDraft}
      className="mx-auto h-[min(calc(100dvh-4rem),720px)] w-full max-w-3xl border border-border sm:rounded-2xl"
    />
  );
}

const meta = {
  title: "Components/Chat",
  component: Chat,
  tags: ["autodocs"],
  args: { messages: [], onSend: () => {} },
  render: () => <ChatExample />,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Chat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { render: () => <ChatExample key="playground" /> };
export const Empty: Story = { render: () => <ChatExample key="empty" initialMessages={[]} /> };
export const Loading: Story = { render: () => <ChatExample key="loading" initialLoading /> };
export const Disabled: Story = {
  render: () => <ChatExample key="disabled" disabled footer="This conversation is read-only." />,
};
export const Dark: Story = { ...Playground, globals: { theme: "dark" } };
export const HeaderActions: Story = {
  render: () => <ChatExample headerActions={<ModelMenu />} />,
};
export const ComposerActions: Story = {
  render: () => <ChatExample defaultDraft="Help me review these changes." composerActions={<ComposerButtons />} />,
};
export const CustomFooter: Story = {
  render: () => <ChatExample footer="Demo workspace. Messages are not sent to a service." />,
};
export const WithoutFooter: Story = {
  render: () => <ChatExample footer={null} />,
};
export const Streaming: Story = { render: () => <StreamingExample /> };
export const ErrorAndRetry: Story = { render: () => <ErrorExample /> };
export const MessageInfo: Story = {
  render: () => <ChatExample initialMessages={[
    { id: "question", role: "user", content: "Can you help me plan a small project?", userName: "Alex", timestamp: "10:30 AM" },
    { id: "answer", role: "assistant", content: "Start with one clear goal, then break it into a few manageable milestones.", model: "Example model", timestamp: "10:31 AM" },
    { id: "without-info", role: "assistant", content: "Messages without metadata keep their usual appearance." },
  ]} />,
};
export const ToolUse: Story = { render: () => <ToolUseExample /> };
export const SeparateToolGroups: Story = {
  render: () => <ChatExample initialMessages={[
    { id: "one", role: "tool", toolName: "Read files", status: "completed", content: "Read the project configuration." },
    { id: "explanation", role: "assistant", content: "The configuration looks good. Next, I will check the components." },
    { id: "two", role: "tool", toolName: "Search source", status: "completed", content: "Found 20 components." },
    { id: "three", role: "tool", toolName: "Run checks", status: "completed", content: "All checks passed." },
  ]} />,
};

export const MultilineDraft: Story = {
  render: () => <ChatExample key="multiline" initialMessages={[]} defaultDraft={"Help me plan a small project.\nStart with the main milestones.\nThen suggest the next step."} />,
};

export const LongDraft: Story = {
  render: () => <ChatExample key="long-draft" initialMessages={[]} defaultDraft={Array.from({ length: 12 }, (_, index) => `Step ${index + 1}: Review the project requirements and write down the next action.`).join("\n")} />,
};

const navigationTopics = [
  "Plan the dashboard layout", "Choose chart colors", "Add keyboard shortcuts", "Write the empty state",
  "Review table sorting", "Improve loading states", "Check dark theme contrast", "Add filter persistence",
  "Draft release notes", "Summarize open questions",
];

export const MessageNavigation: Story = {
  render: () => <ChatExample key="message-navigation" initialMessages={navigationTopics.flatMap((topic, index) => [
    { id: `question-${index}`, role: "user" as const, content: `${topic}.\nWhat should I consider first?`, timestamp: `9:${String(index * 4).padStart(2, "0")} AM` },
    { id: `answer-${index}`, role: "assistant" as const, content: `For "${topic.toLowerCase()}", start with the user's goal.\n\n1. Identify the main task.\n2. Build the smallest useful version.\n3. Check it with a keyboard and screen reader.\n4. Review it with real data.`, timestamp: `9:${String(index * 4 + 1).padStart(2, "0")} AM` },
  ])} />,
};

export const LongConversation: Story = {
  render: () => <ChatExample key="long-conversation" initialMessages={Array.from({ length: 12 }, (_, index) => ({
    id: `history-${index}`,
    role: index % 2 === 0 ? "user" : "assistant",
    content: index % 2 === 0
      ? "Can you help me break this project into smaller steps?\nI would like to start with something manageable."
      : "Start with a small, working version.\n\n1. Define the main goal.\n2. Build one complete interaction.\n3. Review the result before adding more features.",
  }))} />,
};

function RejectedSendExample() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState("");

  const sendMessage = (content: string) => {
    if (content.length > 40) {
      setError("Keep messages to 40 characters or fewer. Your draft was kept.");
      return false;
    }

    setError("");
    setMessages((current) => [...current, { id: `message-${current.length}`, role: "user", content }]);
  };

  return (
    <Chat
      title="Short messages"
      messages={messages}
      onSend={sendMessage}
      footer={<span role="status">{error || "Messages over 40 characters are rejected."}</span>}
      className="mx-auto h-[min(calc(100dvh-4rem),720px)] w-full max-w-3xl border border-border sm:rounded-2xl"
    />
  );
}

export const RejectedSend: Story = { render: () => <RejectedSendExample /> };
