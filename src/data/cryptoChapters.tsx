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
  },
  {
    id: "4",
    title: "Data Encryption Standard (DES)",
    slides: [
      { id: 1, type: "concept", title: "Pengenalan DES", content: "Diperkenalkan tahun 1977 berakar dari sandi IBM Lucifer. DES adalah block cipher simetris yang memproses data dalam blok 64-bit menggunakan kunci 56-bit.\n\nKarena diadaptasi dari struktur Feistel, proses dekripsi DES dilakukan dengan algoritma langkah yang sama persis dengan enkripsinya.", iconName: "ShieldCheck" },
      { id: 2, type: "concept", title: "Arsitektur 3 Fase DES", content: "1. Initial Permutation (IP): Blok 64-bit diacak posisinya di awal.\n2. 16 Rounds: Pemrosesan gaya Feistel (Substitusi & Permutasi). Di akhir ronde 16, L dan R ditukar (Swap).\n3. Inverse IP: Hasil akhir dipermutasi balik menggunakan tabel invers IP.", iconName: "Layers" },
      { id: 3, type: "interactive", title: "Jantung Enkripsi: Fungsi F & S-Box", content: "Di dalam 16 ronde, Fungsi F bertugas mengubah input 32-bit (R) menjadi output 32-bit. Prosesnya:\n1. Ekspansi (E): R 32-bit diekspansi jadi 48-bit.\n2. XOR: Di-XOR dengan Sub-Key 48-bit.\n3. S-Box: Dipecah jadi 8 blok (6-bit). Tiap blok diubah jadi 4-bit via tabel S-Box.\n4. Permutasi (P): 32-bit gabungan diacak ulang posisinya.", iconName: "Activity", isCanvas: true, canvasType: "dessbox" },
      { id: 4, type: "concept", title: "Key Scheduling DES", content: "Tugasnya memecah 1 Kunci Utama (64-bit) menjadi 16 Sub-Key (48-bit).\n\n- Bit parity diabaikan (kunci menyusut jadi 56-bit).\n- Dipecah jadi blok Kiri (C₀) & Kanan (D₀) 28-bit.\n- Tiap ronde, C & D dikenai Left Circular Shift (1 atau 2 bit).\n- Dikompresi lagi via matriks PC-2 menjadi Sub-Key 48-bit.", iconName: "KeyRound" },
      { id: 5, type: "concept", title: "Kelemahan DES & Lahirnya 3DES", content: "Kunci DES 'hanya' 56-bit, membuatnya rentan terhadap Brute-Force Attack modern (EFF memecahkannya < 1 hari di 1999).\n\nSolusinya adalah 3DES (Triple DES): Mengeksekusi algoritma DES 3 kali berurutan (Encrypt-Decrypt-Encrypt). \nC = E(K₃, D(K₂, E(K₁, P)))\nMeski lebih aman (kunci 112/168-bit), 3DES sangat lambat dan blok datanya tetap kecil (64-bit).", iconName: "AlertTriangle" }
    ]
  },
  {
    id: "5",
    title: "Matematika AES (Finite Fields)",
    slides: [
      { id: 1, type: "concept", title: "Keterbagian & Aritmetika Modular", content: "Aritmetika Modular: Operasi a mod n menghasilkan 'sisa' pembagian. \nContoh: 15 mod 7 = 1.\n\nDua angka disebut 'Kongruen' (a ≡ b mod n) jika mereka punya sisa pembagian yang sama. \n\nSifat operasi modulus bisa didistribusikan pada penjumlahan & perkalian.", iconName: "Combine" },
      { id: 2, type: "interactive", title: "Algoritma Euclid (Mencari GCD)", content: "Faktor Persekutuan Terbesar (GCD) penting untuk mencari 'Relatif Prima'. Dua angka disebut relatif prima jika GCD-nya = 1.\n\nAlgoritma Euclid mencarinya dengan rekursi: gcd(a,b) = gcd(b, a mod b) hingga sisanya 0. Mari kita coba kalkulatornya!", iconName: "Activity", isCanvas: true, canvasType: "euclidean" },
      { id: 3, type: "concept", title: "Struktur Aljabar Dasar", content: "Himpunan angka diklasifikasikan berdasar kemampuannya:\n1. Group: Punya 1 operasi (Tambah), ada 0, dan ada nilai minus (Invers).\n2. Ring: Punya 2 operasi (Tambah & Kali).\n3. Field: 'Bentuk Sempurna'. Bisa Tambah, Kurang, Kali, dan Bagi. Syaratnya: Setiap elemen (kecuali 0) WAJIB punya Invers Perkalian.", iconName: "Network" },
      { id: 4, type: "concept", title: "Galois Field: GF(p)", content: "Finite Field beroperasi di himpunan terbatas Zₚ = {0, ..., p-1}.\n\nAgar himpunan ini menjadi Field (semua angka punya invers bagi), angka p WAJIB berupa Bilangan Prima.\nJika p bukan prima, akan ada angka yang tidak relatif prima dengan p, sehingga tidak punya invers perkalian.", iconName: "ShieldCheck" },
      { id: 5, type: "interactive", title: "Masalah AES & GF(2⁸)", content: "AES beroperasi pada blok 8-bit (total 256 nilai). Tapi 256 BUKAN bilangan prima! Jika pakai Modulo biasa, kita tidak akan punya Invers Perkalian.\n\nSolusinya: GF(2⁸) Aritmetika Polinomial. Bit diperlakukan sebagai polinomial, dan modusnya diganti dengan 'Irreducible Polynomial' x⁸+x⁴+x³+x+1 (100011011).", iconName: "Activity", isCanvas: true, canvasType: "gf28math" }
    ]
  },
  {
    id: "6",
    title: "Advanced Encryption Standard (AES)",
    slides: [
      { id: 1, type: "concept", title: "Pengenalan AES (Rijndael)", content: "AES menggantikan 3DES karena butuh blok data yang lebih besar (128-bit) dan lebih efisien di CPU modern. \n\nAES memproses data 128-bit sekaligus (bukan Feistel!), menggunakan matriks State 4×4 byte. Mendukung panjang kunci 128-bit (10 ronde), 192-bit (12 ronde), atau 256-bit (14 ronde).", iconName: "ShieldCheck" },
      { id: 2, type: "interactive", title: "Transformasi State: SubBytes & ShiftRows", content: "Di setiap ronde, matriks 4x4 dikenai transformasi bertahap.\n\n1. SubBytes: Setiap byte diganti via S-Box (dibangun dari invers perkalian GF(2⁸) untuk memberikan Confusion maksimal).\n2. ShiftRows: Baris matriks digeser melingkar (Baris 2 geser 1, Baris 3 geser 2, Baris 4 geser 3).", iconName: "Activity", isCanvas: true, canvasType: "aesstate" },
      { id: 3, type: "concept", title: "Transformasi Lanjutan: MixColumns & AddRoundKey", content: "3. MixColumns: Setiap kolom dikalikan dengan matriks polinomial khusus di GF(2⁸). Ini memberikan fungsi Diffusion yang ekstrim.\n\n4. AddRoundKey: Matriks State di-XOR langsung dengan Sub-Key 128-bit. (Satu-satunya tahap yang melibatkan Kunci rahasia).", iconName: "Layers" },
      { id: 4, type: "concept", title: "Key Expansion & Dekripsi AES", content: "Kunci 128-bit diekspansi jadi 44 word (176 byte) menggunakan fungsi g (RotWord, SubWord, & XOR Konstanta Rcon).\n\nKarena AES bukan Feistel, proses Dekripsinya berbeda. Ia menggunakan invers dari seluruh operasi (Inverse S-Box, Inverse ShiftRows, Inverse MixColumns) dan mengumpankan sub-key secara terbalik.", iconName: "BookCheck" }
    ]
  }
];