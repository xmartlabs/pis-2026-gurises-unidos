"use client"

import { useRef } from "react"
import type { Project } from "@/lib/projects"
import { formatNumber } from "@/lib/format"

const INTENSITY_LABEL = {
  alta: "Intensidad alta",
  media: "Intensidad media",
  baja: "Intensidad baja",
}

export function ProjectCarousel({
  projects,
}: {
  projects: (Project & { reach: number })[]
}) {
  const trackRef = useRef<HTMLUListElement>(null)

  function scrollByCards(direction: number) {
    const track = trackRef.current
    if (!track) {
      return
    }
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "smooth" })
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Proyectos en curso
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            aria-label="Ver proyectos anteriores"
            className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-2 hover:border-ink-3 hover:text-ink"
          >
            &#8592;
          </button>
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            aria-label="Ver proyectos siguientes"
            className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-2 hover:border-ink-3 hover:text-ink"
          >
            &#8594;
          </button>
        </div>
      </div>
      <ul
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]"
      >
        {projects.map((project) => (
          <li
            key={project.slug}
            className="flex w-72 shrink-0 snap-start flex-col rounded-xl border border-line bg-surface p-5"
          >
            <p className="font-mono text-[11px] text-ink-3">
              {project.territory} · desde {project.startYear}
            </p>
            <h3 className="mt-2 font-display text-lg font-semibold leading-tight">
              {project.name}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-2">
              {project.summary}
            </p>
            <div className="mt-5 flex items-end justify-between border-t border-line pt-3">
              <span className="font-mono text-[11px] text-ink-3">
                {INTENSITY_LABEL[project.intensity]}
              </span>
              <span className="font-display text-xl font-semibold">
                {formatNumber(project.reach)}
                <span className="ml-1 font-sans text-[11px] font-normal text-ink-3">
                  personas
                </span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
