export interface ProVariantInfo {
  variant: number;
  title: string;
  description: string;
  image: string;
  badge?: string;
}

export interface ProSubjectTemplate {
  id: string;
  name: string;
  icon: string;
  category: 'aniq' | 'tabiiy' | 'ijtimoiy' | 'biznes' | 'universal';
  categoryLabel: string;
  description: string;
  images: string[];
  variants: ProVariantInfo[];
}

export const PRO_CATEGORIES = [
  { id: 'all', label: 'Barchasi' },
  { id: 'tabiiy', label: 'Tabiiy & Tibbiyot' },
  { id: 'aniq', label: 'Aniq & IT' },
  { id: 'ijtimoiy', label: 'Ijtimoiy & Ta\'lim' },
  { id: 'biznes', label: 'Biznes & Moliya' },
  { id: 'universal', label: 'Universal' },
] as const;

export const proTemplates: ProSubjectTemplate[] = [
  {
    id: "biologiya",
    name: "Biologiya",
    icon: "🧬",
    category: "tabiiy",
    categoryLabel: "Tabiiy & Tibbiyot",
    description: "Botanika, zoologiya, anatomiya va ekologiya bo'yicha boy ilmiy dizaynlar",
    images: [
      "/pro_perviews/biologiya/Снимок экрана 2026-04-20 170347.png",
      "/pro_perviews/biologiya/Снимок экрана 2026-04-20 170404.png",
      "/pro_perviews/biologiya/Снимок экрана 2026-04-20 170347.png",
      "/pro_perviews/biologiya/Снимок экрана 2026-04-20 170404.png",
      "/pro_perviews/biologiya/Снимок экрана 2026-04-20 170347.png"
    ],
    variants: [
      {
        variant: 1,
        title: "Klassik Botanika & Flora",
        description: "O'simliklar dunyosi va biologik jarayonlar tahlili",
        image: "/pro_perviews/biologiya/Снимок экрана 2026-04-20 170347.png",
        badge: "20 slayd"
      },
      {
        variant: 2,
        title: "Ekologiya & Yashil Tabiat",
        description: "Atrof-muhit muhofazasi va biosfera qonuniyatlari",
        image: "/pro_perviews/biologiya/Снимок экрана 2026-04-20 170404.png",
        badge: "20 slayd"
      },
      {
        variant: 3,
        title: "Molekulyar Biologiya & DNK",
        description: "Genetika, irsiyat va hujayra tuzilishi tadqiqotlari",
        image: "/pro_perviews/biologiya/Снимок экрана 2026-04-20 170347.png",
        badge: "20 slayd"
      },
      {
        variant: 4,
        title: "Sitologiya & Laboratoriya",
        description: "Mikroskopik tahlillar va laboratoriya tajribalari",
        image: "/pro_perviews/biologiya/Снимок экрана 2026-04-20 170404.png",
        badge: "20 slayd"
      },
      {
        variant: 5,
        title: "Organik Tabiat & Hayot",
        description: "Tirik organizmlarning evolyutsiyasi va xilma-xilligi",
        image: "/pro_perviews/biologiya/Снимок экрана 2026-04-20 170347.png",
        badge: "20 slayd"
      }
    ]
  },
  {
    id: "english",
    name: "English Language",
    icon: "🇬🇧",
    category: "ijtimoiy",
    categoryLabel: "Ijtimoiy & Ta'lim",
    description: "Ingliz tili darslari, grammatika, leksika va xalqaro muloqot",
    images: [
      "/pro_perviews/enlish/Снимок экрана 2026-10-11 203504.png",
      "/pro_perviews/enlish/Снимок экрана 2026-10-11 203531.png",
      "/pro_perviews/enlish/Снимок экрана 2026-10-11 203554.png"
    ],
    variants: [
      {
        variant: 1,
        title: "Modern English Academy",
        description: "Zamonaviy ingliz tili darslari va interaktiv mashg'ulotlar",
        image: "/pro_perviews/enlish/Снимок экрана 2026-10-11 203504.png",
        badge: "20 slayd"
      },
      {
        variant: 2,
        title: "Vocabulary & Grammar Mastery",
        description: "Grammatika qoidalari va so'z boyligini rivojlantirish",
        image: "/pro_perviews/enlish/Снимок экрана 2026-10-11 203531.png",
        badge: "20 slayd"
      },
      {
        variant: 3,
        title: "Business & Global English",
        description: "Xalqaro biznes muloqoti va akademik taqdimotlar",
        image: "/pro_perviews/enlish/Снимок экрана 2026-10-11 203554.png",
        badge: "20 slayd"
      }
    ]
  },
  {
    id: "kimyo",
    name: "Kimyo",
    icon: "🧪",
    category: "tabiiy",
    categoryLabel: "Tabiiy & Tibbiyot",
    description: "Organik, anorganik kimyo, reaksiyalar va laboratoriya tajribalari",
    images: [
      "/pro_perviews/kimyo/Снимок экрана 2026-04-20 172736.png",
      "/pro_perviews/kimyo/Снимок экрана 2026-04-20 172755.png",
      "/pro_perviews/kimyo/Снимок экрана 2026-04-20 172736.png"
    ],
    variants: [
      {
        variant: 1,
        title: "Monoxrom Biokimyo",
        description: "Aniq formulalar, molekulalar va biokimyoviy jarayonlar",
        image: "/pro_perviews/kimyo/Снимок экрана 2026-04-20 172736.png",
        badge: "20 slayd"
      },
      {
        variant: 2,
        title: "Laboratoriya & Reaksiyalar",
        description: "Kimyoviy tajribalar va moddalar o'zaro ta'siri",
        image: "/pro_perviews/kimyo/Снимок экрана 2026-04-20 172755.png",
        badge: "20 slayd"
      },
      {
        variant: 3,
        title: "Elementlar Davriy Tizimi",
        description: "Mendeleyev jadvali va elementlarning fizik-kimyoviy xossalari",
        image: "/pro_perviews/kimyo/Снимок экрана 2026-04-20 172736.png",
        badge: "20 slayd"
      }
    ]
  },
  {
    id: "bolalar",
    name: "Maktabgacha ta'lim (Bolalar)",
    icon: "🧸",
    category: "ijtimoiy",
    categoryLabel: "Ijtimoiy & Ta'lim",
    description: "Kichkintoylar ta'limi, rivojlantiruvchi o'yinlar va bolalar psixologiyasi",
    images: [
      "/pro_perviews/maktabgacha talim/Снимок экрана 2026-04-20 172455.png",
      "/pro_perviews/maktabgacha talim/Снимок экрана 2026-04-20 172513.png",
      "/pro_perviews/maktabgacha talim/Снимок экрана 2026-04-20 172455.png"
    ],
    variants: [
      {
        variant: 1,
        title: "Interaktiv Bolalar Ta'limi",
        description: "Rang-barang illyustratsiyalar va o'yinli ta'lim metodikasi",
        image: "/pro_perviews/maktabgacha talim/Снимок экрана 2026-04-20 172455.png",
        badge: "20 slayd"
      },
      {
        variant: 2,
        title: "Kreativ Bog'cha Dasturi",
        description: "Ijodiy qobiliyatlarni rivojlantirish va mantiqiy mashqlar",
        image: "/pro_perviews/maktabgacha talim/Снимок экрана 2026-04-20 172513.png",
        badge: "20 slayd"
      },
      {
        variant: 3,
        title: "Bolalar Psixologiyasi & Tarbiya",
        description: "Ijtimoiy ko'nikmalar va maktabga tayyorgarlik bosqichi",
        image: "/pro_perviews/maktabgacha talim/Снимок экрана 2026-04-20 172455.png",
        badge: "20 slayd"
      }
    ]
  },
  {
    id: "fizika",
    name: "Fizika",
    icon: "⚛️",
    category: "aniq",
    categoryLabel: "Aniq & IT",
    description: "Mexanika, termodinamika, optika, kvant fizikasi va formulalar",
    images: [
      "/pro_perviews/fizika/Снимок экрана 2026-04-20 162348.png",
      "/pro_perviews/fizika/Снимок экрана 2026-04-20 171749.png"
    ],
    variants: [
      {
        variant: 1,
        title: "Nazariy Fizika & Qonunlar",
        description: "Aniq formulalar, SI birliklari va fizikaviy hodisalar",
        image: "/pro_perviews/fizika/Снимок экрана 2026-04-20 162348.png",
        badge: "20 slayd"
      },
      {
        variant: 2,
        title: "Amaliy Eksperimentlar",
        description: "Laboratoriya asboblari, tajribalar va o'lchov natijalari",
        image: "/pro_perviews/fizika/Снимок экрана 2026-04-20 171749.png",
        badge: "20 slayd"
      }
    ]
  },
  {
    id: "matematika",
    name: "Matematika",
    icon: "📐",
    category: "aniq",
    categoryLabel: "Aniq & IT",
    description: "Algebra, geometriya, matematik analiz va algoritmlar",
    images: [
      "/pro_perviews/matematika/Снимок экрана 2026-04-20 173611.png",
      "/pro_perviews/matematika/Снимок экрана 2026-04-20 173628.png"
    ],
    variants: [
      {
        variant: 1,
        title: "Klassik Matematik Analiz",
        description: "Teoremalar, formulalar va matematik modellashtirish",
        image: "/pro_perviews/matematika/Снимок экрана 2026-04-20 173611.png",
        badge: "20 slayd"
      },
      {
        variant: 2,
        title: "Geometriya & Fazoviy Shakllar",
        description: "Fazoviy chizmalar, vektorlar va grafik yechimlar",
        image: "/pro_perviews/matematika/Снимок экрана 2026-04-20 173628.png",
        badge: "20 slayd"
      }
    ]
  },
  {
    id: "cyber",
    name: "Cyber Security",
    icon: "💻",
    category: "aniq",
    categoryLabel: "Aniq & IT",
    description: "Kiberxavfsizlik, axborot himoyasi, dasturlash va tarmoqlar",
    images: [
      "/pro_perviews/cyber/Снимок экрана 2026-04-20 170550.png",
      "/pro_perviews/cyber/Снимок экрана 2026-04-20 170643.png"
    ],
    variants: [
      {
        variant: 1,
        title: "Kiber Xavfsizlik Asoslari",
        description: "Tarmoq protokollari, shifrlash va xavfsizlik arxitekturasi",
        image: "/pro_perviews/cyber/Снимок экрана 2026-04-20 170550.png",
        badge: "20 slayd"
      },
      {
        variant: 2,
        title: "Kiber Xavf & Himoya Tizimlari",
        description: "Hujumlarni tahlil qilish, firewall va ma'lumotlar himoyasi",
        image: "/pro_perviews/cyber/Снимок экрана 2026-04-20 170643.png",
        badge: "20 slayd"
      }
    ]
  },
  {
    id: "tibbiyot",
    name: "Tibbiyot",
    icon: "🩺",
    category: "tabiiy",
    categoryLabel: "Tabiiy & Tibbiyot",
    description: "Klinik tibbiyot, sog'liqni saqlash, farmatsevtika va terapiya",
    images: [
      "/pro_perviews/tibbiyot/Снимок экрана 2026-04-20 170842.png",
      "/pro_perviews/tibbiyot/Снимок экрана 2026-04-20 170907.png"
    ],
    variants: [
      {
        variant: 1,
        title: "Klinik Diagnostika",
        description: "Tibbiy ko'rik, tashxis usullari va davolash protokollari",
        image: "/pro_perviews/tibbiyot/Снимок экрана 2026-04-20 170842.png",
        badge: "20 slayd"
      },
      {
        variant: 2,
        title: "Sog'liqni Saqlash & Anatomiya",
        description: "Inson tana a'zolari salomatligi va profilaktika choralari",
        image: "/pro_perviews/tibbiyot/Снимок экрана 2026-04-20 170907.png",
        badge: "20 slayd"
      }
    ]
  },
  {
    id: "geografiya",
    name: "Geografiya",
    icon: "🌍",
    category: "tabiiy",
    categoryLabel: "Tabiiy & Tibbiyot",
    description: "Tabiiy geografiya, iqlim, xaritalar va jahon mamlakatlari",
    images: [
      "/pro_perviews/geografiya/Снимок экрана 2026-04-20 172820.png",
      "/pro_perviews/geografiya/Снимок экрана 2026-04-20 172857.png"
    ],
    variants: [
      {
        variant: 1,
        title: "Global Geografiya & Xaritalar",
        description: "Qit'alar, okeanlar va Yer sharining landshaft xaritasi",
        image: "/pro_perviews/geografiya/Снимок экрана 2026-04-20 172820.png",
        badge: "20 slayd"
      },
      {
        variant: 2,
        title: "Iqlim & Tabiat Mintaqalari",
        description: "Iqlimiy mintaqalar, tabiiy boyliklar va geotizimlar",
        image: "/pro_perviews/geografiya/Снимок экрана 2026-04-20 172857.png",
        badge: "20 slayd"
      }
    ]
  },
  {
    id: "huquq",
    name: "Huquq",
    icon: "⚖️",
    category: "ijtimoiy",
    categoryLabel: "Ijtimoiy & Ta'lim",
    description: "Yurisprudensiya, qonunchilik, sud amaliyoti va konstitutsiya",
    images: [
      "/pro_perviews/huquq/Снимок экрана 2026-04-20 173116.png",
      "/pro_perviews/huquq/Снимок экрана 2026-04-20 173135.png"
    ],
    variants: [
      {
        variant: 1,
        title: "Yuridik Standart & Kodekslar",
        description: "Qonun normalari, huquqiy munosabatlar va yuridik tahlil",
        image: "/pro_perviews/huquq/Снимок экрана 2026-04-20 173116.png",
        badge: "20 slayd"
      },
      {
        variant: 2,
        title: "Sud Amaliyoti & Adolat",
        description: "Sud jarayonlari, dalillar va himoya vositalari",
        image: "/pro_perviews/huquq/Снимок экрана 2026-04-20 173135.png",
        badge: "20 slayd"
      }
    ]
  },
  {
    id: "tarix",
    name: "Tarix",
    icon: "🏛️",
    category: "ijtimoiy",
    categoryLabel: "Ijtimoiy & Ta'lim",
    description: "O'zbekiston tarixi, jahon sivilizatsiyalari va buyuk allomalar",
    images: [
      "/pro_perviews/tarix/Снимок экрана 2026-04-20 170251.png",
      "/pro_perviews/tarix/Снимок экрана 2026-04-20 170313.png"
    ],
    variants: [
      {
        variant: 1,
        title: "Qadimiy Sivilizatsiyalar",
        description: "Tarixiy davrlar, arxeologik yodgorliklar va buyuk davlatlar",
        image: "/pro_perviews/tarix/Снимок экрана 2026-04-20 170251.png",
        badge: "20 slayd"
      },
      {
        variant: 2,
        title: "Madaniy Meros & Allomalar",
        description: "Sharq renessansi, me'morchilik va tarixiy shaxslar",
        image: "/pro_perviews/tarix/Снимок экрана 2026-04-20 170313.png",
        badge: "20 slayd"
      }
    ]
  },
  {
    id: "adabiyot",
    name: "Adabiyot",
    icon: "📚",
    category: "ijtimoiy",
    categoryLabel: "Ijtimoiy & Ta'lim",
    description: "Mumtoz va zamonaviy adabiyot, she'riyat, nasr va adabiy tahlil",
    images: [
      "/pro_perviews/adabiyot/Снимок экрана 2026-04-20 165903.png",
      "/pro_perviews/adabiyot/Снимок экрана 2026-04-20 171051.png"
    ],
    variants: [
      {
        variant: 1,
        title: "Mumtoz Adabiyot & Meros",
        description: "G'azallar, dostonlar va adiblar hayoti hamda ijodi",
        image: "/pro_perviews/adabiyot/Снимок экрана 2026-04-20 165903.png"
      },
      {
        variant: 2,
        title: "Zamonaviy Adabiy Tahlil",
        description: "Roman va qissalar tahlili, badiiy san'at vositalari",
        image: "/pro_perviews/adabiyot/Снимок экрана 2026-04-20 171051.png"
      }
    ]
  },
  {
    id: "moliya",
    name: "Moliya",
    icon: "💰",
    category: "biznes",
    categoryLabel: "Biznes & Moliya",
    description: "Iqtisodiyot, investitsiya, korporativ moliya va byudjet",
    images: [
      "/pro_perviews/moliya/Снимок экрана 2026-04-20 170708.png",
      "/pro_perviews/moliya/Снимок экрана 2026-04-20 170729.png"
    ],
    variants: [
      {
        variant: 1,
        title: "Moliya Bozorlari & Investitsiya",
        description: "Kapital oqimi, investitsion portfel va risklarni baholash",
        image: "/pro_perviews/moliya/Снимок экрана 2026-04-20 170708.png",
        badge: "20 slayd"
      },
      {
        variant: 2,
        title: "Korporativ Moliya & Audit",
        description: "Daromadlar, xarajatlar tahlili va moliyaviy hisobotlar",
        image: "/pro_perviews/moliya/Снимок экрана 2026-04-20 170729.png",
        badge: "20 slayd"
      }
    ]
  },
  {
    id: "bank",
    name: "Bank ishi",
    icon: "🏦",
    category: "biznes",
    categoryLabel: "Biznes & Moliya",
    description: "Bank tizimi, kreditlash, depozitlar va zamonaviy fintek",
    images: [
      "/pro_perviews/bank/Снимок экрана 2026-04-20 173154.png",
      "/pro_perviews/bank/Снимок экрана 2026-04-20 173212.png"
    ],
    variants: [
      {
        variant: 1,
        title: "Zamonaviy Bank Xizmatlari",
        description: "Bank amaliyotlari, hisob-kitoblar va raqamli bank",
        image: "/pro_perviews/bank/Снимок экрана 2026-04-20 173154.png"
      },
      {
        variant: 2,
        title: "Kredit & Investitsion Bank",
        description: "Kredit portfeli, likvidlik va bank audit tizimi",
        image: "/pro_perviews/bank/Снимок экрана 2026-04-20 173212.png"
      }
    ]
  },
  {
    id: "marketing",
    name: "Marketing & Savdo",
    icon: "📈",
    category: "biznes",
    categoryLabel: "Biznes & Moliya",
    description: "Brending, bozor tahlili, reklama strategiyasi va sotuv voronkasi",
    images: [
      "/pro_perviews/marketing/Снимок экрана 2026-04-20 172540.png",
      "/pro_perviews/marketing/Снимок экрана 2026-04-20 172559.png"
    ],
    variants: [
      {
        variant: 1,
        title: "Raqamli Marketing Strategiyasi",
        description: "Targeting, SMM, konversiya va mijozlar auditoriyasi",
        image: "/pro_perviews/marketing/Снимок экрана 2026-04-20 172540.png",
        badge: "20 slayd"
      },
      {
        variant: 2,
        title: "Bozor Tahlili & Sotuv Voronkasi",
        description: "Raqobatchilar tahlili va mahsulotni bozorga chiqarish",
        image: "/pro_perviews/marketing/Снимок экрана 2026-04-20 172559.png",
        badge: "20 slayd"
      }
    ]
  },
  {
    id: "sport",
    name: "Sport va Salomatlik",
    icon: "⚽",
    category: "ijtimoiy",
    categoryLabel: "Ijtimoiy & Ta'lim",
    description: "Jismoniy tarbiya, sport musobaqalari, trenirovkalar va sog'lom turmush",
    images: [
      "/pro_perviews/sport/Снимок экрана 2026-04-20 172256.png",
      "/pro_perviews/sport/Снимок экрана 2026-04-20 172314.png"
    ],
    variants: [
      {
        variant: 1,
        title: "Professional Sport Mashg'ulotlari",
        description: "Jismoniy yuklamalar, chidamlilik va sport yutuqlari",
        image: "/pro_perviews/sport/Снимок экрана 2026-04-20 172256.png",
        badge: "20 slayd"
      },
      {
        variant: 2,
        title: "Sog'lom Hayot Tarzi & Fitnes",
        description: "To'g'ri ovqatlanish, jismoniy faollik va profilaktika",
        image: "/pro_perviews/sport/Снимок экрана 2026-04-20 172314.png",
        badge: "20 slayd"
      }
    ]
  },
  {
    id: "minimalizm",
    name: "Minimalizm",
    icon: "🎨",
    category: "universal",
    categoryLabel: "Universal",
    description: "Har qanday mavzuga mos premium minimalistik va estetik dizayn",
    images: [
      "/pro_perviews/minimalizm/Снимок экрана 2026-04-20 165940.png",
      "/pro_perviews/minimalizm/Снимок экрана 2026-04-20 171027.png"
    ],
    variants: [
      {
        variant: 1,
        title: "Monoxrom Minimalist",
        description: "Toza fon, qulay tipografika va ortiqcha bezaklarsiz",
        image: "/pro_perviews/minimalizm/Снимок экрана 2026-04-20 165940.png",
        badge: "20 slayd"
      },
      {
        variant: 2,
        title: "Elegent Estetika",
        description: "Zamonaviy pastel ranglar va qat'iy kompozitsiya",
        image: "/pro_perviews/minimalizm/Снимок экрана 2026-04-20 171027.png",
        badge: "20 slayd"
      }
    ]
  }
];
