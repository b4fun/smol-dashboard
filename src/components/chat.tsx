"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface ChatMessageBase {
  id: string;
  content: React.ReactNode;
  userName?: string;
  model?: string;
  timestamp?: string;
  error?: string;
  retrying?: boolean;
}

export interface ChatToolMessage extends ChatMessageBase {
  role: "tool";
  toolName: string;
  status: "running" | "completed" | "error";
}

export type ChatMessage = (ChatMessageBase & { role: "assistant" | "user" }) | ChatToolMessage;

type MessageGroup =
  | { kind: "message"; message: Exclude<ChatMessage, ChatToolMessage> }
  | { kind: "tools"; id: string; tools: ChatToolMessage[] };

function toolSummary(tools: ChatToolMessage[]) {
  const counts = (["running", "completed", "error"] as const).map((status) => {
    const count = tools.filter((tool) => tool.status === status).length;
    return count ? `${count} ${status === "error" ? "failed" : status}` : null;
  }).filter(Boolean);
  return `${tools.length} tool ${tools.length === 1 ? "call" : "calls"}: ${counts.join(", ")}`;
}

function ToolGroup({ tools }: { tools: ChatToolMessage[] }) {
  return (
    <details data-slot="chat-tool-group" className="group/tools min-w-0 rounded-lg border border-border text-sm">
      <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground [&::-webkit-details-marker]:hidden">
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
          className="size-4 shrink-0 group-open/tools:rotate-90"><path d="m6 4 4 4-4 4" /></svg>
        {tools.some((tool) => tool.status === "running") && <Spinner aria-hidden="true" />}
        <span className="min-w-0 [overflow-wrap:anywhere]">{toolSummary(tools)}</span>
      </summary>
      <ul aria-label="Tool calls" className="space-y-3 border-t border-border p-3">
        {tools.map((tool) => (
          <li key={tool.id} data-slot="chat-tool-call" className="min-w-0 [overflow-wrap:anywhere]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{tool.toolName}</span>
              <span className="text-xs text-foreground/70">{tool.status === "error" ? "Failed" : tool.status === "running" ? "Running" : "Completed"}</span>
            </div>
            <div className="mt-1 whitespace-pre-wrap text-foreground/70">{tool.content}</div>
          </li>
        ))}
      </ul>
    </details>
  );
}

function ChatError({ label, message, retryLabel, onRetry, disabled, retrying = false, align = "start", alert = false }: {
  label: string;
  message: string;
  retryLabel: string;
  onRetry?: () => void;
  disabled?: boolean;
  retrying?: boolean;
  align?: "start" | "end";
  alert?: boolean;
}) {
  return (
    <div data-slot="chat-error" className={cn("mt-2 text-sm text-red-700 dark:text-red-400", align === "end" && "flex justify-end text-right")}>
      <p className="inline-flex min-w-0 items-start gap-1.5 text-left">
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="mt-0.5 size-4 shrink-0">
          <circle cx="8" cy="8" r="6.25" /><path d="M8 4.75v4M8 11v.25" strokeLinecap="round" />
        </svg>
        <span>
          <span role={alert ? "alert" : undefined}><strong>{label}: </strong>{message}</span>
          {onRetry && (
            <>
              {" "}
              <button type="button" aria-label={retrying ? `${retryLabel}: retrying` : retryLabel}
                aria-disabled={retrying || undefined} disabled={disabled && !retrying}
                onClick={() => { if (!retrying) onRetry(); }}
                className={cn(
                  "inline-flex min-h-6 items-center gap-1 rounded-sm px-0.5 align-baseline font-medium focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-current disabled:cursor-not-allowed disabled:opacity-60",
                  retrying ? "cursor-default" : "cursor-pointer underline underline-offset-4 hover:text-red-800 dark:hover:text-red-300",
                )}>
                {retrying && (
                  <svg aria-hidden="true" data-slot="chat-retry-spinner" viewBox="0 0 24 24" fill="none" className="size-3.5 motion-safe:animate-spin">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                    <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                )}
                {retrying ? "Retrying…" : "Retry"}
              </button>
              <span role="status" className="sr-only">{retrying ? "Retrying…" : ""}</span>
            </>
          )}
        </span>
      </p>
    </div>
  );
}

const excerpt = (message: ChatMessage, index: number) =>
  typeof message.content === "string" && message.content.trim()
    ? message.content.replace(/\s+/g, " ").trim().slice(0, 80)
    : `Message ${index + 1}`;

interface MessageRailProps {
  anchors: ChatMessage[];
  activeAnchor: string | null;
  gutter: number;
  onNavigate: (id: string) => void;
}

// Separate memoized component so hover magnification re-renders only the rail, not the conversation.
const MessageRail = React.memo(function MessageRail({ anchors, activeAnchor, gutter, onNavigate }: MessageRailProps) {
  const navRef = React.useRef<HTMLElement>(null);
  const [magnified, setMagnified] = React.useState<number | null>(null);
  const [previewDismissed, setPreviewDismissed] = React.useState(false);
  const [navScroll, setNavScroll] = React.useState(0);
  const [coarsePointer, setCoarsePointer] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia("(pointer: coarse)");
    const update = () => setCoarsePointer(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  // Compact dashes magnify like a dock; touch devices keep full-size rows since they cannot hover.
  const railRow = coarsePointer ? 24 : 8;
  const railPadding = 24;
  const lens = coarsePointer ? null : magnified;
  const railSize = (index: number) => lens === null ? railRow : [24, 16, 12][Math.abs(index - lens)] ?? railRow;
  let railShift = 0;
  if (lens !== null) {
    for (let index = 0; index < lens; index++) railShift -= railSize(index) - railRow;
    railShift -= (24 - railRow) / 2;
  }
  const activeId = activeAnchor ?? anchors[anchors.length - 1]?.id;

  React.useLayoutEffect(() => {
    const nav = navRef.current;
    const button = nav?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!nav || !button) return;
    if (button.offsetTop < nav.scrollTop) nav.scrollTop = button.offsetTop;
    else if (button.offsetTop + button.offsetHeight > nav.scrollTop + nav.clientHeight) {
      nav.scrollTop = button.offsetTop + button.offsetHeight - nav.clientHeight;
    }
  }, [activeId]);

  const previewTop = magnified === null || !navRef.current ? 0
    : navRef.current.offsetTop + railPadding + magnified * railRow + railRow / 2 - navScroll;

  return (
    <div data-slot="chat-message-rail" style={{ right: gutter }}
      className="pointer-events-none absolute inset-y-0 hidden w-6 items-center sm:flex">
      <nav ref={navRef} aria-label="Message navigation"
        className="pointer-events-auto relative max-h-full overflow-y-auto [scrollbar-width:none]"
        style={{ paddingBlock: railPadding }}
        onScroll={(event) => setNavScroll(event.currentTarget.scrollTop)}
        onPointerLeave={(event) => {
          const focused = document.activeElement;
          const buttons = Array.from(event.currentTarget.querySelectorAll("button"));
          const index = focused instanceof HTMLButtonElement && focused.matches(":focus-visible") ? buttons.indexOf(focused) : -1;
          setMagnified(index >= 0 ? index : null);
        }}
        onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setMagnified(null); }}
        onKeyDown={(event) => {
          if (event.key === "Escape") return setPreviewDismissed(true);
          const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
          if (!keys.includes(event.key)) return;
          event.preventDefault();
          const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
          const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
          const next = event.key === "Home" ? 0
            : event.key === "End" ? buttons.length - 1
            : Math.min(Math.max(current + (event.key === "ArrowDown" ? 1 : -1), 0), buttons.length - 1);
          buttons[next]?.focus();
          buttons[next]?.click();
        }}>
        <ol className="flex flex-col transition-transform duration-100 ease-out will-change-transform motion-reduce:transition-none"
          style={{ height: anchors.length * railRow, transform: `translateY(${railShift}px)` }}>
          {anchors.map((message, index) => {
            const active = activeId === message.id;
            const text = excerpt(message, index);
            const distance = lens === null ? Infinity : Math.abs(index - lens);
            const dash = [16, 12, 10][distance] ?? 8;
            return (
              <li key={message.id} className="shrink-0">
                <button type="button" tabIndex={active ? 0 : -1}
                  aria-label={`Message ${index + 1} of ${anchors.length}: ${text}`}
                  aria-current={active ? "location" : undefined}
                  onClick={() => onNavigate(message.id)}
                  onPointerEnter={() => { setMagnified(index); setPreviewDismissed(false); }}
                  onFocus={() => { setMagnified(index); setPreviewDismissed(false); }}
                  style={{ height: railSize(index) }}
                  className="flex w-6 cursor-pointer items-center justify-end rounded-sm pr-1 transition-[height] duration-100 ease-out focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground motion-reduce:transition-none">
                  <span aria-hidden="true" style={{ width: active ? Math.max(dash, 14) : dash }} className={cn(
                    "h-0.5 rounded-full transition-[width,background-color] duration-100 ease-out motion-reduce:transition-none",
                    active ? "bg-foreground" : distance === 0 ? "bg-foreground/80" : "bg-foreground/45",
                  )} />
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
      {magnified !== null && !previewDismissed && anchors[magnified] && (
        <div aria-hidden="true" data-slot="chat-message-preview" style={{ top: previewTop }}
          className="pointer-events-none absolute right-6 w-max max-w-56 -translate-y-1/2 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground shadow-sm">
          <div className="truncate">{excerpt(anchors[magnified]!, magnified)}</div>
          {anchors[magnified]!.timestamp && (
            <div data-slot="chat-message-preview-time" className="mt-0.5 text-foreground/70">{anchors[magnified]!.timestamp}</div>
          )}
        </div>
      )}
    </div>
  );
});

export interface ChatProps extends Omit<React.ComponentPropsWithoutRef<"section">, "title" | "children"> {
  title?: string;
  headerActions?: React.ReactNode;
  composerActions?: React.ReactNode;
  footer?: React.ReactNode;
  messages: ChatMessage[];
  onSend: (message: string) => void;
  isLoading?: boolean;
  isStreaming?: boolean;
  onStop?: () => void;
  responseError?: string;
  isRetrying?: boolean;
  onRetry?: () => void;
  onRetryMessage?: (message: ChatMessage) => void;
  defaultDraft?: string;
  placeholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export const Chat = React.forwardRef<HTMLElement, ChatProps>(
  ({
    title = "Assistant",
    headerActions,
    composerActions,
    footer = "Press Enter to send, Shift+Enter for a new line. AI can make mistakes.",
    messages,
    onSend,
    isLoading = false,
    isStreaming = false,
    onStop,
    responseError,
    isRetrying = false,
    onRetry,
    onRetryMessage,
    defaultDraft = "",
    placeholder = "Message...",
    emptyTitle = "What can I help with?",
    emptyDescription = "Ask a question or tell me what you are working on.",
    className,
    ...props
  }, ref) => {
    const titleId = React.useId();
    const [draft, setDraft] = React.useState(defaultDraft);
    const composerRef = React.useRef<HTMLTextAreaElement>(null);
    const scrollAreaRef = React.useRef<HTMLDivElement>(null);
    const logRef = React.useRef<HTMLDivElement>(null);
    const followRef = React.useRef(true);
    const [showJump, setShowJump] = React.useState(false);
    const lastAutoTopRef = React.useRef(0);
    const busy = isLoading || isStreaming;
    const scrollToLatest = React.useCallback(() => {
      const area = scrollAreaRef.current;
      if (!area) return;
      area.scrollTop = area.scrollHeight;
      lastAutoTopRef.current = area.scrollTop;
    }, []);
    const followIfPinned = React.useCallback(() => {
      const area = scrollAreaRef.current;
      if (!area) return;
      // A user scroll may not have dispatched its scroll event yet; don't pull them back down.
      if (followRef.current && area.scrollTop < lastAutoTopRef.current - 2) followRef.current = false;
      if (followRef.current) scrollToLatest();
      else setShowJump(area.scrollHeight - area.clientHeight - area.scrollTop > 32);
    }, [scrollToLatest]);
    const jumpToLatest = () => {
      followRef.current = true;
      setShowJump(false);
      scrollToLatest();
      scrollAreaRef.current?.focus({ preventScroll: true });
    };
    const groups: MessageGroup[] = [];
    for (const message of messages) {
      if (message.role === "tool") {
        const previous = groups[groups.length - 1];
        if (previous?.kind === "tools") previous.tools.push(message);
        else groups.push({ kind: "tools", id: message.id, tools: [message] });
      } else {
        groups.push({ kind: "message", message });
      }
    }
    const runningTools = messages.filter((message) => message.role === "tool" && message.status === "running");
    const anchors = React.useMemo(() => messages.filter((message) => message.role === "user"), [messages]);
    const navigatingUntilRef = React.useRef(0);
    const navigationTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    React.useEffect(() => () => { if (navigationTimerRef.current) clearTimeout(navigationTimerRef.current); }, []);
    const releaseNavigation = () => { navigatingUntilRef.current = 0; };
    const [activeAnchor, setActiveAnchor] = React.useState<string | null>(null);
    const [overflowing, setOverflowing] = React.useState(false);
    const [gutter, setGutter] = React.useState(0);

    const updateRail = React.useCallback(() => {
      const area = scrollAreaRef.current;
      const log = logRef.current;
      if (!area || !log) return;
      setOverflowing(area.scrollHeight > area.clientHeight + 1);
      setGutter(area.offsetWidth - area.clientWidth);
      if (Date.now() < navigatingUntilRef.current) return;
      const elements = Array.from(log.querySelectorAll<HTMLElement>("[data-chat-anchor]"));
      if (elements.length === 0) return setActiveAnchor(null);
      const bounds = area.getBoundingClientRect();
      const atBottom = area.scrollHeight - area.clientHeight - area.scrollTop <= 32;
      const limit = atBottom ? bounds.bottom - 1 : bounds.top + area.clientHeight / 3;
      let active = elements[0]!;
      for (const element of elements) if (element.getBoundingClientRect().top <= limit) active = element;
      setActiveAnchor(active.dataset.chatAnchor ?? null);
    }, []);

    const goToAnchor = React.useCallback((id: string) => {
      const area = scrollAreaRef.current;
      const target = logRef.current?.querySelector<HTMLElement>(`[data-chat-anchor="${CSS.escape(id)}"]`);
      if (!area || !target) return;
      followRef.current = false;
      navigatingUntilRef.current = Date.now() + 700;
      setActiveAnchor(id);
      if (navigationTimerRef.current) clearTimeout(navigationTimerRef.current);
      navigationTimerRef.current = setTimeout(updateRail, 750);
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      area.scrollTo({
        top: target.getBoundingClientRect().top - area.getBoundingClientRect().top + area.scrollTop - 24,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }, [updateRail]);

    React.useLayoutEffect(() => {
      const area = scrollAreaRef.current;
      const log = logRef.current;
      if (!area || !log) return;
      const observer = new ResizeObserver(() => { followIfPinned(); updateRail(); });
      observer.observe(log);
      observer.observe(area);
      followIfPinned();
      updateRail();
      return () => observer.disconnect();
    }, [followIfPinned, updateRail]);

    React.useLayoutEffect(() => { followIfPinned(); updateRail(); }, [messages, busy, responseError, followIfPinned, updateRail]);

    React.useLayoutEffect(() => {
      const composer = composerRef.current;
      if (!composer) return;
      const resize = () => {
        composer.style.overflowY = "hidden";
        composer.style.height = "auto";
        const contentHeight = composer.scrollHeight;
        composer.style.height = `${Math.min(contentHeight, 144)}px`;
        composer.style.overflowY = contentHeight > 144 ? "auto" : "hidden";
      };
      resize();
      let width = composer.clientWidth;
      const observer = new ResizeObserver(() => {
        if (composer.clientWidth !== width) {
          width = composer.clientWidth;
          resize();
        }
      });
      observer.observe(composer);
      return () => observer.disconnect();
    }, [draft]);

    const sendMessage = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const message = draft.trim();
      if (!message || busy) return;
      followRef.current = true;
      setShowJump(false);
      onSend(message);
      setDraft("");
    };

    return (
      <section
        ref={ref}
        aria-labelledby={props["aria-label"] ? undefined : titleId}
        data-slot="chat"
        className={cn("flex min-h-0 flex-col overflow-hidden bg-background text-foreground", className)}
        {...props}
      >
        <header className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2 sm:px-6">
          <h2 id={titleId} className="min-w-0 text-sm font-semibold [overflow-wrap:anywhere]">{title}</h2>
          {headerActions != null && (
            <div data-slot="chat-header-actions" className="flex max-w-full flex-wrap items-center gap-2">
              {headerActions}
            </div>
          )}
        </header>
        <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={scrollAreaRef}
          role="region"
          aria-label="Conversation history"
          tabIndex={0}
          onWheel={releaseNavigation}
          onPointerDown={releaseNavigation}
          onTouchStart={releaseNavigation}
          onKeyDown={releaseNavigation}
          onScroll={(event) => {
            const area = event.currentTarget;
            const nearBottom = area.scrollHeight - area.clientHeight - area.scrollTop <= 32;
            followRef.current = nearBottom;
            if (nearBottom) lastAutoTopRef.current = area.scrollTop;
            setShowJump(!nearBottom);
            updateRail();
          }}
          data-slot="chat-scroll-area"
          className="flex min-h-0 flex-1 flex-col overflow-y-auto [scrollbar-gutter:stable] px-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground sm:px-6"
        >
          <div
            ref={logRef}
            role="log"
            aria-label={`${title} conversation`}
            aria-busy={busy}
            data-slot="chat-messages"
            className={cn(
              "mx-auto flex w-full max-w-3xl flex-1 flex-col",
              messages.length > 0 ? "gap-6 py-6" : "py-2",
            )}
          >
            {messages.length > 0 ? groups.map((group) => {
              if (group.kind === "tools") return <ToolGroup key={group.id} tools={group.tools} />;
              const message = group.message;
              return (
              <article
                key={message.id}
                aria-label={message.role === "user" ? "Your message" : "Assistant message"}
                data-slot="chat-message"
                data-role={message.role}
                data-chat-anchor={message.role === "user" ? message.id : undefined}
                tabIndex={message.userName || message.model || message.timestamp ? 0 : undefined}
                className={cn(
                  "group flex rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div className="min-w-0 max-w-[85%] [overflow-wrap:anywhere]">
                  <div className={cn(
                    "whitespace-pre-wrap",
                    message.role === "user"
                      ? "rounded-3xl bg-accent px-4 py-3"
                      : "py-2",
                  )}>
                    {message.content}
                  </div>
                  {(message.userName || message.model || message.timestamp) && (
                    <footer
                      data-slot="chat-message-info"
                      className={cn(
                        "mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-foreground/70 [@media(hover:hover)]:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
                        message.role === "user" && "justify-end",
                      )}
                    >
                      {message.userName && <span><span className="sr-only">User: </span>{message.userName}</span>}
                      {message.model && <span><span className="sr-only">Model: </span>{message.model}</span>}
                      {message.timestamp && <span><span className="sr-only">Time: </span>{message.timestamp}</span>}
                    </footer>
                  )}
                  {message.error && (
                    <ChatError label="Message failed" message={message.error} retryLabel="Retry message"
                      retrying={message.retrying}
                      align={message.role === "user" ? "end" : "start"}
                      onRetry={onRetryMessage ? () => onRetryMessage(message) : undefined} />
                  )}
                </div>
              </article>
              );
            }) : (
              <div data-slot="chat-empty-state" className="m-auto max-w-md text-center">
                <h3 className="text-xl font-semibold tracking-tight">{emptyTitle}</h3>
                <p className="mt-2 text-sm text-foreground/70">{emptyDescription}</p>
              </div>
            )}
          </div>
          {(busy || runningTools.length > 0) && !responseError && (
            <div role="status" data-slot="chat-status" className="mx-auto flex w-full max-w-3xl items-center gap-2 pb-4 text-sm text-foreground/70">
              <Spinner aria-hidden="true" />
              <span>{runningTools.length > 0
                ? `Using ${runningTools.length} ${runningTools.length === 1 ? "tool" : "tools"}...`
                : isStreaming ? "Assistant is responding..." : "Assistant is thinking..."}</span>
            </div>
          )}
        </div>
        {anchors.length >= 2 && overflowing && (
          <MessageRail anchors={anchors} activeAnchor={activeAnchor} gutter={gutter} onNavigate={goToAnchor} />
        )}
        </div>
        {showJump && (
          <div className="relative h-0 shrink-0">
            <Button variant="outline" size="icon-sm" aria-label="Jump to latest" title="Jump to latest" onClick={jumpToLatest}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full shadow-sm"
              icon={<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10m-4-4 4 4 4-4" /></svg>} />
          </div>
        )}
        {responseError && (
          <div className="mx-auto w-full max-w-3xl shrink-0 px-4 pb-3 sm:px-6">
            <ChatError alert label="Response failed" message={responseError} retryLabel="Retry response"
              onRetry={onRetry} disabled={busy} retrying={isRetrying} />
          </div>
        )}
        <div className="shrink-0 px-4 pb-3 sm:px-6">
          <form onSubmit={sendMessage} className="mx-auto w-full max-w-3xl">
            <label htmlFor={`${titleId}-composer`} className="sr-only">Message</label>
            <div className="flex flex-col gap-2 rounded-2xl border border-foreground/45 bg-background p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring">
              <textarea
                ref={composerRef}
                id={`${titleId}-composer`}
                aria-label="Message"
                data-slot="chat-composer"
                rows={1}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder={placeholder}
                className="min-h-10 max-h-36 w-full min-w-0 resize-none overflow-y-hidden bg-transparent px-1 py-2 text-sm outline-none placeholder:text-foreground/60"
              />
              <div data-slot="chat-composer-toolbar" className="flex items-end gap-2">
                <div data-slot="chat-composer-actions" className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
                  {composerActions}
                </div>
              <Button
                type={busy && onStop ? "button" : "submit"}
                size="icon-sm"
                aria-label={busy && onStop ? "Stop response" : "Send"}
                onClick={busy && onStop ? onStop : undefined}
                disabled={busy ? !onStop : !draft.trim()}
                className="shrink-0 rounded-full"
                icon={
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                    {busy && onStop ? <rect x="4" y="4" width="8" height="8" fill="currentColor" stroke="none" /> : <path d="M8 13V3m-4 4 4-4 4 4" />}
                  </svg>
                }
              />
              </div>
            </div>
            {footer != null && footer !== false && (
              <div data-slot="chat-footer" className="mt-2 text-center text-xs text-foreground/70">
                {footer}
              </div>
            )}
          </form>
        </div>
      </section>
    );
  },
);

Chat.displayName = "Chat";
