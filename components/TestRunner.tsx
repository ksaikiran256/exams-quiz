'use client'

import { useEffect, useMemo, useState } from 'react'
import QuizCard from './QuizCard'

type Question = {
  id: string
  question_text: string
  options: string[]
  correct_option_index: number
  marks: number
  topic: string
  difficulty: string
  source_year: number
}

type Props = {
  questions: Question[]
}

export default function TestRunner({ questions }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [marked, setMarked] = useState<Record<string, boolean>>({})
  const [selected, setSelected] = useState<Record<string, number | null>>({})
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60 * 30)

  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1

  useEffect(() => {
    if (isSubmitted) return
    if (timeLeft <= 0) {
      setIsSubmitted(true)
      return
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft, isSubmitted])

  const handleSelectOption = (
    questionId: string,
    optionIndex: number | null
  ) => {
    setSelected(prev => ({
      ...prev,
      [questionId]: optionIndex,
    }))
  }

  const handleToggleMark = (questionId: string) => {
    setMarked(prev => ({
      ...prev,
      [questionId]: !prev[questionId],
    }))
  }

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const jumpToQuestion = (index: number) => {
    setCurrentIndex(index)

    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsPaletteOpen(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const summary = useMemo(() => {
    let attempted = 0
    let markedCount = 0
    let correct = 0
    let wrong = 0
    let totalMarks = 0
    let scoredMarks = 0

    for (const q of questions) {
      totalMarks += q.marks

      const selectedIndex = selected[q.id]
      const isAttempted =
        selectedIndex !== null && selectedIndex !== undefined

      if (isAttempted) {
        attempted += 1

        if (selectedIndex === q.correct_option_index) {
          correct += 1
          scoredMarks += q.marks
        } else {
          wrong += 1
        }
      }

      if (marked[q.id]) {
        markedCount += 1
      }
    }

    const percentage =
      totalMarks > 0 ? ((scoredMarks / totalMarks) * 100).toFixed(1) : '0.0'

    return {
      total: questions.length,
      attempted,
      notAttempted: questions.length - attempted,
      marked: markedCount,
      correct,
      wrong,
      totalMarks,
      scoredMarks,
      percentage,
    }
  }, [questions, selected, marked])

  const handleSubmitTest = () => {
    setShowSubmitModal(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm md:p-8">
          <p className="text-sm font-medium text-green-700">Final Result</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
            Your final score is {summary.scoredMarks} / {summary.totalMarks}
          </h1>
          <p className="mt-2 text-lg text-gray-700">
            Score percentage: {summary.percentage}%
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Test Summary
            </h2>
            <p className="mt-2 text-gray-600">
              Here is the final performance summary of your test.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryCard label="Total Questions" value={summary.total} />
            <SummaryCard label="Attempted" value={summary.attempted} />
            <SummaryCard label="Not Attempted" value={summary.notAttempted} />
            <SummaryCard label="Marked for Review" value={summary.marked} />
            <SummaryCard label="Correct Answers" value={summary.correct} />
            <SummaryCard label="Wrong Answers" value={summary.wrong} />
            <SummaryCard label="Final Score" value={`${summary.scoredMarks} / ${summary.totalMarks}`} />
            <SummaryCard label="Percentage" value={`${summary.percentage}%`} />
            <SummaryCard label="Time Left" value={formatTime(timeLeft)} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="w-full">
        <div
          className={`mx-auto transition-all duration-300 ${
            isPaletteOpen ? 'max-w-7xl' : 'max-w-3xl'
          }`}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div>
              <p className="text-sm text-gray-500">Pyz-Quiz Test</p>
              <p className="text-sm font-medium text-gray-800">
                Question {currentIndex + 1} of {questions.length}
              </p>
            </div>

            <div
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                timeLeft <= 300
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              Time Left: {formatTime(timeLeft)}
            </div>
          </div>

          <div
            className={`grid items-start gap-6 transition-all duration-300 ${
              isPaletteOpen ? 'md:grid-cols-[3fr_1fr]' : 'md:grid-cols-1'
            }`}
          >
            <div className="relative w-full">
              <div className="absolute right-0 top-0 z-10">
                <button
                  type="button"
                  onClick={() => setIsPaletteOpen(true)}
                  className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                >
                  Question Palette
                </button>
              </div>

              <div className="pt-14">
                <QuizCard
                  question={currentQuestion}
                  selectedIndex={selected[currentQuestion.id] ?? null}
                  onSelectOption={(index) =>
                    handleSelectOption(currentQuestion.id, index)
                  }
                  onClearSelection={() =>
                    handleSelectOption(currentQuestion.id, null)
                  }
                />

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={goPrev}
                      disabled={currentIndex === 0}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>

                    <button
                      type="button"
                      onClick={goNext}
                      disabled={currentIndex === questions.length - 1}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>

                    {isLastQuestion && (
                      <button
                        type="button"
                        onClick={() => setShowSubmitModal(true)}
                        className="rounded-lg border border-green-600 bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-700"
                      >
                        Submit Test
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleMark(currentQuestion.id)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      marked[currentQuestion.id]
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-800'
                        : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {marked[currentQuestion.id] ? 'Unmark' : 'Mark for Review'}
                  </button>
                </div>
              </div>
            </div>

            {isPaletteOpen && (
              <aside className="hidden md:block">
                <div className="sticky top-6">
                  <Palette
                    questions={questions}
                    currentIndex={currentIndex}
                    marked={marked}
                    selected={selected}
                    summary={summary}
                    onClose={() => setIsPaletteOpen(false)}
                    onJump={jumpToQuestion}
                    onSubmit={() => setShowSubmitModal(true)}
                  />
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>

      {isPaletteOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 md:hidden">
          <div className="w-full max-w-sm px-4">
            <Palette
              questions={questions}
              currentIndex={currentIndex}
              marked={marked}
              selected={selected}
              summary={summary}
              onClose={() => setIsPaletteOpen(false)}
              onJump={jumpToQuestion}
              onSubmit={() => setShowSubmitModal(true)}
            />
          </div>
        </div>
      )}

      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900">
              Submit test?
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              You have attempted {summary.attempted} out of {summary.total} questions.
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Not attempted: {summary.notAttempted}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Marked for review: {summary.marked}
            </p>

            {summary.notAttempted > 0 && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm font-semibold text-red-700">
                  Warning: You still have {summary.notAttempted} unanswered question{summary.notAttempted === 1 ? '' : 's'}.
                </p>
                <p className="mt-1 text-sm text-red-600">
                  If you submit now, those questions will be counted as not attempted.
                </p>
              </div>
            )}

            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="text-sm text-gray-700">
                Current score based on answered questions: {summary.scoredMarks} / {summary.totalMarks}
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmitTest}
                className="rounded-lg border border-green-600 bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

type PaletteProps = {
  questions: Question[]
  currentIndex: number
  marked: Record<string, boolean>
  selected: Record<string, number | null>
  summary: {
    total: number
    attempted: number
    notAttempted: number
    marked: number
    scoredMarks: number
    totalMarks: number
  }
  onClose: () => void
  onJump: (index: number) => void
  onSubmit: () => void
}

function Palette({
  questions,
  currentIndex,
  marked,
  selected,
  summary,
  onClose,
  onJump,
  onSubmit,
}: PaletteProps) {
  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">
          Question Palette
        </h2>

        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-2 py-1 text-lg leading-none text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
        >
          ×
        </button>
      </div>

      <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
        <p>Attempted: {summary.attempted}</p>
        <p>Not attempted: {summary.notAttempted}</p>
        <p>Marked: {summary.marked}</p>
        <p>Current score: {summary.scoredMarks} / {summary.totalMarks}</p>
      </div>

      <div className="grid grid-cols-4 gap-2 text-sm">
        {questions.map((q, index) => {
          const isCurrent = index === currentIndex
          const isMarked = !!marked[q.id]
          const isAnswered =
            selected[q.id] !== null && selected[q.id] !== undefined

          let classes = 'border-gray-300 bg-white text-gray-800'

          if (isMarked) {
            classes = 'border-yellow-500 bg-yellow-50 text-yellow-800'
          } else if (isAnswered) {
            classes = 'border-green-500 bg-green-50 text-green-800'
          } else if (isCurrent) {
            classes = 'border-blue-600 bg-blue-50 text-blue-900'
          }

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onJump(index)}
              className={`aspect-square rounded-lg border font-semibold transition ${classes}`}
            >
              {index + 1}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onSubmit}
        className="mt-5 w-full rounded-lg border border-green-600 bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
      >
        Submit Test
      </button>

      <div className="mt-5 space-y-2 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded border border-blue-600 bg-blue-50" />
          <span>Current question</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded border border-green-500 bg-green-50" />
          <span>Answered</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded border border-yellow-500 bg-yellow-50" />
          <span>Marked for review</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded border border-gray-300 bg-white" />
          <span>Not answered</span>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}