import { Slide, Chapter } from "./chapters";

export const cryptoCourseData: Chapter[] = [
  {
    id: "2",
    title: "Kriptografi Klasik",
    slides: [
      { 
        id: 1, type: "concept", 
        title: "Konsep Dasar Penyandian", 
        content: "Kriptografi klasik memandang plaintext sebagai rangkaian karakter. Terdapat dua operasi utama: Substitusi (mengganti huruf dengan huruf lain) dan Transposisi (mengacak urutan huruf tanpa mengubah bentuknya). Gabungan keduanya disebut Product Cipher.", 
        iconName: "ShieldCheck" 
      },
      { 
        id: 2, type: "concept", 
        title: "Kategori Substitusi", 
        content: "Monoalphabetic: 1 huruf plaintext selalu dipetakan ke 1 huruf ciphertext yang sama (contoh: Caesar, Affine). Sangat rentan terhadap analisis frekuensi. \n\nPolyalphabetic: 1 huruf plaintext bisa dipetakan ke banyak huruf ciphertext tergantung kunci saat itu (contoh: Playfair, Vigenère, Hill, Vernam).", 
        iconName: "Network" 
      },
      { 
        id: 3, type: "interactive", 
        title: "Simulasi Caesar Cipher", 
        content: "Caesar Cipher adalah bentuk paling sederhana dari Shift Cipher. Mari kita simulasikan pergeseran nilai k. Bentuk umumnya: C = (p + k) mod 26.", 
        iconName: "Activity", isCanvas: true, canvasType: "caesar" 
      },
      { 
        id: 4, type: "interactive", 
        title: "Simulasi Affine Cipher", 
        content: "Affine adalah perluasan dari Caesar. Alih-alih hanya ditambah, nilai indeks dikalikan dulu dengan A, lalu ditambah B. Rumusnya: C = (A * p + B) mod 26. \n\nSyarat mutlak: Nilai A harus 'Coprime' (relatif prima) terhadap 26 agar pesannya bisa dibalik (didekripsi).", 
        iconName: "Activity", isCanvas: true, canvasType: "affine" 
      },
      { 
        id: 5, type: "interactive", 
        title: "Simulasi Vigenère Cipher", 
        content: "Vigenère mengatasi kelemahan Caesar & Affine (Monoalphabetic) dengan menggunakan kunci yang diulang-ulang sepanjang teks (Polyalphabetic). Ini membuat huruf 'A' bisa menjadi 'X', 'Y', atau 'Z' tergantung huruf kunci yang sejajar dengannya.", 
        iconName: "Activity", isCanvas: true, canvasType: "vigenere" 
      },
      { 
        id: 6, type: "interactive", 
        title: "Simulasi Playfair Cipher", 
        content: "Playfair mengenkripsi dua huruf sekaligus (bigram) menggunakan matriks 5×5 yang dibentuk dari kata kunci (Huruf J dilebur dengan I).\n\nAturan Pemetaan:\n1. Sebaris: Diganti dengan huruf di sebelah kanannya.\n2. Sekolom: Diganti dengan huruf di bawahnya.\n3. Beda Baris & Kolom: Diganti dengan huruf pada sudut persegi yang terbentuk menyilang.", 
        iconName: "Activity", isCanvas: true, canvasType: "playfair" 
      },
      { 
        id: 7, type: "interactive", 
        title: "Simulasi Hill Cipher", 
        content: "Menggunakan perkalian matriks secara aljabar linear. Enkripsi menggunakan matriks persegi K berukuran m × m.\n\nRumus enkripsi: C = pK mod 26.\nRumus dekripsi: p = C K⁻¹ mod 26.\n\nSyarat Mutlak: Matriks K harus invertible (memiliki invers) dan determinannya harus relatif prima terhadap 26.", 
        iconName: "Activity", isCanvas: true, canvasType: "hill" 
      },
      { 
        id: 8, type: "interactive", 
        title: "Vernam & One-Time Pad (OTP)", 
        content: "Vernam Cipher: Menggunakan operasi logika XOR (⊕), sangat cocok untuk data biner. Rumus: Cᵢ = pᵢ ⊕ kᵢ.\n\nOne-Time Pad (OTP): Varian sempurna di mana panjang kunci sama dengan panjang pesan, kunci tidak berpola, dan hanya dipakai sekali. \n\nKekuatan: Secara teori mustahil dibobol (unconditionally secure). \nKelemahan: Sangat tidak praktis untuk mendistribusikan kunci rahasia yang terlalu panjang.", 
        iconName: "Activity", isCanvas: true, canvasType: "vernam" 
      },
      { 
        id: 9, type: "concept", 
        title: "Sandi Transposisi", 
        content: "Tidak ada huruf yang diubah, hanya posisinya yang ditukar. Mari kita pelajari dua varian utamanya: Row Transposition dan Rail Fence pada slide interaktif berikutnya.", 
        iconName: "Combine" 
      },
      { 
        id: 10, type: "interactive", 
        title: "Simulasi Row Transposition", 
        content: "Plaintext ditulis secara horizontal baris demi baris ke dalam grid kolom, tetapi ciphertext dibaca/diambil secara vertikal kolom demi kolom.\n\nKita menggunakan deretan angka acak sebagai Kunci (Key) untuk menentukan urutan kolom mana yang harus dibaca lebih dulu.", 
        iconName: "Activity", isCanvas: true, canvasType: "rowtransposition" 
      },
      { 
        id: 11, type: "interactive", 
        title: "Simulasi Rail Fence Cipher", 
        content: "Plaintext ditulis secara zig-zag atau diagonal melintasi k buah baris, lalu dibaca mendatar baris demi baris dari atas ke bawah.", 
        iconName: "Activity", isCanvas: true, canvasType: "railfence" 
      },
      { 
        id: 12, type: "concept", 
        title: "Rangkuman Bab 2", 
        content: "Kriptografi klasik berpusat pada permutasi (transposisi) dan substitusi alfabet. Meski OTP secara teori aman mutlak, distribusi kuncinya tidak praktis. Kita butuh algoritma modern.", 
        iconName: "BookCheck" 
      }
    ]
  },
  {
    id: "3",
    title: "Kriptografi Simetris Modern",
    slides: [
      { 
        id: 1, type: "concept", 
        title: "Dimensi & Konsep Dasar", 
        content: "Kriptografi Simetris (Secret Key) berarti pengirim dan penerima harus berbagi satu kunci rahasia yang sama. Persamaannya: Y = E(K, X) dan X = D(K, Y).\n\nKriptografi dibedakan dari cara memprosesnya:\n- Stream Cipher: Memproses input secara kontinyu (mengalir).\n- Block Cipher: Memproses 1 blok utuh dalam satu waktu.", 
        iconName: "ShieldCheck" 
      },
      { 
        id: 2, type: "interactive", 
        title: "Stream vs Block Cipher", 
        content: "Stream Cipher mengenkripsi data 1 bit sekaligus menggunakan bit-stream generator. Sedangkan Block Cipher mengenkripsi data secara terpotong dalam blok-blok (misal 64-bit).\n\nMari kita lihat perbedaannya secara visual.", 
        iconName: "Activity", isCanvas: true, canvasType: "streamvsblock" 
      },
      { 
        id: 3, type: "concept", 
        title: "Kriptoanalisis & Tipe Serangan", 
        content: "Berdasarkan Kerkhoff's Principle, diasumsikan intruder tahu semua detail sistem KECUALI kuncinya. Tingkatan serangan dari tersulit ke termudah:\n1. Ciphertext-only: Hanya punya ciphertext.\n2. Known-plaintext: Punya beberapa pasang plaintext-ciphertext asli.\n3. Chosen-plaintext: Bisa memilih plaintext untuk dienkripsi mesin.\n4. Chosen-ciphertext: Bisa memilih ciphertext untuk didekripsi mesin.", 
        iconName: "BrainCircuit" 
      },
      { 
        id: 4, type: "concept", 
        title: "Kriteria Keamanan Algoritma", 
        content: "Unconditionally Secure: Mustahil dibobol walau punya waktu & resource tak terbatas (hanya OTP yang memenuhi ini).\n\nComputationally Secure: Aman secara praktis karena (1) Biaya memecahkan > nilai informasi, ATAU (2) Waktu memecahkan > umur informasi tersebut.", 
        iconName: "BookCheck" 
      },
      { 
        id: 5, type: "interactive", 
        title: "Confusion, Diffusion & Avalanche", 
        content: "Konsep Claude Shannon (1949):\n- Diffusion: Perubahan 1 bit plaintext akan mengubah banyak bit ciphertext (meratakan statistik).\n- Confusion: Membuat hubungan ciphertext & kunci sekompleks mungkin.\n\nMari simulasikan 'Avalanche Effect' (Efek Longsor) dari perubahan 1 bit kecil.", 
        iconName: "Activity", isCanvas: true, canvasType: "avalanche" 
      },
      { 
        id: 6, type: "concept", 
        title: "Masalah Block Ideal", 
        content: "Block cipher ideal (memetakan blok n-bit unik ke n-bit unik) sangat tidak praktis. Jika blok = 64-bit, maka panjang kuncinya harus 64 × 2⁶⁴ bit (≈ 10²¹ bit!). \n\nSolusinya? Horst Feistel (1973) menciptakan struktur Product Cipher yang brilian menggunakan operasi berulang.", 
        iconName: "Network" 
      },
      { 
        id: 7, type: "interactive", 
        title: "Struktur Feistel Cipher", 
        content: "Blok input dipecah jadi Kiri (L₀) dan Kanan (R₀). Data melewati n putaran (rounds). Di setiap putaran, R dikawinkan dengan Sub-Key via Fungsi (F), lalu di-XOR dengan L. Kemudian mereka bertukar posisi menyilang.\n\nDekripsi menggunakan sirkuit yang SAMA PERSIS, hanya membalik urutan kuncinya.", 
        iconName: "Activity", isCanvas: true, canvasType: "feistel" 
      },
      { 
        id: 8, type: "concept", 
        title: "Prinsip Desain Penguat (Rangkuman Bab 3)", 
        content: "Kekuatan Feistel bergantung pada:\n1. Ukuran Blok & Kunci (Makin besar = aman tapi lambat).\n2. Jumlah Tahap (Biasanya 16 rounds).\n3. Fungsi F (Harus non-linier & punya Avalanche Effect).\n4. Key Scheduling (Algoritma pemecah kunci harus rumit agar pola tak mudah ditebak).", 
        iconName: "BookCheck" 
      }
    ]
  }
];