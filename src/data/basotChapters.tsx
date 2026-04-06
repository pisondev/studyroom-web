import { Share2, Repeat, Type, GitBranch } from "lucide-react";

export const getBasotIcon = (name: string) => {
  switch (name) {
    case "fsa": return <Share2 size={32} />;
    case "transform": return <Repeat size={32} />;
    case "regex": return <Type size={32} />;
    case "cfg": return <GitBranch size={32} />;
    default: return <Share2 size={32} />;
  }
};

export const basotCourseData = [
  {
    id: "1",
    title: "Fondasi & Finite State Automata",
    slides: [
      { 
        id: 1, type: "interactive", title: "Kosakata Wajib (The Building Blocks)", 
        content: "Sebelum merakit mesin, kita wajib memahami 4 pilar dasar teori komputasi. Klik masing-masing elemen di bawah ini untuk melihat definisinya secara detail beserta contoh di dalam skrip kode.", 
        isCanvas: true, canvasType: "vocab" 
      },
      { 
        id: 2, type: "interactive", title: "Logika Mesin Automata", 
        content: "Automata adalah model abstrak dari sebuah mesin komputasi (seperti program aplikasi yang memvalidasi password user). Mesin ini membaca input karakter dari kiri ke kanan. Jika setelah membaca semua input ia berhenti di titik yang sah (Final State), maka input tersebut DITERIMA. Jika ia crash atau berhenti di titik jebakan, maka input DITOLAK.",
        isCanvas: true, canvasType: "logic" // SEKARANG JADI INTERAKTIF
      },
      { 
        id: 3, type: "interactive", title: "Anatomi & Golden Rule", 
        content: "Mari pelajari bentuk anatomi graf State Machine serta 'Aturan Emas' pembentuknya secara bertahap.", 
        isCanvas: true, canvasType: "fundamental" 
      },
      { 
        id: 4, type: "interactive", title: "Automata Tracer (Level 2)", 
        content: "Sekarang aplikasikan teori yang sudah kamu pelajari untuk menguji mesin DFA yang memiliki alur logika yang sedikit lebih kompleks.", 
        isCanvas: true, canvasType: "automata" 
      },
      { 
        id: 5, type: "intro", title: "Rangkuman Bab 1", iconName: "fsa",
        content: (
          <div className="space-y-4 text-slate-300">
            <p className="text-lg">
              Selamat! Anda telah menyelesaikan fondasi dari <span className="text-indigo-400 font-bold">Finite State Automata</span>. Berikut adalah intisari dari pelajaran hari ini:
            </p>
            <ul className="list-disc pl-6 space-y-3 mt-4">
              <li>
                <strong className="text-white">Blok Bangunan:</strong> Semua teori komputasi dimulai dari <em>Alfabet (Σ)</em> yang dirangkai menjadi <em>String (w)</em>. Ingat bahwa string kosong <span className="bg-slate-800 px-1 rounded text-amber-300 font-mono">λ (Lambda)</span> adalah input yang sepenuhnya valid dalam perhitungan matematis.
              </li>
              <li>
                <strong className="text-emerald-400">Aturan Emas Deterministik:</strong> 
                <div className="p-3 my-2 border-l-4 border-emerald-500 bg-emerald-900/20 rounded-r text-slate-200 italic">
                  "Setiap state <u>wajib</u> memiliki satu—dan hanya satu—jalan keluar untuk setiap simbol alfabet."
                </div>
              </li>
              <li>
                <strong className="text-rose-400">Jebakan Permanen (Dead State):</strong> Untuk memenuhi aturan emas di atas tanpa merusak validasi string, kita membuat state pembuangan. Sekali mesin masuk ke sini, ia tidak akan pernah bisa kembali ke garis <em>finish</em>.
              </li>
              <li>
                <strong className="text-white">Eksekusi Logika:</strong> Jika karakter habis dan mesin mendarat di <em>Final State</em> (lingkaran ganda), string <strong className="bg-emerald-500/20 text-emerald-300 px-2 rounded">DITERIMA</strong>. Selain itu, pasti <strong className="bg-rose-500/20 text-rose-300 px-2 rounded">DITOLAK</strong>.
              </li>
            </ul>
            <p className="mt-6 text-sm text-slate-400 border-t border-slate-800 pt-4">
              Pemahaman visual (melacak node dan garis yang menyala) adalah kunci. Jika Anda sudah menguasai Bab ini, Anda siap untuk "membongkar" batasan tersebut di Bab 2 menggunakan mesin NFA yang gaib!
            </p>
          </div>
        )
      }
    ]
  },
  {
    id: "2",
    title: "Transformasi (NFA ke DFA)",
    slides: [
      { 
        id: 1, type: "intro", title: "Kilas Balik & Masalah Baru", iconName: "transform",
        content: (
          <div className="space-y-4 text-slate-300">
            <p>
              Di Bab 1, kita telah menguasai <strong className="text-indigo-400">DFA (Deterministic Finite Automata)</strong>. Mesin ini sangat stabil karena memiliki aturan emas: <em>Satu input, satu jalan</em>.
            </p>
            <p>
              Namun, merancang DFA untuk pola yang rumit (misalnya: "Cari string yang huruf ketiganya dari belakang adalah 'b'") bisa membutuhkan puluhan <em>state</em> dan sangat memusingkan manusia. Untuk mempermudah rancangan, ilmuwan menciptakan <strong>NFA (Nondeterministic Finite Automata)</strong>.
            </p>
            <div className="p-4 bg-slate-800/50 border-l-4 border-fuchsia-500 rounded-r text-sm">
              <strong className="text-fuchsia-400">Keajaiban NFA:</strong><br/>
              1. Boleh bercabang (1 input memicu jalan ke banyak state sekaligus).<br/>
              2. Boleh punya jalan buntu (tanpa perlu repot membuat Dead State).<br/>
              3. Bisa pindah state tanpa membaca input (menggunakan λ / Lambda).
            </div>
            <p>Mari kita lihat bagaimana NFA bekerja seperti sihir pada simulasi di halaman berikutnya.</p>
          </div>
        )
      },
      { 
        id: 2, type: "interactive", title: "Simulator NFA (Akhiran 01)", 
        content: "NFA memproses string secara paralel (multithreading). Ia akan membelah dirinya setiap bertemu cabang. String diterima jika MINIMAL SATU dari belahan dirinya mendarat di Final State.", 
        isCanvas: true, canvasType: "nfa" 
      },
      { 
        id: 3, type: "interactive", title: "Menjembatani Teori dan Realita", 
        content: "", // Kontennya sudah menyatu di dalam canvas Dilemma
        isCanvas: true, canvasType: "dilemma" 
      },
      { 
        id: 4, type: "interactive", title: "Subset Builder Lab", 
        content: "Mari kita lacak langkah demi langkah konversi NFA 'Akhiran 01' menjadi tabel DFA utuh menggunakan pelacakan himpunan.", 
        isCanvas: true, canvasType: "subset" 
      },
      { 
        id: 5, type: "intro", title: "Rangkuman Bab 2", iconName: "transform",
        content: (
          <div className="space-y-4 text-slate-300">
            <p className="text-lg">
              Anda kini telah menjembatani konsep desain teoretis dengan arsitektur eksekusi dunia nyata!
            </p>
            <ul className="list-disc pl-6 space-y-3 mt-4">
              <li>
                <strong className="text-fuchsia-400">Filosofi NFA:</strong> NFA dirancang sebagai alat bantu manusia agar mudah mendesain pola tanpa harus memikirkan seluruh <em>error handling</em> (jalan buntu).
              </li>
              <li>
                <strong className="text-white">Subset Construction:</strong> Sebuah algoritma penterjemah mutlak. Satu <em>state</em> di DFA hasil konversi pada dasarnya adalah <strong>gabungan (himpunan) dari beberapa state NFA sekaligus</strong> (contoh: state <code className="bg-slate-800 px-1 rounded text-indigo-300">[q0, q1]</code>).
              </li>
              <li>
                <strong className="text-emerald-400">Aturan Final State DFA Baru:</strong> 
                <div className="p-3 my-2 border-l-4 border-emerald-500 bg-emerald-900/20 rounded-r text-slate-200 italic">
                  "Himpunan state DFA apa pun yang memuat setidaknya SATU Final State dari NFA asli, berhak menyandang status sebagai Final State."
                </div>
              </li>
            </ul>
            <p className="mt-6 text-sm text-slate-400 border-t border-slate-800 pt-4">
              Kedua mesin ini (DFA dan NFA) pada akhirnya memiliki <strong>kekuatan yang setara</strong>. Mereka berdua menghasilkan keluarga bahasa yang sama: <strong className="text-white">Bahasa Reguler</strong>, yang akan kita bongkar di Bab 3 selanjutnya menggunakan Pumping Lemma.
            </p>
          </div>
        )
      }
    ]
  },
  {
    id: "3",
    title: "Regex & Pumping Lemma",
    slides: [
      { 
        id: 1, type: "intro", title: "Membangun dengan Regex", iconName: "regex",
        content: (
          <div className="space-y-4 text-slate-300">
            <p>
              Merancang Automata dengan menggambar lingkaran sangatlah melelahkan. Di dunia <em>software engineering</em>, kita menggunakan rumus teks yang disebut <strong className="text-amber-400">Regular Expression (Regex)</strong>.
            </p>
            <p>Regex menggunakan 3 operator dasar untuk membangun pola apapun:</p>
            <ul className="list-disc pl-6 space-y-2 font-mono bg-slate-900/50 p-4 rounded-xl border border-slate-700">
              <li><span className="text-indigo-400 font-bold">Concatenation (ab)</span> : Karakter a diikuti oleh b.</li>
              <li><span className="text-fuchsia-400 font-bold">Union (a+b)</span> : Karakter a ATAU b.</li>
              <li><span className="text-emerald-400 font-bold">Kleene Star (a*)</span> : Karakter a diulang 0 kali atau lebih.</li>
            </ul>
            <p>
              Di balik layar, <em>compiler</em> menerjemahkan rumus pendek ini menjadi mesin NFA secara otomatis menggunakan metode <strong>Thompson's Construction</strong>.
            </p>
          </div>
        )
      },
      { 
        id: 2, type: "interactive", title: "Thompson's Builder", 
        content: "Pilih operator Regex di atas untuk melihat bagaimana algoritma Thompson merakit blok-blok NFA standar dengan memanfaatkan transisi λ (Lambda).", 
        isCanvas: true, canvasType: "regex" 
      },
      { 
        id: 3, type: "intro", title: "Menghancurkan dengan Pumping Lemma", iconName: "regex",
        content: (
          <div className="space-y-4 text-slate-300">
            <p>
              Regex dan Automata adalah alat yang hebat, tapi mereka memiliki <strong className="text-rose-400">kelemahan fatal: Mereka tidak bisa berhitung tanpa batas.</strong>
            </p>
            <p>
              Karena <em>state</em> memori mesin jumlahnya berhingga (terbatas), jika kita memberinya <em>string</em> yang sangat panjang, ia <u>pasti</u> akan mengulangi (<em>looping</em>) <em>state</em> yang sama. Ini disebut <strong>Pigeonhole Principle</strong> (Prinsip Sarang Merpati).
            </p>
            <div className="p-4 bg-slate-800/80 border-l-4 border-amber-500 rounded-r shadow-md">
              <strong className="text-amber-400">Logika Pumping Lemma:</strong><br/>
              Jika bahasa tersebut benar-benar Regular, maka bagian yang <em>looping</em> di tengah (kita sebut bagian <code className="text-rose-400">y</code>) bisa kita <strong>pompa</strong> (digandakan atau dihapus). Hasil pompanannya WAJIB tetap menjadi <em>string</em> yang valid.
            </div>
            <p>
              Jika hasil pompanya menjadi tidak valid, berarti terjadi kontradiksi! Terbukti secara matematis bahwa bahasa tersebut <strong className="text-white underline">Bukan Bahasa Reguler</strong>.
            </p>
          </div>
        )
      },
      { 
        id: 4, type: "interactive", title: "Simulasi Kontradiksi", 
        content: "Bahasa L = {aⁿbⁿ} mengharuskan jumlah huruf 'a' sama persis dengan 'b'. Mari kita coba pompa bagian Loop (y) dan lihat bagaimana keseimbangan matematisnya hancur berantakan!", 
        isCanvas: true, canvasType: "pumping" 
      },
      { 
        id: 5, type: "intro", title: "Rangkuman Bab 3", iconName: "regex",
        content: (
          <div className="space-y-4 text-slate-300">
            <p className="text-lg">
              Anda telah menguasai dua sisi mata uang dalam Teori Komputasi: Penciptaan dan Pembuktian Batasan.
            </p>
            <ul className="list-disc pl-6 space-y-3 mt-4">
              <li>
                <strong className="text-amber-400">Thompson's Construction:</strong> Menggunakan transisi tak terlihat (λ) untuk "merekatkan" potongan mesin-mesin kecil menjadi NFA raksasa sesuai aturan Regex.
              </li>
              <li>
                <strong className="text-rose-400">Kelemahan Memori:</strong> Automata tidak bisa melakukan komputasi yang mengharuskan pencocokan berpasangan dengan kedalaman tak terhingga (seperti tag HTML atau pasangan kurung).
              </li>
              <li>
                <strong className="text-emerald-400">Senjata Pembuktian (Pumping Lemma):</strong> Menggunakan metode kontradiksi. Jika bahasa itu diklaim regular, kita buktikan dengan memecah string menjadi <code className="bg-slate-800 px-1 rounded text-white">w = xyz</code>, memompa <code className="bg-slate-800 px-1 rounded text-rose-400">y</code>, dan memperlihatkan kerusakan formatnya.
              </li>
            </ul>
            <p className="mt-6 text-sm text-slate-400 border-t border-slate-800 pt-4">
              Karena Regex gagal menghitung pasangan, Ilmu Komputer harus berevolusi ke tingkat berikutnya. Di Bab 4, kita akan mempelajari <strong>Context-Free Grammar (CFG)</strong> yang menjadi otak di balik semua <em>compiler</em> bahasa pemrograman.
            </p>
          </div>
        )
      }
    ]
  },
  {
    id: "4", // Atau "5" jika kamu mengubah ID-nya. Kita gunakan "4" sesuai urutan array.
    title: "Context-Free Grammar (CFG)",
    slides: [
      { 
        id: 1, type: "intro", title: "Menghitung Pasangan (Tree)", iconName: "cfg",
        content: (
          <div className="space-y-4 text-slate-300">
            <p>
              Karena Regular Expression dan DFA gagal menghitung kedalaman bertingkat (seperti mengecek apakah setiap kurung buka <code className="bg-slate-800 px-1 rounded text-emerald-400">{`{`}</code> memiliki kurung tutup <code className="bg-slate-800 px-1 rounded text-emerald-400">{`}`}</code> yang seimbang), <strong>Context-Free Grammar (CFG)</strong> mengambil alih.
            </p>
            <p>
              Di CFG, kita tidak bergerak maju seperti kereta, melainkan <strong>mengembangkan cabang seperti pohon (Tree)</strong>. Ini adalah inti dari mata kuliah Algoritma dan Struktur Data (ASD) yang biasa kamu koreksi!
            </p>
            <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-xl">
              <strong className="text-indigo-400">Anatomi CFG: G = (V, T, S, P)</strong>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm font-mono">
                <li><span className="text-amber-400">V (Variables):</span> Huruf besar (S, A, B). Elemen yang masih bisa diturunkan.</li>
                <li><span className="text-emerald-400">T (Terminals):</span> Karakter akhir (a, b, 0, 1). Daun pohon yang tidak bisa diturunkan.</li>
                <li><span className="text-rose-400">S (Start):</span> Variabel akar dari pohon.</li>
                <li><span className="text-cyan-400">P (Productions):</span> Aturan perubahannya.</li>
              </ul>
            </div>
          </div>
        )
      },
      { 
        id: 2, type: "interactive", title: "Simulator CFG (Penurunan Terkiri)", 
        content: "Mari kita simulasikan bagaimana compiler mengecek validitas susunan blok kode kurung kurawal secara bertahap menggunakan metode Leftmost Derivation (selalu proses variabel paling kiri).", 
        isCanvas: true, canvasType: "cfg" 
      },
      { 
        id: 3, type: "intro", title: "Masalah Fatal: Ambiguitas", iconName: "cfg",
        content: (
          <div className="space-y-4 text-slate-300">
            <p>
              Kekuatan CFG dalam membentuk <em>Tree</em> membawa satu "penyakit" bawaan: <strong className="text-rose-400">Ambiguitas</strong>.
            </p>
            <div className="p-4 bg-rose-900/20 border-l-4 border-rose-500 text-slate-200 italic rounded-r">
              "Sebuah Grammar dikatakan Ambigu jika untuk SATU string yang sama, mesin bisa menggambar DUA atau LEBIH Pohon Penurunan (Parse Tree) yang berbeda bentuknya."
            </div>
            <p>
              Kenapa ini berbahaya? Karena bagi <em>compiler</em>, bentuk <em>Tree</em> menentukan urutan eksekusi logika. Jika pohonnya beda, hasil matematikanya bisa beda (seperti bug fatal di aplikasi *backend*).
            </p>
            <p>Mari kita lihat visualisasinya menggunakan <em>grammar</em> kalkulator standar di halaman berikutnya.</p>
          </div>
        )
      },
      { 
        id: 4, type: "interactive", title: "Simulator Bencana Ambiguitas", 
        content: "Satu Grammar, satu String input (2 + 3 * 4), tapi menghasilkan dua pohon berbeda. Pilih pohon di bawah ini untuk melihat bagaimana ambiguitas menghancurkan logika matematika.", 
        isCanvas: true, canvasType: "ambiguity" 
      },
      { 
        id: 5, type: "intro", title: "Rangkuman Akhir Modul", iconName: "cfg",
        content: (
          <div className="space-y-4 text-slate-300">
            <p className="text-lg">
              <strong className="text-emerald-400">SELAMAT!</strong> Kamu telah menyelesaikan seluruh kurikulum "Studio Belajar: Bahasa & Automata".
            </p>
            <ul className="list-decimal pl-6 space-y-4 mt-4">
              <li>
                <strong className="text-indigo-400">CFG (Bab 5):</strong> Melampaui batas Regex dengan menggunakan <em>Stack/Tree</em> untuk mengingat pasangan. Aturan penurunan (<code className="bg-slate-800 text-white px-1 rounded">S → aSb</code>) memungkinkannya menghitung dengan akurat.
              </li>
              <li>
                <strong className="text-rose-400">Bahaya Ambiguitas:</strong> Ambiguitas menyebabkan lebih dari satu <em>Leftmost Derivation</em>. Cara mengobatinya di UTS: <u>Bongkar <em>Grammar</em>-nya!</u> Buat hierarki variabel baru (misal E, T, F) untuk memaksakan prioritas matematika.
              </li>
              <li>
                <strong className="text-white">Kesatuan Ilmu Komputer:</strong> Kamu kini memahami bahwa <em>Automata</em> adalah fondasi dari <em>Hardware (CPU)</em>, sementara <em>CFG</em> adalah fondasi dari <em>Software (Compiler/Parser)</em>. Keduanya bekerja sama menjalankan aplikasi <em>backend</em> yang kamu kembangkan setiap hari!
              </li>
            </ul>
            <div className="mt-6 p-4 bg-emerald-900/30 border border-emerald-500/50 rounded-xl text-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <h4 className="text-emerald-400 font-bold mb-2">🎓 Misi Selesai</h4>
              <p className="text-sm text-slate-300">Silakan tutup laptopmu. Otak logis dan visualmu sudah tersinkronisasi 100%. Semoga sukses mencetak nilai A di ujian esok pagi, Pison!</p>
            </div>
          </div>
        )
      }
    ]
  }
];