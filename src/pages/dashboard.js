import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useAuth } from '../context/AuthContext';
import styles from './dashboard.module.css';

function ProgressCard({ progress }) {
  const chapters = [
    { key: 'chapter1-intro',                      label: 'Ch 1: Physical AI Intro',       icon: '🤖' },
    { key: 'chapter2-ros2',                        label: 'Ch 2: ROS 2',                   icon: '📡' },
    { key: 'chapter3-digital-twin/gazebo-setup',   label: 'Ch 3: Gazebo Setup',             icon: '🌐' },
    { key: 'chapter4-isaac/isaac-sim-intro',        label: 'Ch 4: Isaac Sim',               icon: '🚀' },
    { key: 'chapter4-isaac/nav2-sim-to-real',       label: 'Ch 4: Nav2',                    icon: '🎯' },
  ];

  const getChapterProgress = (key) => progress.find(p => p.chapter === key);
  const completed = progress.filter(p => p.completed).length;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>📊 Reading Progress</h2>
        <span className={styles.badge}>{completed}/{chapters.length} Completed</span>
      </div>

      <div className={styles.overallBar}>
        <div className={styles.overallFill} style={{ width: `${(completed/chapters.length)*100}%` }} />
      </div>

      <div className={styles.chapterList}>
        {chapters.map(ch => {
          const p = getChapterProgress(ch.key);
          const pct = p ? p.progress_pct : 0;
          return (
            <div key={ch.key} className={styles.chapterItem}>
              <div className={styles.chapterLeft}>
                <span>{ch.icon}</span>
                <span className={styles.chapterLabel}>{ch.label}</span>
              </div>
              <div className={styles.chapterRight}>
                <div className={styles.miniBar}>
                  <div className={styles.miniBarFill}
                    style={{ width: `${pct}%`, background: p?.completed ? '#546B41' : '#99AD7A' }} />
                </div>
                <span className={styles.pctLabel}>
                  {p?.completed ? '✅' : pct > 0 ? `${pct}%` : '⬜'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChatHistoryCard({ history, onClear }) {
  if (!history.length) return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>💬 Chat History</h2>
      <div className={styles.empty}>No chat history yet. Select text on any page and ask the AI!</div>
    </div>
  );

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>💬 Chat History</h2>
        <button className={styles.clearBtn} onClick={onClear}>🗑 Clear</button>
      </div>
      <div className={styles.chatList}>
        {history.slice(0, 10).map((item, i) => (
          <div key={i} className={styles.chatItem}>
            <div className={styles.chatQ}>🙋 {item.question}</div>
            <div className={styles.chatA}>🤖 {item.answer.slice(0, 200)}{item.answer.length > 200 ? '...' : ''}</div>
            <div className={styles.chatMeta}>{new Date(item.created_at).toLocaleDateString()} · {item.chapter}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuizResultsCard({ results }) {
  if (!results.length) return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>🎯 Quiz Results</h2>
      <div className={styles.empty}>No quiz attempts yet. Visit a chapter and take a quiz!</div>
    </div>
  );

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>🎯 Quiz Results</h2>
      <div className={styles.quizList}>
        {results.map((r, i) => {
          const pct = Math.round((r.score / r.total) * 100);
          return (
            <div key={i} className={styles.quizItem}>
              <div className={styles.quizLeft}>
                <div className={styles.quizChapter}>{r.chapter}</div>
                <div className={styles.quizDate}>{new Date(r.created_at).toLocaleDateString()}</div>
              </div>
              <div className={styles.quizScore} style={{ color: pct >= 80 ? '#546B41' : pct >= 60 ? '#C8873A' : '#c0392b' }}>
                {r.score}/{r.total}
                <span className={styles.quizPct}>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, authFetch, loading } = useAuth();
  const [progress, setProgress] = useState([]);
  const [history,  setHistory]  = useState([]);
  const [quiz,     setQuiz]     = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      authFetch('/user/progress').then(r => r.json()),
      authFetch('/user/chat-history').then(r => r.json()),
      authFetch('/user/quiz-results').then(r => r.json()),
    ]).then(([p, c, q]) => {
      setProgress(p.progress || []);
      setHistory(c.history   || []);
      setQuiz(q.results      || []);
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [user]);

  const clearHistory = async () => {
    await authFetch('/user/chat-history', { method: 'DELETE' });
    setHistory([]);
  };

  if (loading || fetching) return (
    <Layout title="Dashboard"><div className={styles.center}>⏳ Loading...</div></Layout>
  );

  if (!user) return null;

  const completedCount = progress.filter(p => p.completed).length;
  const avgQuiz = quiz.length ? Math.round(quiz.reduce((s, r) => s + (r.score/r.total)*100, 0) / quiz.length) : 0;

  return (
    <Layout title="My Dashboard" description="Track your learning progress">
      <div className={styles.page}>
        <div className="container">
          {/* Header */}
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>👋 Welcome, {user.name}!</h1>
              <p className={styles.pageSubtitle}>Track your Physical AI learning journey</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className={styles.statsRow}>
            {[
              { label: 'Chapters Read',  value: completedCount, icon: '📚' },
              { label: 'AI Chats',       value: history.length,  icon: '💬' },
              { label: 'Quizzes Taken',  value: quiz.length,     icon: '🎯' },
              { label: 'Avg Quiz Score', value: `${avgQuiz}%`,   icon: '⭐' },
            ].map(s => (
              <div key={s.label} className={styles.statBox}>
                <span className={styles.statIcon}>{s.icon}</span>
                <span className={styles.statVal}>{s.value}</span>
                <span className={styles.statLbl}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className={styles.grid}>
            <ProgressCard    progress={progress} />
            <QuizResultsCard results={quiz} />
          </div>
          <div className={styles.fullWidth}>
            <ChatHistoryCard history={history} onClear={clearHistory} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
