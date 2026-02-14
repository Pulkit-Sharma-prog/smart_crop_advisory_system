export const diseaseCatalogSeed = [
  {
    id: "late_blight",
    displayName: "Late Blight",
    crop: "Tomato/Potato",
    symptoms: [
      "Water-soaked lesions on leaves",
      "Dark brown patches with pale green halo",
      "White fungal growth on leaf underside during humid weather",
    ],
    preventiveMeasures: [
      "Avoid overhead irrigation late in the day.",
      "Improve airflow by maintaining proper plant spacing.",
      "Remove volunteer host plants and infected debris.",
    ],
    curativeActions: [
      "Prune and destroy infected leaves immediately.",
      "Apply a registered anti-oomycete fungicide as per local label.",
      "Repeat treatment at 5 to 7 day interval during high humidity.",
    ],
    organicOptions: [
      "Use copper-based approved organic fungicides.",
      "Spray bio-control products containing Bacillus subtilis.",
    ],
    escalationAdvice: "If symptoms spread quickly across multiple beds, contact local extension support within 24 hours.",
  },
  {
    id: "early_blight",
    displayName: "Early Blight",
    crop: "Tomato/Potato",
    symptoms: [
      "Concentric target-like spots on older leaves",
      "Yellowing around necrotic leaf lesions",
      "Lower canopy defoliation",
    ],
    preventiveMeasures: [
      "Use certified disease-free seed and seedlings.",
      "Follow crop rotation of at least 2 years.",
      "Mulch soil to reduce splash dispersal.",
    ],
    curativeActions: [
      "Remove heavily affected leaves and stems.",
      "Use recommended protectant fungicide on schedule.",
      "Support plant nutrition, especially potassium.",
    ],
    organicOptions: [
      "Use neem-based products as supportive management.",
      "Apply compost tea only as preventive supplement.",
    ],
    escalationAdvice: "Escalate when lower-canopy infection exceeds 25% despite first treatment cycle.",
  },
  {
    id: "powdery_mildew",
    displayName: "Powdery Mildew",
    crop: "Multiple crops",
    symptoms: [
      "White powdery coating on leaf surfaces",
      "Leaf curling and distortion",
      "Premature leaf drop in severe cases",
    ],
    preventiveMeasures: [
      "Keep canopy open with pruning and spacing.",
      "Avoid excess nitrogen fertilization.",
      "Monitor humidity buildup in low-airflow zones.",
    ],
    curativeActions: [
      "Remove infected plant parts early.",
      "Use sulfur or systemic fungicide as per crop label.",
      "Recheck and repeat spray within 7 days if needed.",
    ],
    organicOptions: [
      "Use potassium bicarbonate sprays.",
      "Apply neem oil in evening hours.",
    ],
    escalationAdvice: "Escalate if infection reaches new growth after two consecutive interventions.",
  },
  {
    id: "leaf_spot",
    displayName: "Leaf Spot",
    crop: "Multiple crops",
    symptoms: [
      "Small circular brown or black spots",
      "Spots may merge into larger necrotic areas",
      "Yellow halos around lesions",
    ],
    preventiveMeasures: [
      "Use drip irrigation to reduce wet foliage time.",
      "Sanitize tools before moving between plots.",
      "Avoid dense planting that blocks airflow.",
    ],
    curativeActions: [
      "Prune affected leaves and avoid field composting of infected waste.",
      "Apply broad-spectrum fungicide/bactericide according to diagnosis.",
      "Track progression every 48 hours.",
    ],
    organicOptions: [
      "Use copper soap formulations where allowed.",
      "Use biofungicide based on Trichoderma as preventive support.",
    ],
    escalationAdvice: "Escalate if lesions appear on new leaves within 3 days of first control action.",
  },
  {
    id: "bacterial_blight",
    displayName: "Bacterial Blight",
    crop: "Rice/Pulses/Cotton variants",
    symptoms: [
      "Water-soaked streaks that turn yellow-brown",
      "Leaf tip drying and wilting",
      "Rapid spread after rain and wind",
    ],
    preventiveMeasures: [
      "Use resistant varieties where available.",
      "Avoid excess field moisture and standing water.",
      "Disinfect field equipment regularly.",
    ],
    curativeActions: [
      "Rogue severely infected clumps early.",
      "Use approved bactericide based on local extension guidance.",
      "Balance nitrogen and potassium to reduce stress.",
    ],
    organicOptions: [
      "Use biological bacterial suppressants as recommended locally.",
      "Apply silicon-rich amendments to improve plant resilience.",
    ],
    escalationAdvice: "Escalate when patch-level spread exceeds 10% in 72 hours.",
  },
];
