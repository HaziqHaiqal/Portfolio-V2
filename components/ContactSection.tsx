'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Mail, Linkedin, Github, Eraser, Trash2 } from 'lucide-react';
import type { Profile } from '@lib/supabase';

/**
 * The terminal panel itself: window chrome, greeting, output screen and
 * prompt. It holds no dialog behaviour — no open/close state, backdrop or
 * Escape handling — so it is a plain panel that happens to be rendered inside
 * Modal/ContactModal, which owns all of that.
 */
interface ContactSectionProps {
  profile: Partial<Profile> | null;
}

interface Entry {
  id: number;
  kind: 'command' | 'note' | 'error' | 'help';
  text?: string;
}

const GREETING = "Hi, I'm Haziq.";

// Shared horizontal gutter — every region of the window aligns to it.
const GUTTER = 'px-4 sm:px-6 lg:px-8';

const COMMANDS = [
  { name: 'email', hint: 'open your mail app', icon: Mail },
  { name: 'linkedin', hint: 'open my LinkedIn', icon: Linkedin },
  { name: 'github', hint: 'open my GitHub', icon: Github },
  { name: 'clear', hint: 'clear the screen', icon: Eraser },
];

const ContactSection = ({ profile }: ContactSectionProps) => {
  const [input, setInput] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);

  // The greeting types itself in; everything else fades in just after.
  const [typedLen, setTypedLen] = useState(0);
  const greetingDone = typedLen >= GREETING.length;

  const idRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typedLen >= GREETING.length) return;
    const id = setTimeout(() => setTypedLen((n) => n + 1), 55);
    return () => clearTimeout(id);
  }, [typedLen]);

  useEffect(() => {
    if (screenRef.current) {
      screenRef.current.scrollTop = screenRef.current.scrollHeight;
    }
  }, [entries]);

  const t = {
    panel: 'bg-white dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700/60',
    chromeText: 'text-gray-400 dark:text-gray-400',
    heading: 'text-gray-900 dark:text-gray-100',
    body: 'text-gray-600 dark:text-gray-400',
    screen:
      'bg-gray-50 border-gray-200 dark:bg-gray-900/60 dark:border-gray-700/60',
    screenMuted: 'text-gray-400 dark:text-gray-600',
    helpBadge:
      'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300',
    helpRow: 'hover:bg-gray-100 dark:hover:bg-gray-800/70',
    clearBtn:
      'text-gray-400 hover:bg-gray-100 hover:text-rose-500 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-rose-400',
    bubble:
      'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:border-emerald-500/50 hover:text-emerald-600 dark:border-gray-700 dark:bg-gray-700/40 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-emerald-400/50 dark:hover:text-emerald-300',
    accent: 'text-emerald-600 dark:text-emerald-400',
    input:
      'text-gray-900 placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500',
    entryCommand: 'text-gray-700 dark:text-gray-200',
    entryNote: 'text-gray-500 dark:text-gray-400',
    entryError: 'text-amber-600 dark:text-amber-300',
  };

  const email = profile?.display_name || 'woodyz.dev@gmail.com';
  const linkedinUrl =
    profile?.linkedin_url || 'https://linkedin.com/in/mhaziqhaiqal';
  const githubUrl = profile?.github_url || 'https://github.com/haziqhaiqal';

  const push = useCallback((...bodies: Omit<Entry, 'id'>[]) => {
    setEntries((prev) => [
      ...prev,
      ...bodies.map((body) => ({ ...body, id: ++idRef.current })),
    ]);
  }, []);

  const openEmail = useCallback(() => {
    // Fires synchronously inside the handler so the browser keeps user
    // activation and hands off to the OS mail app.
    window.location.assign(`mailto:${email}`);
  }, [email]);

  const run = useCallback(
    (raw: string) => {
      const command = raw.trim().toLowerCase();
      setInput('');
      if (!command) return;

      if (command === 'clear') {
        setEntries([]);
        return;
      }

      switch (command) {
        case 'email':
          openEmail();
          push(
            { kind: 'command', text: command },
            { kind: 'note', text: 'Opening your mail app…' }
          );
          break;
        case 'linkedin':
          window.open(linkedinUrl, '_blank');
          push(
            { kind: 'command', text: command },
            { kind: 'note', text: 'Opening LinkedIn…' }
          );
          break;
        case 'github':
          window.open(githubUrl, '_blank');
          push(
            { kind: 'command', text: command },
            { kind: 'note', text: 'Opening GitHub…' }
          );
          break;
        case 'help':
          push({ kind: 'command', text: command }, { kind: 'help' });
          break;
        default:
          push(
            { kind: 'command', text: command },
            {
              kind: 'error',
              text: `I don't know "${command}". Try help — or use the shortcuts below.`,
            }
          );
      }
    },
    [push, openEmail, linkedinUrl, githubUrl]
  );

  const actions = [
    {
      key: 'email',
      icon: Mail,
      label: 'Email',
      detail: email,
      onClick: openEmail,
    },
    {
      key: 'linkedin',
      icon: Linkedin,
      label: 'LinkedIn',
      detail: "Let's connect",
      onClick: () => window.open(linkedinUrl, '_blank'),
    },
    {
      key: 'github',
      icon: Github,
      label: 'GitHub',
      detail: 'See my code',
      onClick: () => window.open(githubUrl, '_blank'),
    },
  ];

  const renderEntry = (entry: Entry) => {
    switch (entry.kind) {
      case 'command':
        return (
          <div className="flex items-baseline gap-2">
            <span className={t.accent}>❯</span>
            <span className={t.entryCommand}>{entry.text}</span>
          </div>
        );
      case 'note':
        return (
          <div className={`flex items-baseline gap-2 pl-5 ${t.entryNote}`}>
            <span className={t.accent}>→</span>
            <span className="italic">{entry.text}</span>
          </div>
        );
      case 'error':
        return (
          <div className={`flex items-baseline gap-2 pl-5 ${t.entryError}`}>
            <span>!</span>
            <span className="italic">{entry.text}</span>
          </div>
        );
      case 'help':
        return (
          <div className="mt-1 space-y-1.5 pl-5">
            <div className={`text-xs italic ${t.screenMuted}`}>
              {COMMANDS.length} commands · click one to run it
            </div>
            <div className="space-y-0.5">
              {COMMANDS.map(({ name, hint, icon: Icon }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => run(name)}
                  className={`group -mx-2 flex w-full items-center gap-3 rounded-md px-2 py-1 text-left transition-colors ${t.helpRow}`}
                >
                  <Icon size={13} className={t.screenMuted} />
                  <span className="w-[5rem] shrink-0">
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-xs ${t.helpBadge}`}
                    >
                      {name}
                    </span>
                  </span>
                  <span className={`truncate italic ${t.entryNote}`}>
                    {hint}
                  </span>
                  <span
                    className={`ml-auto shrink-0 pl-2 text-xs opacity-0 transition-opacity group-hover:opacity-100 ${t.accent}`}
                  >
                    &crarr;
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`flex h-full flex-col ${t.panel}`}>
      {/* Window chrome. Closing happens via the floating button, the backdrop
          or Escape, so there is no close control duplicated in here. */}
      <header
        className={`flex flex-shrink-0 items-center gap-3 ${GUTTER} h-12 border-b ${t.border}`}
      >
        <div className="flex items-center gap-2" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <span className={`flex-1 text-center text-sm ${t.chromeText}`}>
          Say hello
        </span>
        <div className="w-[52px]" aria-hidden="true" />
      </header>

      {/* Outer scroller catches the case where intro + screen exceed a short
          window; normally nothing overflows here and only the screen scrolls. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
        <div className={`flex-shrink-0 ${GUTTER} pb-6 pt-8`}>
          <div className="flex items-baseline gap-3 lg:gap-4">
            <span className={`font-mono text-xl lg:text-3xl ${t.accent}`}>
              ❯
            </span>
            <h2
              className={`text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl ${t.heading}`}
            >
              {GREETING.slice(0, typedLen)}
              {!greetingDone && (
                <span className="-mb-0.5 ml-1 inline-block h-7 w-[3px] animate-pulse bg-emerald-500 lg:h-10" />
              )}
            </h2>
          </div>

          <m.p
            className={`mt-4 max-w-xl pl-8 lg:pl-11 lg:text-lg ${t.body}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: greetingDone ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          >
            Thanks for stopping by. Pick whichever way is easiest for you.
          </m.p>
        </div>

        {/* The screen: everything typed and every response lands here. */}
        <div
          className={`flex flex-1 flex-col ${GUTTER} pb-6`}
          style={{ minHeight: 160 }}
        >
          <div
            ref={screenRef}
            onClick={() => inputRef.current?.focus()}
            className={`min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-xl border p-3 font-mono text-sm leading-6 sm:p-4 ${t.screen}`}
          >
            {entries.length === 0 ? (
              <div className={`space-y-1 italic ${t.screenMuted}`}>
                <div># whatever you type shows up here</div>
                <div>
                  # type <span className={t.accent}>help</span> for a list of
                  commands
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <AnimatePresence initial={false}>
                  {entries.map((entry) => (
                    <m.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      {renderEntry(entry)}
                    </m.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar: a thin always-there shortcut strip sitting on the prompt. */}
      <div className={`flex-shrink-0 border-t ${t.border}`}>
        {/* One non-wrapping row that scrolls sideways once the bubbles
            outgrow the window, so adding actions never costs extra height. */}
        <div
          className={`scrollbar-hide flex items-center gap-2 overflow-x-auto overscroll-x-contain ${GUTTER} pb-3 pt-3`}
        >
          {actions.map(({ key, icon: Icon, label, detail, onClick }) => (
            <button
              key={key}
              type="button"
              onClick={onClick}
              aria-label={`${label} — ${detail}`}
              className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-colors ${t.bubble}`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(input);
          }}
          className={`flex items-center gap-3 ${GUTTER} pb-3`}
        >
          <span className={`font-mono ${t.accent}`} aria-hidden="true">
            ❯
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Prefer the keyboard? Type help"
            aria-label="Terminal command"
            className={`min-w-0 flex-1 border-none bg-transparent font-mono text-sm caret-emerald-500 outline-none ${t.input}`}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />

          {/* Always present so the row never shifts; dimmed when the screen
              is already empty. */}
          <button
            type="button"
            onClick={() => {
              setEntries([]);
              inputRef.current?.focus();
            }}
            disabled={entries.length === 0}
            className={`shrink-0 rounded-md p-1.5 transition-colors disabled:opacity-25 ${t.clearBtn}`}
            aria-label="Clear the screen"
            title="Clear the screen"
          >
            <Trash2 size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactSection;
