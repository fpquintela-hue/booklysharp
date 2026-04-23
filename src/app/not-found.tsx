import Link from 'next/link'
import * as React from 'react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/40 rounded-3xl flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">404 - PÁXINA NON ATOPADA</h1>
        <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          O que estás a buscar non existe ou foi movido a outra dirección.
        </p>
        <Link 
          href="/"
          className="inline-block w-full py-4 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg active:scale-95"
        >
          Voltar ao inicio
        </Link>
      </div>
    </div>
  )
}
