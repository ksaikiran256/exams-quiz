import { supabase } from '@/lib/supabase'
import TestRunner from '@/components/TestRunner'

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

export default async function Home() {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('source_year', { ascending: true })

  const questions = (data ?? []) as Question[]

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4 md:p-8">
      {error && (
        <div className="w-full max-w-5xl rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
          Error: {error.message}
        </div>
      )}

      {!error && questions.length === 0 && (
        <div className="w-full max-w-5xl rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-800">
          No questions found in the database.
        </div>
      )}

      {!error && questions.length > 0 && (
        <div className="w-full max-w-5xl">
          <TestRunner questions={questions} />
        </div>
      )}
    </main>
  )
}