import {
  SiPytorch,
  SiHuggingface,
  SiPython,
  SiJavascript,
  SiNodedotjs,
  SiC,
  SiExpress,
  SiSupabase,
  SiPostgresql,
  SiReact,
  SiRedis,
  SiGit,
  SiGithub,
  SiLinux,
  SiDocker,
  SiKde,
  SiKalilinux,
  SiPopos,
  SiNumpy,
  SiPandas,
  SiTensorflow,
  SiCloudflare,
  SiFastapi,
  SiDotnet,
  SiGo,
  SiVite,
  SiRust,
  SiTypescript,
  SiScikitlearn,
} from 'react-icons/si';
import { FaJava, FaWindows } from 'react-icons/fa6';

// The status pill under the hero's intro line. Empty hides it.
export const status = 'open to AI/ML and research internships, and freelance work';

// canonical host; the bare domain 301s here
export const SITE = 'https://www.algorithmicbit.tech';

//socials
export const socials = [
  { label: 'GitHub', href: 'https://github.com/ManasDasri', type: 'github', username: 'ManasDasri' },
  {
    label: 'X',
    href: 'https://x.com/ManasDmg9',
    type: 'static',
    name: 'Manas D',
    handle: '@ManasDmg9',
    note: 'CS undergrad, Building Systems',
    avatar: '/berserk-pfp.jpg',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/manas-dasari-2a52163a5/',
    type: 'static',
    name: 'Manas',
    handle: 'CS undergrad · Amrita School of Engineering',
    note: 'Connect for work, internships, or collabs.',
  },
  {
    label: 'LeetCode',
    href: 'https://leetcode.com/u/ManasDasari/',
    type: 'static', 
    name: 'Manas',
    handle: '@ManasDasari',
    note: 'Sharpening DSA fundamentals daily in Python.',
    avatar: '/img.jpeg',
  },
  {
    label: 'Reddit',
    href: 'https://reddit.com/u/KenX049',
    type: 'static',
    name: 'Manas',
    handle: 'u/KenX049',
    note: 'Lurking in Linux and fintech subreddits.',
    avatar: '/pcii.jpg',
  },
];

// "Now" section. `href` is optional; `note` renders dimmer after the text.
export const now = [
  {
    label: 'Shipping',
    items: [
      { text: 'Sprout', note: 'codebase maps for developers and AI agents', href: 'https://github.com/Sprout-DevLabs/sprout' },
      { text: 'Flow', note: 'virtual study rooms', href: 'https://flow-study.me' },
      { text: 'Atmos', note: 'air quality sensor placement', href: 'https://github.com/ManasDasri/Atmos' },
      { text: 'Gradient Works', note: 'my applied AI studio, taking projects', href: 'https://gradientworksai.in/' },
      { text: 'Forme', note: 'motion components for React, free', href: 'https://forme.vercel.app' },
    ],
  },
  {
    label: 'Exploring',
    items: [
      { text: 'Velora', note: 'Monte Carlo market forecasting', href: '/projects/velora/' },
      { text: 'A live 3D physics engine' },
      { text: 'An ML life simulator', note: 'simple survival rules' },
    ],
  },
  {
    label: 'Competing',
    items: [
      { text: 'Kaggle' },
      { text: 'Hack2skill' },
      { text: 'WeMakeDevs' },
      { text: 'Guidewire DEVTrails' },
    ],
  },
  {
    label: 'Contributing',
    items: [
      { text: 'Exercism/vbnet', href: 'https://github.com/exercism/vbnet' },
      { text: 'DSA daily on LeetCode', note: 'in Python', href: 'https://leetcode.com/u/ManasDasari/' },
    ],
  },
  {
    label: 'Events',
    items: [
      { text: 'IndiaFOSS 2026, Bengaluru', note: 'attended' },
      { text: 'Bangalore Tech Summit 2025', note: 'attended' },
    ],
  },
  {
    label: 'Off the keyboard',
    items: [
      { text: 'Animal welfare outreach with Barket', note: 'weekend events' },
      { text: 'KDE Plasma ricing on Linux' },
      { text: 'Following markets and trading systems' },
    ],
  },
];

// Reading. kind: 'book' (in progress, progress 0-100), 'read' (finished this year)
// or 'paper' (href to read it). The section and its dock item only appear while
// this list has entries.
export const reading = [
  { kind: 'read', title: 'The Alchemist', author: 'Paulo Coelho' },
  { kind: 'read', title: 'Butter', author: 'Asako Yuzuki' },
  { kind: 'read', title: 'Zen: The Art of Simple Living', author: 'Shunmyo Masuno' },
  { kind: 'read', title: 'The Fifth Hour', author: 'Rahul Jain' },
  { kind: 'read', title: 'The Silent Patient', author: 'Alex Michaelides' },
  { kind: 'read', title: 'Meditations', author: 'Marcus Aurelius' },
  { kind: 'read', title: 'The Stoic Path to Wealth', author: 'Darius Foroux' },
  { kind: 'read', title: 'The Art of Thinking Clearly', author: 'Rolf Dobelli' },
  { kind: 'paper', title: 'Attention Is All You Need', author: 'Vaswani et al., 2017', href: 'https://arxiv.org/abs/1706.03762' },
  { kind: 'paper', title: 'Deep Residual Learning for Image Recognition', author: 'He et al., 2015', href: 'https://arxiv.org/abs/1512.03385' },
  { kind: 'paper', title: 'Adam: A Method for Stochastic Optimization', author: 'Kingma and Ba, 2014', href: 'https://arxiv.org/abs/1412.6980' },
  { kind: 'paper', title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding', author: 'Devlin et al., 2018', href: 'https://arxiv.org/abs/1810.04805' },
  { kind: 'paper', title: 'Language Models are Few-Shot Learners', author: 'Brown et al., 2020', href: 'https://arxiv.org/abs/2005.14165' },
  { kind: 'paper', title: 'Bitcoin: A Peer-to-Peer Electronic Cash System', author: 'Satoshi Nakamoto, 2008', href: 'https://bitcoin.org/bitcoin.pdf' },
];

// Now playing, from Last.fm (Spotify connected at last.fm/settings/applications).
// apiKey is Last.fm's read-only public key from last.fm/api/account/create; the shared
// secret is never needed. Empty values hide the line under the name.
export const lastfm = { user: 'KenX049', apiKey: '1c3023e7d6acb40d8c3981561cdb9386' };

export const projects = [
  {
    name: 'Clause Risk Review',
    status: 'results published',
    badge: 'research',
    active: true,
    featured: 1,
    tagline: 'Does legal pretraining help a model find risky contract clauses?',
    description:
      'Multi-label classification of commercial contract clauses into six risk categories on CUAD v1, 510 contracts annotated by lawyers. A TextCNN baseline, BERT and Legal-BERT train on identical word windows and per-contract splits, and are scored per window and per contract, with every threshold tuned on validation data only.',
    problem: 'Contracts are long (97% exceed BERT’s 512-token window) and each label appears in only 1.5–4.2% of windows, so a model that flags nothing would score above 95% accuracy.',
    built: 'A leakage-safe pipeline: splits per contract, identical windows for every model, per-label thresholds from validation, noisy-OR pooling up to the contract, and 90 tests that pin each of those decisions.',
    tags: [
      { label: 'Python', icon: SiPython },
      { label: 'PyTorch', icon: SiPytorch },
      { label: 'Transformers', icon: SiHuggingface },
      { label: 'NLP', icon: null },
    ],
    link: 'https://kenx049-clause-risk-review.static.hf.space/index.html',
    linkLabel: 'results dashboard',
    statusUrl: 'https://kenx049-clause-risk-review.static.hf.space/index.html',
    repoUrl: 'https://github.com/ManasDasri/NNDL',
    slug: 'clause-risk-review',
    started: '2026-08',
    kind: 'NLP research',
    features: [
      'Six labels: Cap on Liability, Non-Compete, License Grant, Audit Rights, Termination for Convenience, Insurance',
      'Splits assigned per contract and saved to disk, so overlapping windows never straddle train and test, and every model is scored on the same 76 contracts',
      'Windows counted in words, not tokens, so all models see identical boundaries and a score gap is a gap between models',
      'Per-label thresholds (0.22 to 0.83) tuned on validation, never on test',
      'Noisy-OR pooling from windows to contracts, chosen after measuring seven pooling rules and a learned aggregator',
      'A demo that flags passages and, for the CNN, the exact phrases that triggered each flag',
      '90 tests that run as plain scripts, including one showing accuracy would rate an all-negative model above 95%',
    ],
    layers: [
      { label: 'Data', nodes: ['CUAD v1: 510 contracts', 'spans by category', 'splits per contract, saved'] },
      { label: 'Model', nodes: ['overlapping word windows', 'TextCNN · BERT · Legal-BERT', 'one shared training loop'] },
      { label: 'Evaluate', nodes: ['thresholds from validation', 'noisy-OR pooling to the contract', 'window and document scores'] },
    ],
    study: {
      question:
        'BERT and Legal-BERT share an architecture, a parameter count (109,486,854), a context window and a chunk width; they differ only in pretraining corpus. So any gap between them measures domain adaptation. The prediction: the gain should concentrate in labels carried by legal vocabulary.',
      data: [
        'CUAD v1 (The Atticus Project): 510 commercial contracts, clause spans annotated by lawyers',
        'Median contract 5,039 words, longest 47,733; 85% of windows carry no label',
        'Held-out test split: 76 contracts, 3,314 windows, never seen in training',
      ],
      results: {
        caption: 'Held-out test split. Document scores pool each contract’s windows with noisy-OR. AP is average precision.',
        columns: ['Model', 'Window F1', 'Window AP', 'Document F1', 'Document AP'],
        rows: [
          ['TextCNN', '0.663', '—', '0.846', '0.904'],
          ['BERT', '0.723', '0.736', '0.879', '0.933'],
          ['Legal-BERT (one seed)', '0.718', '0.769', '0.875', '0.936'],
          ['Longformer', 'awaiting a GPU run'],
        ],
      },
      findings: [
        { verdict: 'not supported', text: 'No measurable advantage from legal pretraining. Legal-BERT is 0.005 below BERT on window F1, while BERT re-run with a second seed moved 0.006 from itself; the two tie at contract level.' },
        { verdict: 'not supported', text: 'The per-label prediction did not hold: the one clear gain is Termination for Convenience (+0.064 F1), and Cap on Liability, the most jargon-heavy label, gained nothing.' },
        { verdict: 'supported', text: 'Both transformers clearly beat the CNN, most on Non-Compete, the rarest and hardest label.' },
        { verdict: 'measured', text: 'Pooling matters as much as the model: plain averaging scores 0.511 document macro F1 against noisy-OR’s 0.846, because a real clause is diluted across windows that rightly contain nothing.' },
      ],
      limitations: [
        'Legal-BERT has one seed so far; run-to-run variance is about ±0.03 macro F1, so smaller differences are not evidence either way.',
        'The Longformer comparison (does more context per window help?) has not been run.',
        'The CNN’s attributions show it flags Cap on Liability on the word “liability” in insurance clauses, not on capping language.',
      ],
      reproduce: [
        'pip install -e ".[analysis]"',
        'legal-risk-prepare',
        'legal-risk-train-cnn --epochs 12',
        'legal-risk-train-transformer',
        'legal-risk-evaluate --run_dir outputs/cnn --split test',
      ],
      sources: [
        { label: 'README and results', href: 'https://github.com/ManasDasri/NNDL#results' },
        { label: 'Why BERT and Legal-BERT', href: 'https://github.com/ManasDasri/NNDL/blob/main/docs/model-selection.md' },
        { label: 'Pooling rules compared', href: 'https://github.com/ManasDasri/NNDL/blob/main/docs/pooling.md' },
        { label: 'Results chapter of the handbook', href: 'https://github.com/ManasDasri/NNDL/blob/main/handbook/12-results.md' },
        { label: 'Results dashboard', href: 'https://kenx049-clause-risk-review.static.hf.space/index.html' },
      ],
      reviewed: '2026-11-08',
    },
  },
  {
    name: 'Med-EEG',
    status: 'results published',
    badge: 'research',
    active: true,
    featured: 2,
    tagline: 'Can two EEG numbers track a meditator’s focus?',
    description:
      'A retrospective study of meditation EEG: can the gamma/theta power ratio and theta–gamma phase-amplitude coupling at a few frontal electrodes predict self-reported concentration nearly as well as a model on the full 64-channel spectrum? Every score is set against chance from permutations and against non-EEG baselines, with a pre-registered replication on a second dataset. NeuroDial is its live results dashboard.',
    problem: 'Small EEG studies report accuracies that rarely mean much: with 24 people, a model with no signal reaches 70% accuracy about 8% of the time, and a group label can hide a confound.',
    built: 'An MNE pipeline from raw EEG to features, person-held-out models with permutation tests and non-EEG baselines, mixed-effects statistics, a pre-registered replication, and NeuroDial, a dashboard that loads the latest published run.',
    tags: [
      { label: 'Python', icon: SiPython },
      { label: 'MNE', icon: null },
      { label: 'scikit-learn', icon: null },
      { label: 'statsmodels', icon: null },
    ],
    link: 'https://www.algorithmicbit.tech/neurodial/',
    linkLabel: 'NeuroDial dashboard',
    statusUrl: 'https://www.algorithmicbit.tech/neurodial/',
    repoUrl: 'https://github.com/ManasDasri/Med-EEG',
    slug: 'med-eeg',
    started: '2026-07',
    kind: 'EEG research',
    features: [
      'Preprocessing: 1–45 Hz bandpass, mains notch, bad channels found and interpolated, average reference, ICA for eye and muscle',
      '2-second epochs before each self-report probe, never overlapping the previous probe’s question',
      'Features per region: band power, the gamma/theta ratio, 1/f slope, alpha asymmetry, and theta–gamma coupling (Tort modulation index, surrogate-corrected)',
      'Leave-one-subject-out models, each compared with shuffled-label runs and non-EEG baselines, p-values Holm-corrected',
      'Linear mixed-effects models with subject as a random effect and time on task as a covariate',
      'A pre-registered replication on a second dataset, written before any of its EEG was loaded',
      'NeuroDial: a dashboard that reads results.json from the repository, so it always shows the latest published run',
    ],
    layers: [
      { label: 'Raw', nodes: ['OpenNeuro ds001787, 64-channel BioSemi', 'self-report probes every ~2 min'] },
      { label: 'Clean', nodes: ['filter, notch, bad channels', 'average reference, ICA', 'epochs before each probe'] },
      { label: 'Test', nodes: ['spectral and coupling features', 'LOSO models vs chance and baselines', 'mixed-effects stats, replication'] },
    ],
    study: {
      question:
        'Can a two-number biomarker, the gamma/theta power ratio and theta–gamma phase-amplitude coupling at a few frontal-midline electrodes, predict moment-to-moment self-reported concentration nearly as well as a black-box model on the full 64-channel spectrum?',
      data: [
        'OpenNeuro ds001787 (Delorme & Brandmeyer): 24 people, 12 experienced meditators and 12 novices, 64-channel EEG, about an hour of meditation each',
        'One person excluded for poor electrode contact by a rule set before any results: 23 people, 929 probes',
        'Replication on OpenNeuro ds008836: 39 experienced Vipassana meditators, a different lab, EEG system and rating scale; 1,707 depth reports',
      ],
      results: {
        caption: 'ds001787, leave-one-subject-out. 200 permutations per model; p-values Holm-corrected across models and baselines within each question.',
        columns: ['Question', 'Best EEG result', 'Non-EEG baseline', 'Verdict'],
        rows: [
          ['Expert vs novice', '78.3% of people (18/23), corrected p = 0.10', 'sex alone: 82.6%', 'not supported'],
          ['Concentration, moment to moment', 'within-person AUC 0.529, corrected p = 0.64', 'time on task: 0.561', 'no signal'],
          ['Mind wandering, moment to moment', 'within-person AUC 0.587, corrected p = 0.060', 'time on task: 0.533', 'weak'],
        ],
      },
      findings: [
        { verdict: 'not supported', text: 'Expert vs novice is confounded: experts are 9 of 11 male and novices 10 of 12 female, and sex alone predicts better than the EEG model, which mostly detects sex.' },
        { verdict: 'not replicated', text: 'The pre-registered gamma/theta prediction on ds008836: the slope is negative as predicted but not significant (one-sided p = 0.064). An earlier “replicated” verdict rested on a model fit that never converged, and was withdrawn.' },
        { verdict: 'supported', text: 'On ds008836, a Riemannian model on each report’s 64-channel covariance separates a person’s deeper reports from their shallower ones: within-person AUC 0.609 (95% 0.565–0.649, chance 0.502, Holm p = 0.035). Modest, and people vary a lot.' },
        { verdict: 'supported', text: 'Pre-registered: the depth a meditator is about to report is already in their EEG 60–120 s before the report (AUC 0.584, Holm p = 0.020).' },
      ],
      limitations: [
        'Expertise is confounded with sex, and partly age, in ds001787; only a sex-balanced sample can answer the expertise question.',
        'Self-reports are subjective and arrive every ~90 s, so the labels are noisy.',
        'Scalp gamma (30–45 Hz) can’t be fully separated from muscle activity.',
        '23 usable people is small; every result is hypothesis-generating.',
        'Retrospective only: the held-out person’s full recording is used for normalisation, so these scores say nothing about a live neurofeedback device.',
      ],
      reproduce: [
        'pip install -r requirements.txt -c constraints.txt',
        'python scripts/download_dataset.py --dataset ds001787 --bids_root ../ds001787',
        'python scripts/run_pipeline.py --dataset ds001787 --bids_root ../ds001787 --run_dir ../runs/discovery-001 --n_permutations 100',
        'python scripts/run_tests.py',
      ],
      sources: [
        { label: 'README and results', href: 'https://github.com/ManasDasri/Med-EEG#results-all-24-subjects' },
        { label: 'Published results (results.json)', href: 'https://github.com/ManasDasri/Med-EEG/blob/main/results/latest/results.json' },
        { label: 'Replication pre-registration', href: 'https://github.com/ManasDasri/Med-EEG/blob/main/docs/preregistration_ds008836.md' },
        { label: 'Replication results', href: 'https://github.com/ManasDasri/Med-EEG/blob/main/docs/replication_ds008836_results.md' },
        { label: 'Depth decoding results', href: 'https://github.com/ManasDasri/Med-EEG/blob/main/docs/depth_decoding_results.md' },
        { label: 'NeuroDial dashboard', href: 'https://www.algorithmicbit.tech/neurodial/' },
      ],
      reviewed: '2026-11-08',
    },
  },
  {
    name: 'Forme',
    status: 'live',
    badge: 'free',
    active: true,
    tagline: 'Components for interfaces that glow.',
    description:
      'A motion component library for React: 52 free components (shaders, ASCII scenes, HUD instruments, buttons, inputs, loaders and more) that you install as source you own, with one command. Each component’s accessibility badges are tests: CI fails if a claimed behaviour has no evidence in its code.',
    problem: 'Distinctive motion pieces like shaders and ASCII scenes usually come as demos you can’t install, and it’s hard to tell whether a library’s accessibility claims hold.',
    built: 'A library of 52 React components you install as source with one shadcn command, whose accessibility badges are tests that fail when the code doesn’t back them up.',
    tags: [
      { label: 'React', icon: SiReact },
      { label: 'TypeScript', icon: SiTypescript },
      { label: 'WebGL', icon: null },
      { label: 'shadcn registry', icon: null },
    ],
    link: 'https://forme.vercel.app',
    statusUrl: 'https://forme.vercel.app/',
    repoUrl: 'https://github.com/ManasDasri/forme',
    slug: 'forme',
    screenshots: [
      { src: '/projects/forme-home.jpg', alt: 'Forme’s homepage: “Components for interfaces that glow.” over a starfield, with a planet’s glowing horizon below' },
      { src: '/projects/forme-components.jpg', alt: 'The components page: 52 components for React in ten categories, each card showing a live preview and its gzipped size' },
      { src: '/projects/forme-doc.jpg', alt: 'The ASCII black hole’s page: a black hole drawn in dense characters, with its checked badges (reduced motion, pauses offscreen, pause control, zero deps) and size' },
    ],
    started: '2026-11',
    kind: 'Component library',
    features: [
      'Signal, the first drop: 52 components in ten categories (buttons, shaders, ASCII, HUD, surfaces, inputs, loaders, navigation, feedback, text), all free',
      'Each installs as source with one command: npx shadcn@latest add https://forme.vercel.app/r/<name>.json',
      'WebGL shaders such as Horizon, Aurora and Caustic glass, sharing one small canvas helper',
      'ASCII pieces: a banner, a tide, a reveal, a black hole and a planet',
      'Trait badges (reduced motion, keyboard, pauses offscreen, pause control, WebGL fallback, zero deps) that tests check against each component’s source',
      'Measured sizes: every file the CLI would copy is gzipped at build, and the site shows the number',
      'An install smoke test on every pull request: fresh Next.js and Vite apps install every component, build in strict TypeScript and render each one in Chromium',
    ],
    layers: [
      { label: 'Source', nodes: ['src/registry/: the components', 'src/catalog.ts: metadata and traits'] },
      { label: 'Build', nodes: ['registry JSON for the shadcn CLI', 'gzipped sizes', 'trait tests against the source'] },
      { label: 'Ship', nodes: ['Vercel: the site and the /r/ registry', 'CI: install smoke test in Next.js and Vite'] },
    ],
  },
  {
    name: 'Sprout',
    status: 'shipped',
    active: true,
    featured: 3,
    tagline: 'Map your codebase, for you and your AI agent.',
    problem: 'Opening an unfamiliar codebase means guessing which files matter, and AI agents burn their context window reading the wrong ones.',
    built: 'A single Go binary that draws gitignore-aware trees with git history, suggests a reading order, and hands agents a token-budgeted project map over MCP.',
    description:
      'A fast, single-binary directory explorer in Go, built around how developers actually read projects. Trees that respect .gitignore, pull requests rendered as trees, commit hotspots, a suggested reading order, token-budgeted project maps for LLMs, and an MCP server so coding agents can use it directly.',
    tags: [
      { label: 'Go', icon: SiGo },
      { label: 'CLI', icon: null },
      { label: 'MCP', icon: null },
      { label: 'LLM tooling', icon: null },
    ],
    link: 'https://sprout-devlabs.github.io/sprout-web/',
    statusUrl: 'https://sprout-devlabs.github.io/sprout-web/',
    repo: 'Sprout-DevLabs/sprout',
    version: 'v0.2.0', // fallback; the card fetches the latest release
    slug: 'sprout',
    started: '2026-09',
    kind: 'Developer tool',
    features: [
      'Trees that respect .gitignore (it asks git itself, so nested ignores and negations work) and say how much they hid',
      'Git changes, 90-day commit hotspots and true folder sizes shown in the tree',
      'Pull requests rendered as trees: sprout --diff main...HEAD',
      'A suggested reading order for an unfamiliar project: sprout --entry',
      '--ai: a structure-first project map for LLMs, sized to a token budget, with the most-used files and their signatures',
      'Runs as an MCP server so coding agents can call it directly',
      'Works on repos you have not cloned: sprout github.com/owner/repo',
    ],
    layers: [
      { label: 'Input', nodes: ['your project, or a GitHub URL', 'git: ignores, changes, 90-day history'] },
      { label: 'Analysis', nodes: ['gitignore-aware walk', 'hotspots and sizes', 'usage graph: key files and signatures'] },
      { label: 'Output', nodes: ['terminal tree', '--ai project map', 'MCP server for agents'] },
    ],
  },
  {
    name: 'Gradient Works',
    status: 'taking projects',
    badge: 'services',
    active: true,
    tagline: 'Applied AI research and model engineering.',
    problem: 'Startups, labs and small teams need custom models but rarely have the research depth to build them and evaluate them honestly.',
    built: 'A studio with a fixed-scope, four-week process: a scoping call, a baseline to beat, tracked experiments, held-out testing and a full handover of code and weights.',
    description:
      'An applied AI studio I founded. It designs, trains and tests custom machine learning models for startups, research labs and small teams: every engagement has a defined metric, a baseline to beat, held-out testing and a written result, and the client keeps all the code and weights.',
    tags: [
      { label: 'PyTorch', icon: SiPytorch },
      { label: 'Hugging Face', icon: SiHuggingface },
      { label: 'FastAPI', icon: SiFastapi },
    ],
    link: 'https://gradientworksai.in/',
    statusUrl: 'https://gradientworksai.in/',
    repoUrl: 'https://github.com/gradient-works-ai',
    slug: 'gradient-works',
    screenshots: [
      { src: '/projects/gradient-works-home.jpg', alt: "Gradient Works' homepage: an applied AI studio for teams that want research depth and honest evaluation, with a live confusion matrix and ROC curve" },
      { src: '/projects/gradient-works-services.jpg', alt: 'The four services: custom model builds, testing and evaluation, research and prototyping, AI-native features' },
    ],
    started: '2026-10',
    kind: 'Applied AI studio',
    features: [
      'Custom model builds: tabular prediction, computer vision, time series and biosignals, small LLM fine-tuning',
      'Testing and evaluation: benchmark design, bias and robustness checks, LLM evals and red-teaming, audit reports',
      'Research and prototyping: literature reviews, paper reproduction, baselines and feasibility studies',
      'AI-native features: RAG over your documents, agents and automation, model APIs, data pipelines',
      'A four-week sprint from a free scoping call to handover, with tracked experiments shared every week',
      'Fixed scope and price; the client owns the code, weights, notebooks and report, with nothing hosted on our side',
      'A lab that ships open models between client projects, starting with NeuroDial for EEG classification',
    ],
    layers: [
      { label: 'Scope', nodes: ['free 30-minute call', 'problem statement and success metric', 'data audit'] },
      { label: 'Build', nodes: ['baseline model and reference score', 'tracked experiments, weekly updates'] },
      { label: 'Ship', nodes: ['held-out testing and failure analysis', 'code, weights and evaluation report', 'handover call'] },
    ],
  },
  {
    name: 'Flow',
    status: 'live in dev',
    active: true,
    description:
      'A virtual study room web app for focused, shared work sessions — task tracking, live presence, and cross-network video calling built on Express.js, vanilla JS, Supabase, and WebRTC (with Cloudflare Realtime TURN for reliable connections across networks).',
    tags: [
      {label: 'Express.js', icon: SiExpress},
      {label: 'Supabase', icon: SiSupabase},
      {label: 'WebRTC', icon: null},
      {label: 'Cloudflare', icon: SiCloudflare}
    ],
    link: 'https://flow-study.me',
    statusUrl: 'https://flow-study.me/',
    repoUrl: 'https://github.com/ManasDasri/Flow-study',
    slug: 'flow',
    screenshots: [
      { src: '/projects/flow-room.jpg', alt: 'A Flow study room: who is in it, room audio from YouTube or Spotify, the video tile, the session timer, and shared tasks and chat' },
      { src: '/projects/flow-login.jpg', alt: "Flow's login: “A space to think. A rhythm to work.”, with a timer preview and an atmosphere picker" },
      { src: '/projects/flow-lobby.jpg', alt: "Flow's lobby: join a room with its 6-character code and optional PIN, or create one" },
    ],
    started: '2026-06',
    kind: 'Real-time web app',
    tagline: 'Study better, together.',
    problem: 'Studying remotely with friends means juggling a video call, a timer, a to-do list and music across separate apps.',
    built: 'One room, joined with a 6-character code, with peer-to-peer video, a synced pomodoro timer, shared tasks, synced music and an AI in the chat.',
    features: [
      'Rooms you join with a 6-character code; state syncs through Supabase Realtime instead of a WebSocket server',
      'Peer-to-peer WebRTC video, relayed through Cloudflare Realtime TURN when networks block direct connections',
      'A synchronised pomodoro timer: if one person pauses, everyone pauses',
      'Shared tasks with a live progress bar, stored in Postgres',
      'Type /ai in the room chat and a Groq-hosted Llama 3 model answers for the whole room',
      'Lo-fi music through YouTube: paste a link and it plays in sync for the whole room',
    ],
    layers: [
      { label: 'Browser', nodes: ['vanilla JS app (ES modules)', 'WebRTC video, peer to peer'] },
      { label: 'Realtime', nodes: ['Supabase Realtime: room state, chat, signalling', 'Cloudflare Realtime TURN relay'] },
      { label: 'Server and data', nodes: ['Express: static files and the /ai endpoint', 'Groq: Llama 3', 'Supabase Postgres: rooms, tasks, sessions (row-level security)'] },
    ],
  },

  {
    name: 'Atmos',
    status: 'live in dev',
    active: true,
    featured: 4,
    description: 'Atmos is a Python + FastAPI project that simulates and optimizes air quality sensor placement across the city. The system combines real-time WAQI data, traffic-weighted zone analysis, and optimization algorithms to propose an efficient sensor network that is cheaper and more effective than the existing CAAQMS stations.',
    tags: [
      {label: 'Python', icon: SiPython},
      {label: 'FastAPI',  icon: SiFastapi},
      {label: 'JavaScript', icon: SiJavascript},
    ],
    link: 'https://github.com/ManasDasri/Atmos',
    slug: 'atmos',
    started: '2025-12',
    kind: 'Optimisation model',
    tagline: 'A cheaper, denser air quality network for Bengaluru.',
    problem: 'Bengaluru\'s 14 CAAQMS stations are expensive and sparse, leaving much of the city without a nearby air quality reading.',
    built: 'A FastAPI model that combines live WAQI data, traffic-weighted zones and an optimiser to place a cheaper, denser sensor network, compared side by side with the existing stations.',
    features: [
      'Live PM2.5 and AQI readings for Bengaluru from the WAQI API, with realistic fallback data if the API is down',
      'Traffic-weighted zones, so sensors go where people and pollution actually are',
      'A hybrid optimiser using the Bounding Phase method and Golden Ratio search',
      'An interactive map of sensor coverage and PM2.5 per zone',
      'A side-by-side comparison against the 14 existing CAAQMS stations',
      'AQI lookup per neighbourhood, zone statistics, and a guide to PM2.5 safety',
    ],
    layers: [
      { label: 'Data', nodes: ['WAQI live PM2.5 / AQI', 'fallback data generator'] },
      { label: 'Model', nodes: ['traffic-weighted zones', 'Bounding Phase + Golden Ratio search', 'proportional sensor allocation'] },
      { label: 'App', nodes: ['FastAPI JSON API: /api/model, /api/optimize, /api/stats', 'Jinja2 pages: map, compare, zone lookup'] },
    ],
  },

  {
    name: 'Velora',
    status: 'live',
    active: true,
    description:
      'A stochastic market forecasting platform. It models a stock’s terminal price distribution with Monte Carlo simulation (up to 1,000 paths), Geometric Brownian Motion and a 3-state Markov chain, then adjusts its risk assumptions using LLaMA 3.3 sentiment on live headlines.',
    tags: [
      { label: 'React', icon: SiReact },
      { label: 'Vite', icon: SiVite },
      { label: 'Monte Carlo', icon: null },
    ],
    link: 'https://velora-one-lake.vercel.app',
    statusUrl: 'https://velora-one-lake.vercel.app/',
    repoUrl: 'https://github.com/ManasDasri/Velora',
    slug: 'velora',
    screenshots: [
      { src: '/projects/velora-forecast.jpg', alt: "Velora's forecast for AAPL: the share of 2,000 simulated paths ending above today's price, with the median, the 80% range and the tail risk" },
      { src: '/projects/velora-chart.jpg', alt: "Velora's fan chart: 120 days of history, then the simulated paths fanning out over 30 days, with horizon and scenario controls" },
    ],
    started: '2026-08',
    kind: 'Quant platform',
    tagline: 'Probability cones for stock prices.',
    problem: 'Most stock tools show a single price target, which hides how wide the range of outcomes really is.',
    built: 'A forecasting platform that simulates price paths with regime switching and headline sentiment, then reports the spread as fan charts, upside probability, VaR and CVaR.',
    features: [
      'Live OHLCV prices from Twelve Data, plus quotes and headlines from Finnhub',
      'Monte Carlo engine with regime-switching volatility and jump-shock stress events',
      'Groq LLaMA 3.3-70B reads recent headlines and shifts the drift and volatility assumptions',
      'Fan chart and histogram drawn on a plain HTML canvas, no charting library',
      'Risk numbers: expected terminal price, upside probability, VaR and CVaR at 95%',
      'Scenario presets (Base, Risk-On, Risk-Off, Black Swan) and a regime heatmap with the Markov transition matrix',
      'Runs in demo mode on synthetic data when API keys are missing',
    ],
    layers: [
      { label: 'Data', nodes: ['Twelve Data: OHLCV', 'Finnhub: quotes and headlines'] },
      { label: 'Model', nodes: ['GBM Monte Carlo, up to 1,000 paths', '3-state Markov regimes + jump shocks', 'LLaMA 3.3 sentiment → drift and volatility'] },
      { label: 'Output', nodes: ['canvas fan chart and histogram', 'VaR / CVaR (95%), upside probability', 'scenario presets'] },
    ],
  },

  {
    name: 'Analogue Risk',
    status: 'in research',
    badge: 'for publication',
    active: true,
    description:
      'Regime-conditioned analogue forecasting of market risk, with self-exciting tail-risk gating. A Rust + Python rebuild of a kNN, Poisson-gated trading model, re-tested under a pre-registered out-of-sample protocol across 15 new assets and redirected from forecasting direction to forecasting risk, which is where the data shows predictability.',
    tags: [
      { label: 'Python', icon: SiPython },
      { label: 'Rust', icon: SiRust },
      { label: 'Quant research', icon: null },
    ],
    link: 'https://github.com/ManasDasri/analogue-risk',
    started: '2026-09',
    kind: 'Research',
    tagline: 'Forecasting market risk from historical analogues.',
  },
];

// Featured projects first, in their `featured` order, then the rest newest first.
export const byRank = (a, b) => (a.featured ?? 99) - (b.featured ?? 99) || (b.started ?? '').localeCompare(a.started ?? '');

export const skills = [
  {
    group: 'languages',
    items: [
      { label: 'Python', icon: SiPython },
      { label: 'JavaScript', icon: SiJavascript },
      { label: 'Node.js (exploring..)', icon: SiNodedotjs },
      { label: 'Java', icon: FaJava },
      { label: 'C', icon: SiC },
      { label: 'Visual Basic (exploring..)', icon: SiDotnet },
      { label: 'Go (learning..)', icon: SiGo },
    ],
  },
  {
    group: 'frameworks & data',
    items: [
      { label: 'Express.js', icon: SiExpress },
      { label: 'Supabase', icon: SiSupabase },
      { label: 'PostgreSQL', icon: SiPostgresql },
      { label: 'React (learning..)', icon: SiReact },
      { label: 'Redis', icon: SiRedis },
    ],
  },
  {
    group: 'ai / ml',
    // each links to the project that uses it
    items: [
      { label: 'PyTorch', icon: SiPytorch, href: '/projects/clause-risk-review/' },
      { label: 'Transformers', icon: SiHuggingface, href: '/projects/clause-risk-review/' },
      { label: 'scikit-learn', icon: SiScikitlearn, href: '/projects/med-eeg/' },
      { label: 'MNE (EEG)', icon: null, href: '/projects/med-eeg/' },
      { label: 'statsmodels', icon: null, href: '/projects/med-eeg/' },
      { label: 'Numpy', icon: SiNumpy },
      { label: 'Pandas', icon: SiPandas },
      { label: 'Tensorflow', icon: SiTensorflow },
      { label: 'Optimisation', icon: null, href: '/projects/atmos/' },
    ],
  },
  {
    group: 'tools & systems',
    items: [
      { label: 'Git', icon: SiGit },
      { label: 'GitHub', icon: SiGithub },
      { label: 'Linux', icon: SiLinux },
      { label: 'Docker', icon: SiDocker },
      { label: 'Unix Shell', icon: null },
      { label: 'KDE Plasma', icon: SiKde },
    ],
  },
  {
    group: 'operating systems',
    items: [
      { label: 'Kali Linux', icon: SiKalilinux },
      { label: 'Pop!_OS', icon: SiPopos },
      { label: 'Windows', icon: FaWindows },
      { label: 'TempleOS', icon: null },
    ],
  },
];


export const commands = [
  { label: 'Go to Selected Work', section: 'building' },
  { label: 'Go to Now', section: 'now' },
  { label: 'Go to Log', section: 'log' },
  { label: 'Go to Stack', section: 'skills' },
  { label: 'Go to Activity', section: 'activity' },
  { label: 'Go to Contact', section: 'contact' },
  { label: 'Projects: everything I’ve built', href: '/projects/' },
  { label: 'Writing: every post', href: '/writing/' },
  { label: 'Reading: books and papers', href: '/reading/' },
  ...projects.filter((p) => p.slug).map((p) => ({ label: `Open ${p.name}`, href: `/projects/${p.slug}/` })),
  { label: 'Terminal: sprout tour', terminal: 'sprout tour' },
  { label: 'Terminal: help', terminal: 'help' },
  { label: 'Install Sprout', href: 'https://sprout-devlabs.github.io/sprout-web/' },
  { label: 'Pause or play the animations', motion: true },
  { label: 'Résumé (PDF)', href: '/Manas_resume.pdf' },
  { label: 'Open GitHub', href: 'https://github.com/ManasDasri' },
  { label: 'Send an email', href: 'mailto:dasarimanas049@gmail.com' },
];

// Dated milestones, newest first. Dates for projects are when the repo was created.
export const log = [
  { date: '2026-10', title: 'IndiaFOSS 2026, Bengaluru', note: 'attended' },
  { date: '2026-09', title: 'Shipped Sprout v0.1.0 and v0.2.0', note: 'Homebrew tap, Scoop bucket and Linux packages', href: 'https://github.com/Sprout-DevLabs/sprout/releases' },
  { date: '2026-09', title: 'Smart India Hackathon: FieldLensAI', note: 'problem statement SIH26122', href: 'https://github.com/ManasDasri/FieldLensAI' },
  { date: '2026-08', title: 'Kaggle: kaggriculture', note: 'learning ML fundamentals from scratch through a real competition', href: '/writing/starting-ai-ml-from-zero-again/' },
  { date: '2026-08', title: 'Started contributing to Exercism’s VB.NET track', href: 'https://github.com/exercism/vbnet' },
  { date: '2026-08', title: 'Built Velora', note: 'Monte Carlo market forecasting', href: '/projects/velora/' },
  { date: '2026-06', title: 'Started Flow', note: 'virtual study rooms', href: '/projects/flow/' },
  { date: '2026-03', title: 'Guidewire DEVTrails 2026: GigShield', note: 'phase 1 submission, parametric income protection for delivery riders', href: 'https://github.com/ManasDasri/GigShield' },
  { date: '2025-12', title: 'Started Atmos', note: 'air quality sensor placement', href: '/projects/atmos/' },
  { date: '2025-11', title: 'Attended Bangalore Tech Summit 2025' },
];

