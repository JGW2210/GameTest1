// Curated seed of pathogenic bacteria, grouped by lineage.
//
// IMPORTANT: names here are written in the LEGACY (pre-2021) form that GBIF's
// backbone still returns — e.g. phylum "Proteobacteria", class
// "Epsilonproteobacteria", genus "Propionibacterium". They are intentionally
// left outdated so the normalizer in ../src/normalize.mjs has real work to do
// and the game ships with current nomenclature. See scripts/build-dataset.mjs.
//
// Each group: { phylum, klass, order, family, taxa: [[genus, species, disease?]] }

export const SEED = [
  // ─── Proteobacteria · Gammaproteobacteria ────────────────────────────────
  {
    phylum: 'Proteobacteria', klass: 'Gammaproteobacteria',
    order: 'Enterobacterales', family: 'Enterobacteriaceae',
    taxa: [
      ['Escherichia', 'coli', 'Gastroenteritis, UTI, sepsis'],
      ['Escherichia', 'albertii', 'Enteric infection'],
      ['Escherichia', 'fergusonii', 'Opportunistic infection'],
      ['Salmonella', 'enterica', 'Typhoid fever, gastroenteritis'],
      ['Salmonella', 'bongori', 'Gastroenteritis'],
      ['Klebsiella', 'pneumoniae', 'Pneumonia, UTI'],
      ['Klebsiella', 'oxytoca', 'Antibiotic-associated colitis'],
      ['Enterobacter', 'aerogenes', 'Nosocomial infection'], // → Klebsiella aerogenes
      ['Enterobacter', 'cloacae', 'Nosocomial infection'],
      ['Enterobacter', 'hormaechei', 'Bloodstream infection'],
      ['Citrobacter', 'freundii', 'UTI, neonatal meningitis'],
      ['Citrobacter', 'koseri', 'Neonatal meningitis'],
      ['Cronobacter', 'sakazakii', 'Neonatal meningitis'],
      ['Shigella', 'dysenteriae', 'Bacillary dysentery'],
      ['Shigella', 'flexneri', 'Shigellosis'],
      ['Shigella', 'sonnei', 'Shigellosis'],
      ['Shigella', 'boydii', 'Shigellosis'],
    ],
  },
  {
    phylum: 'Proteobacteria', klass: 'Gammaproteobacteria',
    order: 'Enterobacterales', family: 'Yersiniaceae',
    taxa: [
      ['Yersinia', 'pestis', 'Plague'],
      ['Yersinia', 'enterocolitica', 'Enterocolitis'],
      ['Yersinia', 'pseudotuberculosis', 'Mesenteric adenitis'],
      ['Serratia', 'marcescens', 'Nosocomial infection'],
    ],
  },
  {
    phylum: 'Proteobacteria', klass: 'Gammaproteobacteria',
    order: 'Enterobacterales', family: 'Morganellaceae',
    taxa: [
      ['Proteus', 'mirabilis', 'UTI, kidney stones'],
      ['Proteus', 'vulgaris', 'UTI'],
      ['Morganella', 'morganii', 'UTI, sepsis'],
      ['Providencia', 'stuartii', 'Catheter-associated UTI'],
      ['Providencia', 'rettgeri', 'UTI'],
    ],
  },
  {
    phylum: 'Proteobacteria', klass: 'Gammaproteobacteria',
    order: 'Enterobacterales', family: 'Hafniaceae',
    taxa: [
      ['Hafnia', 'alvei', 'Gastroenteritis'],
      ['Edwardsiella', 'tarda', 'Wound infection, gastroenteritis'],
    ],
  },
  {
    phylum: 'Proteobacteria', klass: 'Gammaproteobacteria',
    order: 'Vibrionales', family: 'Vibrionaceae',
    taxa: [
      ['Vibrio', 'cholerae', 'Cholera'],
      ['Vibrio', 'parahaemolyticus', 'Gastroenteritis'],
      ['Vibrio', 'vulnificus', 'Wound infection, septicaemia'],
      ['Vibrio', 'alginolyticus', 'Otitis, wound infection'],
    ],
  },
  {
    phylum: 'Proteobacteria', klass: 'Gammaproteobacteria',
    order: 'Aeromonadales', family: 'Aeromonadaceae',
    taxa: [
      ['Aeromonas', 'hydrophila', 'Gastroenteritis, wound infection'],
      ['Aeromonas', 'caviae', 'Gastroenteritis'],
    ],
  },
  {
    phylum: 'Proteobacteria', klass: 'Gammaproteobacteria',
    order: 'Pasteurellales', family: 'Pasteurellaceae',
    taxa: [
      ['Haemophilus', 'influenzae', 'Meningitis, epiglottitis'],
      ['Haemophilus', 'ducreyi', 'Chancroid'],
      ['Haemophilus', 'parainfluenzae', 'Endocarditis'],
      ['Pasteurella', 'multocida', 'Animal-bite infection'],
      ['Aggregatibacter', 'actinomycetemcomitans', 'Periodontitis, endocarditis'],
      ['Aggregatibacter', 'aphrophilus', 'Endocarditis'],
    ],
  },
  {
    phylum: 'Proteobacteria', klass: 'Gammaproteobacteria',
    order: 'Legionellales', family: 'Legionellaceae',
    taxa: [
      ['Legionella', 'pneumophila', "Legionnaires' disease"],
      ['Legionella', 'longbeachae', 'Pneumonia'],
    ],
  },
  {
    phylum: 'Proteobacteria', klass: 'Gammaproteobacteria',
    order: 'Legionellales', family: 'Coxiellaceae',
    taxa: [['Coxiella', 'burnetii', 'Q fever']],
  },
  {
    phylum: 'Proteobacteria', klass: 'Gammaproteobacteria',
    order: 'Thiotrichales', family: 'Francisellaceae',
    taxa: [['Francisella', 'tularensis', 'Tularemia']],
  },
  {
    phylum: 'Proteobacteria', klass: 'Gammaproteobacteria',
    order: 'Pseudomonadales', family: 'Pseudomonadaceae',
    taxa: [
      ['Pseudomonas', 'aeruginosa', 'Nosocomial & burn infections'],
      ['Pseudomonas', 'fluorescens', 'Transfusion sepsis (rare)'],
      ['Pseudomonas', 'putida', 'Opportunistic infection'],
    ],
  },
  {
    phylum: 'Proteobacteria', klass: 'Gammaproteobacteria',
    order: 'Pseudomonadales', family: 'Moraxellaceae',
    taxa: [
      ['Moraxella', 'catarrhalis', 'Otitis media, bronchitis'],
      ['Acinetobacter', 'baumannii', 'Nosocomial pneumonia, sepsis'],
      ['Acinetobacter', 'lwoffii', 'Opportunistic infection'],
    ],
  },
  {
    phylum: 'Proteobacteria', klass: 'Gammaproteobacteria',
    order: 'Xanthomonadales', family: 'Xanthomonadaceae',
    taxa: [['Stenotrophomonas', 'maltophilia', 'Nosocomial pneumonia']],
  },
  {
    phylum: 'Proteobacteria', klass: 'Gammaproteobacteria',
    order: 'Cardiobacteriales', family: 'Cardiobacteriaceae',
    taxa: [['Cardiobacterium', 'hominis', 'Endocarditis']],
  },

  // ─── Proteobacteria · Betaproteobacteria ─────────────────────────────────
  {
    phylum: 'Proteobacteria', klass: 'Betaproteobacteria',
    order: 'Neisseriales', family: 'Neisseriaceae',
    taxa: [
      ['Neisseria', 'meningitidis', 'Meningitis, septicaemia'],
      ['Neisseria', 'gonorrhoeae', 'Gonorrhoea'],
      ['Neisseria', 'lactamica', 'Rarely pathogenic'],
      ['Kingella', 'kingae', 'Septic arthritis (children)'],
      ['Eikenella', 'corrodens', 'Bite-wound infection'],
    ],
  },
  {
    phylum: 'Proteobacteria', klass: 'Betaproteobacteria',
    order: 'Burkholderiales', family: 'Burkholderiaceae',
    taxa: [
      ['Burkholderia', 'pseudomallei', 'Melioidosis'],
      ['Burkholderia', 'mallei', 'Glanders'],
      ['Burkholderia', 'cepacia', 'Cystic fibrosis lung infection'],
    ],
  },
  {
    phylum: 'Proteobacteria', klass: 'Betaproteobacteria',
    order: 'Burkholderiales', family: 'Alcaligenaceae',
    taxa: [
      ['Bordetella', 'pertussis', 'Whooping cough'],
      ['Bordetella', 'parapertussis', 'Whooping-cough-like illness'],
      ['Bordetella', 'bronchiseptica', 'Respiratory infection'],
      ['Achromobacter', 'xylosoxidans', 'Opportunistic infection'],
    ],
  },

  // ─── Proteobacteria · Alphaproteobacteria ────────────────────────────────
  {
    phylum: 'Proteobacteria', klass: 'Alphaproteobacteria',
    order: 'Rickettsiales', family: 'Rickettsiaceae',
    taxa: [
      ['Rickettsia', 'rickettsii', 'Rocky Mountain spotted fever'],
      ['Rickettsia', 'prowazekii', 'Epidemic typhus'],
      ['Rickettsia', 'typhi', 'Murine typhus'],
      ['Rickettsia', 'conorii', 'Mediterranean spotted fever'],
      ['Orientia', 'tsutsugamushi', 'Scrub typhus'],
    ],
  },
  {
    phylum: 'Proteobacteria', klass: 'Alphaproteobacteria',
    order: 'Rickettsiales', family: 'Anaplasmataceae',
    taxa: [
      ['Anaplasma', 'phagocytophilum', 'Human granulocytic anaplasmosis'],
      ['Ehrlichia', 'chaffeensis', 'Human monocytic ehrlichiosis'],
    ],
  },
  {
    phylum: 'Proteobacteria', klass: 'Alphaproteobacteria',
    order: 'Rhizobiales', family: 'Brucellaceae',
    taxa: [
      ['Brucella', 'abortus', 'Brucellosis'],
      ['Brucella', 'melitensis', 'Brucellosis'],
      ['Brucella', 'suis', 'Brucellosis'],
    ],
  },
  {
    phylum: 'Proteobacteria', klass: 'Alphaproteobacteria',
    order: 'Rhizobiales', family: 'Bartonellaceae',
    taxa: [
      ['Bartonella', 'henselae', 'Cat-scratch disease'],
      ['Bartonella', 'quintana', 'Trench fever'],
      ['Bartonella', 'bacilliformis', "Carrión's disease"],
    ],
  },

  // ─── Epsilonproteobacteria → Campylobacterota (handled by normalizer) ─────
  {
    phylum: 'Proteobacteria', klass: 'Epsilonproteobacteria',
    order: 'Campylobacterales', family: 'Campylobacteraceae',
    taxa: [
      ['Campylobacter', 'jejuni', 'Enteritis, Guillain-Barré trigger'],
      ['Campylobacter', 'coli', 'Enteritis'],
      ['Campylobacter', 'fetus', 'Systemic infection'],
    ],
  },
  {
    phylum: 'Proteobacteria', klass: 'Epsilonproteobacteria',
    order: 'Campylobacterales', family: 'Helicobacteraceae',
    taxa: [
      ['Helicobacter', 'pylori', 'Peptic ulcers, gastric cancer'],
      ['Helicobacter', 'cinaedi', 'Bacteraemia, cellulitis'],
    ],
  },
  {
    phylum: 'Proteobacteria', klass: 'Epsilonproteobacteria',
    order: 'Campylobacterales', family: 'Arcobacteraceae',
    taxa: [['Arcobacter', 'butzleri', 'Enteritis']],
  },

  // ─── Firmicutes · Bacilli ────────────────────────────────────────────────
  {
    phylum: 'Firmicutes', klass: 'Bacilli',
    order: 'Bacillales', family: 'Bacillaceae',
    taxa: [
      ['Bacillus', 'anthracis', 'Anthrax'],
      ['Bacillus', 'cereus', 'Food poisoning'],
      ['Bacillus', 'subtilis', 'Rarely pathogenic'],
      ['Bacillus', 'thuringiensis', 'Opportunistic infection'],
    ],
  },
  {
    phylum: 'Firmicutes', klass: 'Bacilli',
    order: 'Bacillales', family: 'Staphylococcaceae',
    taxa: [
      ['Staphylococcus', 'aureus', 'Abscesses, sepsis, toxic shock'],
      ['Staphylococcus', 'epidermidis', 'Device-associated infection'],
      ['Staphylococcus', 'saprophyticus', 'UTI'],
      ['Staphylococcus', 'lugdunensis', 'Endocarditis'],
      ['Staphylococcus', 'haemolyticus', 'Nosocomial infection'],
    ],
  },
  {
    phylum: 'Firmicutes', klass: 'Bacilli',
    order: 'Bacillales', family: 'Listeriaceae',
    taxa: [
      ['Listeria', 'monocytogenes', 'Listeriosis'],
      ['Listeria', 'ivanovii', 'Listeriosis (rare)'],
    ],
  },
  {
    phylum: 'Firmicutes', klass: 'Bacilli',
    order: 'Lactobacillales', family: 'Streptococcaceae',
    taxa: [
      ['Streptococcus', 'pyogenes', 'Strep throat, necrotizing fasciitis'],
      ['Streptococcus', 'agalactiae', 'Neonatal sepsis'],
      ['Streptococcus', 'pneumoniae', 'Pneumonia, meningitis'],
      ['Streptococcus', 'mutans', 'Dental caries'],
      ['Streptococcus', 'mitis', 'Endocarditis'],
      ['Streptococcus', 'sanguinis', 'Endocarditis'],
      ['Streptococcus', 'suis', 'Meningitis (zoonotic)'],
    ],
  },
  {
    phylum: 'Firmicutes', klass: 'Bacilli',
    order: 'Lactobacillales', family: 'Enterococcaceae',
    taxa: [
      ['Enterococcus', 'faecalis', 'UTI, endocarditis'],
      ['Enterococcus', 'faecium', 'Nosocomial infection (VRE)'],
      ['Enterococcus', 'gallinarum', 'Bacteraemia'],
    ],
  },
  {
    phylum: 'Firmicutes', klass: 'Bacilli',
    order: 'Lactobacillales', family: 'Aerococcaceae',
    taxa: [
      ['Aerococcus', 'urinae', 'UTI'],
      ['Abiotrophia', 'defectiva', 'Endocarditis'],
    ],
  },
  {
    phylum: 'Firmicutes', klass: 'Bacilli',
    order: 'Lactobacillales', family: 'Carnobacteriaceae',
    taxa: [['Granulicatella', 'adiacens', 'Endocarditis']],
  },

  // ─── Firmicutes · Clostridia ─────────────────────────────────────────────
  {
    phylum: 'Firmicutes', klass: 'Clostridia',
    order: 'Clostridiales', family: 'Clostridiaceae',
    taxa: [
      ['Clostridium', 'perfringens', 'Gas gangrene, food poisoning'],
      ['Clostridium', 'botulinum', 'Botulism'],
      ['Clostridium', 'tetani', 'Tetanus'],
      ['Clostridium', 'septicum', 'Gas gangrene'],
    ],
  },
  {
    phylum: 'Firmicutes', klass: 'Clostridia',
    order: 'Clostridiales', family: 'Peptostreptococcaceae',
    taxa: [
      ['Clostridium', 'difficile', 'Pseudomembranous colitis'], // → Clostridioides
    ],
  },
  {
    phylum: 'Firmicutes', klass: 'Clostridia',
    order: 'Clostridiales', family: 'Peptoniphilaceae',
    taxa: [['Finegoldia', 'magna', 'Soft-tissue infection']],
  },
  {
    phylum: 'Firmicutes', klass: 'Negativicutes',
    order: 'Veillonellales', family: 'Veillonellaceae',
    taxa: [['Veillonella', 'parvula', 'Endocarditis, abscesses']],
  },

  // ─── Tenericutes · Mollicutes ────────────────────────────────────────────
  {
    phylum: 'Tenericutes', klass: 'Mollicutes',
    order: 'Mycoplasmatales', family: 'Mycoplasmataceae',
    taxa: [
      ['Mycoplasma', 'pneumoniae', 'Atypical pneumonia'],
      ['Mycoplasma', 'genitalium', 'Urethritis'],
      ['Mycoplasma', 'hominis', 'Pelvic inflammatory disease'],
      ['Ureaplasma', 'urealyticum', 'Urethritis'],
    ],
  },

  // ─── Actinobacteria · Actinobacteria (class) ─────────────────────────────
  {
    phylum: 'Actinobacteria', klass: 'Actinobacteria',
    order: 'Corynebacteriales', family: 'Corynebacteriaceae',
    taxa: [
      ['Corynebacterium', 'diphtheriae', 'Diphtheria'],
      ['Corynebacterium', 'ulcerans', 'Diphtheria-like illness'],
      ['Corynebacterium', 'jeikeium', 'Device-associated sepsis'],
    ],
  },
  {
    phylum: 'Actinobacteria', klass: 'Actinobacteria',
    order: 'Corynebacteriales', family: 'Mycobacteriaceae',
    taxa: [
      ['Mycobacterium', 'tuberculosis', 'Tuberculosis'],
      ['Mycobacterium', 'leprae', 'Leprosy'],
      ['Mycobacterium', 'bovis', 'Tuberculosis (zoonotic)'],
      ['Mycobacterium', 'avium', 'Disseminated MAC infection'],
      ['Mycobacterium', 'abscessus', 'Pulmonary & skin infection'],
      ['Mycobacterium', 'marinum', 'Fish-tank granuloma'],
      ['Mycobacterium', 'ulcerans', 'Buruli ulcer'],
      ['Mycobacterium', 'kansasii', 'Pulmonary infection'],
    ],
  },
  {
    phylum: 'Actinobacteria', klass: 'Actinobacteria',
    order: 'Corynebacteriales', family: 'Nocardiaceae',
    taxa: [
      ['Nocardia', 'asteroides', 'Nocardiosis'],
      ['Nocardia', 'brasiliensis', 'Cutaneous nocardiosis'],
      ['Rhodococcus', 'equi', 'Pneumonia (immunocompromised)'], // → R. hoagii
    ],
  },
  {
    phylum: 'Actinobacteria', klass: 'Actinobacteria',
    order: 'Actinomycetales', family: 'Actinomycetaceae',
    taxa: [
      ['Actinomyces', 'israelii', 'Actinomycosis'],
      ['Actinomyces', 'naeslundii', 'Actinomycosis, caries'],
      ['Gardnerella', 'vaginalis', 'Bacterial vaginosis'],
    ],
  },
  {
    phylum: 'Actinobacteria', klass: 'Actinobacteria',
    order: 'Propionibacteriales', family: 'Propionibacteriaceae',
    taxa: [
      ['Propionibacterium', 'acnes', 'Acne, device infection'], // → Cutibacterium
    ],
  },
  {
    phylum: 'Actinobacteria', klass: 'Actinobacteria',
    order: 'Micrococcales', family: 'Micrococcaceae',
    taxa: [['Micrococcus', 'luteus', 'Opportunistic infection']],
  },

  // ─── Bacteroidetes ───────────────────────────────────────────────────────
  {
    phylum: 'Bacteroidetes', klass: 'Bacteroidia',
    order: 'Bacteroidales', family: 'Bacteroidaceae',
    taxa: [
      ['Bacteroides', 'fragilis', 'Intra-abdominal abscess'],
      ['Bacteroides', 'thetaiotaomicron', 'Opportunistic infection'],
    ],
  },
  {
    phylum: 'Bacteroidetes', klass: 'Bacteroidia',
    order: 'Bacteroidales', family: 'Prevotellaceae',
    taxa: [
      ['Prevotella', 'melaninogenica', 'Anaerobic infection'],
      ['Prevotella', 'intermedia', 'Periodontitis'],
    ],
  },
  {
    phylum: 'Bacteroidetes', klass: 'Bacteroidia',
    order: 'Bacteroidales', family: 'Porphyromonadaceae',
    taxa: [['Porphyromonas', 'gingivalis', 'Periodontitis']],
  },
  {
    phylum: 'Bacteroidetes', klass: 'Bacteroidia',
    order: 'Bacteroidales', family: 'Tannerellaceae',
    taxa: [['Tannerella', 'forsythia', 'Periodontitis']],
  },
  {
    phylum: 'Bacteroidetes', klass: 'Flavobacteriia',
    order: 'Flavobacteriales', family: 'Flavobacteriaceae',
    taxa: [
      ['Capnocytophaga', 'canimorsus', 'Sepsis after dog bite'],
      ['Elizabethkingia', 'meningoseptica', 'Neonatal meningitis'],
    ],
  },

  // ─── Spirochaetes ────────────────────────────────────────────────────────
  {
    phylum: 'Spirochaetes', klass: 'Spirochaetia',
    order: 'Spirochaetales', family: 'Treponemataceae',
    taxa: [
      ['Treponema', 'pallidum', 'Syphilis'],
      ['Treponema', 'denticola', 'Periodontitis'],
    ],
  },
  {
    phylum: 'Spirochaetes', klass: 'Spirochaetia',
    order: 'Spirochaetales', family: 'Borreliaceae',
    taxa: [
      ['Borrelia', 'burgdorferi', 'Lyme disease'],
      ['Borrelia', 'recurrentis', 'Relapsing fever'],
      ['Borrelia', 'hermsii', 'Relapsing fever'],
    ],
  },
  {
    phylum: 'Spirochaetes', klass: 'Spirochaetia',
    order: 'Leptospirales', family: 'Leptospiraceae',
    taxa: [['Leptospira', 'interrogans', 'Leptospirosis']],
  },
  {
    phylum: 'Spirochaetes', klass: 'Spirochaetia',
    order: 'Brachyspirales', family: 'Brachyspiraceae',
    taxa: [['Brachyspira', 'pilosicoli', 'Intestinal spirochaetosis']],
  },

  // ─── Chlamydiae ──────────────────────────────────────────────────────────
  {
    phylum: 'Chlamydiae', klass: 'Chlamydiia',
    order: 'Chlamydiales', family: 'Chlamydiaceae',
    taxa: [
      ['Chlamydia', 'trachomatis', 'Trachoma, chlamydia (STI)'],
      ['Chlamydia', 'psittaci', 'Psittacosis'],
      ['Chlamydia', 'pneumoniae', 'Atypical pneumonia'],
    ],
  },

  // ─── Fusobacteria ────────────────────────────────────────────────────────
  {
    phylum: 'Fusobacteria', klass: 'Fusobacteriia',
    order: 'Fusobacteriales', family: 'Fusobacteriaceae',
    taxa: [
      ['Fusobacterium', 'nucleatum', 'Periodontitis, colorectal links'],
      ['Fusobacterium', 'necrophorum', "Lemierre's syndrome"],
    ],
  },
  {
    phylum: 'Fusobacteria', klass: 'Fusobacteriia',
    order: 'Fusobacteriales', family: 'Leptotrichiaceae',
    taxa: [
      ['Leptotrichia', 'buccalis', 'Bacteraemia'],
      ['Streptobacillus', 'moniliformis', 'Rat-bite fever'],
    ],
  },
];
