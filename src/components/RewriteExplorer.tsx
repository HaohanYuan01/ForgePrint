import { useState } from "react";

// Every string in this file is copied verbatim from the paper's Appendix I
// case studies. `cue` spans are the ones the appendix marks in orange.
type Span = string | { cue: string };

interface Entry {
  id: string;
  label: string;
  note: string;
  /** Labels from the four domain-matched held-out evaluators, in the order
      RoBERTa, DeBERTa, GPT-2, TF-IDF. */
  verdicts: [string, string, string, string];
  spans: Span[];
}

interface CaseData {
  id: string;
  domain: string;
  source: string;
  target: string;
  entries: Entry[];
}

const EVALUATORS = ["RoBERTa", "DeBERTa", "GPT-2", "TF-IDF"] as const;

const CASES: Record<string, CaseData> = {
  success: {
    id: "cnndm_CorpusB:22:Grok_to_Gemini",
    domain: "CNN/DM",
    source: "Grok",
    target: "Gemini",
    entries: [
      {
        id: "source",
        label: "Source summary",
        note: "Written by Grok. All four evaluators read it as Grok.",
        verdicts: ["Grok", "Grok", "Grok", "Grok"],
        spans: [
          "Manchester United will trial MK Dons teenagers Luke Tingey, an 18-year-old defender known for a viral 40-yard free-kick, and Kyran Wiltshire, a lively 18-year-old midfielder. The pair, part of MK Dons\u2019 Youth Alliance South Cup-winning U18 side, will train at Carrington ahead of United\u2019s UEFA U19 Youth League campaign.",
        ],
      },
      {
        id: "target-own",
        label: "Target\u2019s own summary",
        note: "What Gemini itself wrote for the same article. The evaluators never see this during the attack \u2014 it is here only as a reference point.",
        verdicts: ["Gemini", "Grok", "Gemini", "Gemini"],
        spans: [
          "Manchester United will give trials to MK Dons teenagers Luke Tingey and Kyran Wiltshire. Tingey, a central defender, gained attention for a long-range free-kick, while midfielder Wiltshire has been part of MK Dons\u2019 first-team friendlies. Both players, whose U18 team are Youth Alliance South Cup champions, will be assessed at Manchester United\u2019s Carrington training ground to potentially strengthen their squad for the UEFA U19 Youth League.",
        ],
      },
      {
        id: "baseline",
        label: "Aug. zero-shot",
        note: "The strongest published baseline. It adds exclamations and evaluative adjectives, and leaks the trailing brace of its completion template \u2014 so it reads as GPT or Grok, not Gemini.",
        verdicts: ["GPT", "Gemini", "Grok", "Grok"],
        spans: [
          { cue: "Exciting news for football fans!" },
          " Manchester United is set to welcome two rising stars, Luke Tingey and Kyran Wiltshire, to Carrington for a special trial. Tingey, an 18-year-old defender who has already captured attention with a viral 40-yard free-kick, joins Wiltshire, a dynamic 18-year-old midfielder. Both players bring impressive pedigrees from MK Dons\u2019 trophy-winning U18 side, and they will be honing their skills ahead of United\u2019s upcoming UEFA U19 Youth League campaign. ",
          {
            cue: "It\u2019s a fantastic opportunity to witness the next generation of talent in action! }",
          },
        ],
      },
      {
        id: "teacher",
        label: "ForgePrint Teacher",
        note: "Keeps the sentence shape of the source, and stays at Grok for three of the four evaluators.",
        verdicts: ["Grok", "Gemini", "Grok", "Grok"],
        spans: [
          "Manchester United will trial two MK Dons teenagers, Luke Tingey and Kyran Wiltshire, ahead of the club\u2019s UEFA U19 Youth League campaign. Tingey is an 18-year-old defender known for a viral 40-yard free-kick, and Wiltshire is an 18-year-old midfielder. Both players have been part of the MK Dons U18 side that won the Youth Alliance South Cup and are expected to train at Carrington.",
        ],
      },
      {
        id: "student",
        label: "ForgePrint-4B",
        note: "Turns two long sentences into four short ones with one point each, opens with a framing sentence, and drops the free-kick distance and the adjective \u201clively\u201d. Three of the four evaluators now name Gemini.",
        verdicts: ["Gemini", "Gemini", "Gemini", "Grok"],
        spans: [
          {
            cue: "Manchester United is preparing for its upcoming UEFA U19 Youth League campaign by conducting trials of promising young players.",
          },
          " ",
          { cue: "Specifically," },
          " the club will assess 18-year-old defender Luke Tingey and 18-year-old midfielder Kyran Wiltshire. Both players are members of the MK Dons U18 squad that recently won the Youth Alliance South Cup. ",
          { cue: "This trial period will involve" },
          " training sessions at Carrington.",
        ],
      },
    ],
  },
  failure: {
    id: "arxiv_CorpusB:60:Claude_to_Gemini",
    domain: "ArXiv",
    source: "Claude",
    target: "Gemini",
    entries: [
      {
        id: "source",
        label: "Source summary",
        note: "Written by Claude: a markdown outline with a heading and numbered bold points. All four evaluators read it as Claude.",
        verdicts: ["Claude", "Claude", "Claude", "Claude"],
        spans: [
          "# Summary\n\nThis paper investigates the off-shell propagating behavior of photons in atoms during photon-atom scattering using bound-state quantum electrodynamics (QED).\n\n## Main Points:\n\n1. Problem Statement: When photons propagate through optical media, they become \u201coff-shell\u201d (violating the relativistic energy-momentum relation), unlike in vacuum where they are \u201con-shell.\u201d The paper aims to explain this off-shell behavior during photon-atom interactions.\n\n2. Limitations of Existing Models: Standard quantum optics models (Jaynes-Cummings, semi-classical approaches) rely on the electric dipole approximation, which restricts them to long-wavelength light and cannot describe photon propagation within atoms.\n\n3. Proposed Solution: Bound-state QED with S-matrix formalism is more suitable because it handles light-atom interactions at all wavelengths, naturally describes off-shell photon propagation through Feynman propagators, and avoids the electric dipole approximation limitations.\n\n4. Key Findings: Only ground-state bound electrons serve as initial/final S-matrix states; Feynman propagators of bound electrons determine photon propagation properties in atoms; these propagators exhibit superluminal but causality-preserving amplitudes; the framework explains Rayleigh, Compton, and Raman scattering.\n\n5. Experimental Implications: The approach is particularly valuable for studying short-wavelength light (X-rays, gamma rays) interactions with atoms, where traditional approximations fail.",
        ],
      },
      {
        id: "target-own",
        label: "Target\u2019s own summary",
        note: "Gemini\u2019s own summary of the same paper: prose paragraphs opening with \u201cThis paper investigates\u201d.",
        verdicts: ["Gemini", "Gemini", "Gemini", "Gemini"],
        spans: [
          { cue: "This paper investigates" },
          " the \u201coff-shell\u201d behavior of photons propagating within atoms during photon-atom scattering processes, using the framework of bound-state quantum electrodynamics (QED). Traditional quantum optics models, relying on the electric dipole approximation, are limited to long-wavelength light and cannot accurately describe photon propagation within atoms. Bound-state QED, however, offers a more fundamental approach that is valid for all wavelengths and naturally incorporates the off-shell behavior of photons.\n\nThe study utilizes the S-matrix formalism of bound-state QED to analyze photon-atom scattering. It identifies that only ground states of bound electrons are suitable as initial and final states for the S-matrix due to spontaneous emission. Various photon-atom scattering processes, including Rayleigh, Compton, and Raman scattering, are explained through specific Feynman diagrams within this framework. The internal electron lines in these diagrams, represented by Feynman propagators, phenomenally describe the off-shell amplitudes of photons within atoms. These propagators exhibit a superluminal yet causal property, which is linked to the observed superluminal group velocity of light pulses in atomic media.\n\nThe paper also establishes a connection between the bound-state QED approach and the widely used light-atom interaction models in quantum optics, showing that the latter can be viewed as an electric dipole approximation of the former.",
        ],
      },
      {
        id: "teacher",
        label: "ForgePrint Teacher",
        note: "Makes a lighter edit, keeps the source\u2019s opening sentence, adds a reporting frame \u2014 and is read as Gemini by all four evaluators.",
        verdicts: ["Gemini", "Gemini", "Gemini", "Gemini"],
        spans: [
          { cue: "This paper investigates" },
          " the off-shell propagating behavior of photons in atoms during photon-atom scattering using bound-state quantum electrodynamics (QED). While photons in a vacuum are \u201con-shell,\u201d they become \u201coff-shell\u201d when propagating through optical media, a phenomenon this research aims to explain. ",
          { cue: "The study notes that" },
          " standard quantum optics models, such as the Jaynes-Cummings model, are limited by the electric dipole approximation and cannot describe photon propagation within atoms. Instead, the research utilizes bound-state QED with S-matrix formalism, which handles light-atom interactions at all wavelengths and naturally describes off-shell propagation through Feynman propagators. Key findings indicate that Feynman propagators of bound electrons determine photon propagation properties, exhibiting superluminal but causality-preserving amplitudes. This framework successfully explains Rayleigh, Compton, and Raman scattering, offering significant value for studying short-wavelength interactions like X-rays and gamma rays.",
        ],
      },
      {
        id: "student",
        label: "ForgePrint-4B",
        note: "The failure. The Student halves the length, removes every heading and bullet, and writes one dense paragraph opened by participles and closed by \u201cconsequently\u201d \u2014 the GPT register. It leaves Claude, but lands on GPT rather than Gemini: source evasion succeeds, targeted transfer fails.",
        verdicts: ["GPT", "GPT", "GPT", "Grok"],
        spans: [
          "This research investigates the off-shell propagation of photons within atoms during photon-atom scattering, ",
          { cue: "utilizing bound-state quantum electrodynamics (QED)" },
          " to overcome the limitations of standard Jaynes-Cummings and semi-classical models. ",
          { cue: "By employing S-matrix formalism," },
          " the framework avoids the electric dipole approximation and naturally handles light-atom interactions at all wavelengths. Although excited states decay via spontaneous emission, only ground-state bound electrons serve as the initial and final S-matrix states, with their Feynman propagators determining the properties of photon propagation. These propagators exhibit superluminal amplitudes that remain causality-preserving. ",
          { cue: "Consequently," },
          " the framework explains Rayleigh, Compton, and Raman scattering, offering a solution for the study of short-wavelength light interactions with atoms.",
        ],
      },
    ],
  },
};

function Verdicts({
  verdicts,
  target,
  source,
}: {
  verdicts: readonly string[];
  target: string;
  source: string;
}) {
  return (
    <div className="flex flex-row flex-wrap gap-2">
      {EVALUATORS.map((evaluator, i) => {
        const label = verdicts[i];
        const isTarget = label === target;
        const isSource = label === source;
        return (
          <div
            key={evaluator}
            className={[
              "flex items-baseline gap-1.5 rounded-md border px-2.5 py-1 text-sm",
              isTarget
                ? "border-emerald-600/40 bg-emerald-50 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-950 dark:text-emerald-100"
                : isSource
                  ? "border-zinc-400/50 bg-zinc-100 text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                  : "border-amber-600/40 bg-amber-50 text-amber-900 dark:border-amber-400/30 dark:bg-amber-950 dark:text-amber-100",
            ].join(" ")}
          >
            <span className="text-xs opacity-70">{evaluator}</span>
            <span className="font-medium">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function RewriteExplorer({
  variant = "success",
}: {
  variant?: "success" | "failure";
}) {
  const data = CASES[variant];
  const [active, setActive] = useState(data.entries[data.entries.length - 1].id);
  const entry = data.entries.find((e) => e.id === active) ?? data.entries[0];
  const hits = entry.verdicts.filter((v) => v === data.target).length;

  return (
    <div className="not-prose my-8 overflow-hidden rounded-xl border border-zinc-300 dark:border-zinc-700">
      <div className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-zinc-300 bg-zinc-100 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
        <div className="flex items-baseline gap-2 text-sm">
          <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-medium text-white dark:bg-zinc-200 dark:text-zinc-900">
            {data.domain}
          </span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {data.source} <span className="opacity-60">&rarr;</span> {data.target}
          </span>
        </div>
        <code className="text-xs text-zinc-500 dark:text-zinc-400">{data.id}</code>
      </div>

      <div className="flex flex-row flex-wrap gap-1 border-b border-zinc-300 px-2 py-2 dark:border-zinc-700">
        {data.entries.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setActive(e.id)}
            aria-pressed={e.id === active}
            className={[
              "cursor-pointer rounded-md px-3 py-1.5 text-sm transition-colors",
              e.id === active
                ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800",
            ].join(" ")}
          >
            {e.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 px-4 py-4">
        <p className="m-0 text-base whitespace-pre-line text-zinc-800 dark:text-zinc-100">
          {entry.spans.map((span) =>
            typeof span === "string" ? (
              <span key={`t:${span}`}>{span}</span>
            ) : (
              <mark
                key={`c:${span.cue}`}
                className="rounded bg-orange-200/70 px-0.5 text-inherit dark:bg-orange-500/30"
              >
                {span.cue}
              </mark>
            ),
          )}
        </p>

        <div className="space-y-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
          <div className="text-xs tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
            Held-out evaluators &mdash; {hits} of 4 say {data.target}
          </div>
          <Verdicts
            verdicts={entry.verdicts}
            target={data.target}
            source={data.source}
          />
          <p className="m-0 text-sm text-zinc-600 dark:text-zinc-400">{entry.note}</p>
        </div>
      </div>
    </div>
  );
}
