import Head from "next/head";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8 font-sans">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Poker Tournament Manager
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Ein professionelles Tool zur Verwaltung von Poker-Events, Spielern und
          Chip-Verteilungen.
        </p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <div className="p-6 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors">
          <h2 className="text-xl font-bold mb-2 text-blue-400">
            Status: In Development
          </h2>
          <p className="text-slate-400">
            Aktuell richten wir die Test-Infrastruktur (Jest & Cypress) und die
            Datenmodelle ein.
          </p>
        </div>

        <div className="p-6 bg-slate-800 rounded-xl border border-slate-700 hover:border-emerald-500 transition-colors">
          <h2 className="text-xl font-bold mb-2 text-emerald-400">
            Quality First
          </h2>
          <p className="text-slate-400">
            Entwickelt mit TDD (Test Driven Development) für maximale Stabilität
            und Zuverlässigkeit.
          </p>
        </div>
      </main>

      <footer className="mt-16 text-slate-500 text-sm">
        <p>
          &copy; 2026 - Poker Manager Project - Built with Next.js & MongoDB
        </p>
      </footer>
    </div>
  );
}
