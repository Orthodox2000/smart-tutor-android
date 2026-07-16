"use client";

import { useEffect, useMemo, useState } from "react";

import type { QuizQuestion } from "@/lib/types";

const QUESTION_TIME = 30;

function getAnalysis(score: number) {
  if (score >= 8) {
    return {
      heading: "Strong exam readiness",
      body: "You are showing strong recall, accuracy, and decision discipline across easy-to-hard questions.",
    };
  }

  if (score >= 5) {
    return {
      heading: "Solid foundation with room to sharpen",
      body: "Your basics are working well. Focus on medium and hard revision rounds to improve speed and confidence.",
    };
  }

  return {
    heading: "Build core revision momentum",
    body: "Your score suggests you should strengthen fundamentals first, then revisit timed practice and explanation review.",
  };
}

export function MockTestGame() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [status, setStatus] = useState<"loading" | "ready" | "review" | "done">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadQuestions = async () => {
      try {
        const response = await fetch("/api/mock-test", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Unable to load mock test.");
        }

        const data = (await response.json()) as { questions: QuizQuestion[] };

        if (active) {
          setQuestions(data.questions);
          setStatus("ready");
          setTimeLeft(QUESTION_TIME);
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : "Unable to load mock test.");
          setStatus("done");
        }
      }
    };

    void loadQuestions();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (status !== "ready" || !questions[currentIndex]) {
      return;
    }

    if (timeLeft <= 0) {
      handleSubmit(null);
      return;
    }

    const timeout = window.setTimeout(() => {
      setTimeLeft((value) => value - 1);
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [status, timeLeft, currentIndex, questions]);

  const currentQuestion = questions[currentIndex];
  const isAnswerLocked = status === "review";
  const score = useMemo(
    () => questions.reduce((total, question, index) => total + (answers[index] === question.answer ? 1 : 0), 0),
    [answers, questions],
  );

  function handleSubmit(forcedAnswer: number | null) {
    if (!currentQuestion) {
      return;
    }

    const answerToStore = forcedAnswer ?? selectedIndex ?? -1;
    const nextAnswers = [...answers];
    nextAnswers[currentIndex] = answerToStore;
    setAnswers(nextAnswers);
    setStatus("review");
  }

  function handleNext() {
    const isLastQuestion = currentIndex === questions.length - 1;

    if (isLastQuestion) {
      setStatus("done");
      return;
    }

    setCurrentIndex((value) => value + 1);
    setSelectedIndex(null);
    setTimeLeft(QUESTION_TIME);
    setStatus("ready");
  }

  function handleRestart() {
    setCurrentIndex(0);
    setSelectedIndex(null);
    setAnswers([]);
    setTimeLeft(QUESTION_TIME);
    setError("");
    setStatus(questions.length ? "ready" : "loading");
  }

  if (status === "loading") {
    return (
      <section className="surface rounded-[2rem] p-8 text-center">
        <p className="section-label">Mock Test</p>
        <h1 className="section-title">Loading interactive general knowledge challenge</h1>
      </section>
    );
  }

  if (status === "done" && error) {
    return (
      <section className="surface rounded-[2rem] p-8">
        <p className="section-label">Mock Test</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--color-heading)]">
          Test could not load
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">{error}</p>
      </section>
    );
  }

  if (status === "done") {
    const analysis = getAnalysis(score);

    return (
      <section className="surface rounded-[2rem] p-8">
        <p className="section-label">Final Result</p>
        <div className="mt-5 grid gap-6 lg:grid-cols-[0.72fr_1fr]">
          <div className="surface-soft rounded-[1.8rem] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Score
            </p>
            <p className="mt-4 text-5xl font-semibold tracking-[-0.06em] text-[var(--color-heading)]">
              {score}/10
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
              Difficulty rises through the test, so stronger finish accuracy matters more for civil-service style preparation.
            </p>
          </div>
          <div className="surface-soft rounded-[1.8rem] p-6">
            <p className="keyword-line">Performance Analysis</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--color-heading)]">
              {analysis.heading}
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">{analysis.body}</p>

            <div className="mt-5 grid gap-3">
              {questions.map((question, index) => (
                <div key={question.id} className="surface rounded-3xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--color-heading)]">
                      Q{index + 1}. {question.category}
                    </p>
                    <span className="pill">
                      {answers[index] === question.answer ? "Correct" : "Review"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                    {question.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button type="button" onClick={handleRestart} className="action-button mt-6 px-6 py-4">
          Restart Mock Test
        </button>
      </section>
    );
  }

  return (
    <section className="surface rounded-[2rem] p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="section-label">Mock Test Arena</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--color-heading)]">
            Indian general knowledge challenge
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
            10 progressive MCQs designed around Indian GK, polity, history, science, and civil-service style basics.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="surface-soft rounded-3xl p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
              Question
            </p>
            <p className="mt-2 text-lg font-semibold text-[var(--color-heading)]">
              {currentIndex + 1} / {questions.length}
            </p>
          </div>
          <div className="surface-soft rounded-3xl p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
              Difficulty
            </p>
            <p className="mt-2 text-lg font-semibold capitalize text-[var(--color-heading)]">
              {currentQuestion?.difficulty}
            </p>
          </div>
          <div className="surface-soft rounded-3xl p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
              Timer
            </p>
            <p className="mt-2 text-lg font-semibold text-[var(--color-heading)]">{timeLeft}s</p>
          </div>
          <div className="surface-soft rounded-3xl p-4 sm:col-span-3 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
              Test State
            </p>
            <p className="mt-2 text-lg font-semibold text-[var(--color-heading)]">
              {isAnswerLocked ? "Answer Locked" : "Select And Lock"}
            </p>
          </div>
        </div>
      </div>

      {currentQuestion ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="surface-soft rounded-[1.8rem] p-6">
            <p className="keyword-line">{currentQuestion.category}</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--color-heading)]">
              {currentQuestion.question}
            </h2>

            <div className="mt-6 grid gap-3">
              {currentQuestion.options.map((option, index) => {
                const storedAnswer = answers[currentIndex];
                const isReview = status === "review";
                const isCorrect = isReview && index === currentQuestion.answer;
                const isWrong = isReview && index === storedAnswer && storedAnswer !== currentQuestion.answer;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => (status === "ready" ? setSelectedIndex(index) : undefined)}
                    className="quiz-option quiz-option-static rounded-3xl border p-4 text-left"
                    data-correct={isCorrect}
                    data-wrong={isWrong}
                    data-selected={selectedIndex === index && status === "ready"}
                    data-locked={selectedIndex === index && status === "review"}
                    disabled={status !== "ready"}
                  >
                    <div className="flex items-center gap-3">
                      <span className="pill">{String.fromCharCode(65 + index)}</span>
                      <div className="min-w-0">
                        <span className="block text-sm font-semibold text-[var(--color-heading)]">{option}</span>
                        {selectedIndex === index && status === "ready" ? (
                          <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                            Selected
                          </span>
                        ) : null}
                        {selectedIndex === index && status === "review" ? (
                          <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                            Locked Answer
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="surface-soft rounded-[1.8rem] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Current Progress
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                Select the best answer before the timer ends. Each question auto-locks once submitted or timed out.
              </p>
              {!isAnswerLocked ? (
                <p className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-highlight)] px-4 py-3 text-sm font-semibold text-[var(--color-heading)]">
                  {selectedIndex === null
                    ? "No option selected yet."
                    : `Option ${String.fromCharCode(65 + selectedIndex)} is selected and ready to lock.`}
                </p>
              ) : null}

              {status === "review" ? (
                <>
                  <p className="mt-4 text-sm font-semibold text-[var(--color-heading)]">
                    Correct answer: {currentQuestion.options[currentQuestion.answer]}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                    {currentQuestion.explanation}
                  </p>
                </>
              ) : null}
            </div>

            <div className="surface-soft rounded-[1.8rem] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Controls
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {status === "ready" ? (
                  <button
                    type="button"
                    onClick={() => handleSubmit(selectedIndex)}
                    className="action-button px-6 py-4"
                    disabled={selectedIndex === null}
                  >
                    Lock Test Answer
                  </button>
                ) : (
                  <button type="button" onClick={handleNext} className="action-button px-6 py-4">
                    {currentIndex === questions.length - 1 ? "View Result" : "Next Question"}
                  </button>
                )}

                <button type="button" onClick={handleRestart} className="surface px-6 py-4 rounded-full font-semibold text-[var(--color-heading)]">
                  Reset Game
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
