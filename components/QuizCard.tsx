'use client'

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
  question: Question
  selectedIndex: number | null
  onSelectOption: (index: number) => void
  onClearSelection: () => void
}

export default function QuizCard({
  question,
  selectedIndex,
  onSelectOption,
  onClearSelection,
}: Props) {
  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-lg md:p-8">
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
          {question.marks} mark{question.marks === 1 ? '' : 's'}
        </span>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold leading-relaxed text-gray-900">
            {question.question_text}
          </h2>
        </div>

        <div className="grid gap-3">
          {question.options.map((option, index) => {
            const isSelected = selectedIndex === index

            return (
              <button
                key={index}
                type="button"
                onClick={() => onSelectOption(index)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2 font-medium">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </button>
            )
          })}
        </div>

        <div>
          <button
            type="button"
            onClick={onClearSelection}
            disabled={selectedIndex === null}
            className="text-sm font-medium text-blue-700 underline underline-offset-2 transition hover:text-blue-900 disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
          >
            Clear selection
          </button>
        </div>
      </div>
    </div>
  )
}