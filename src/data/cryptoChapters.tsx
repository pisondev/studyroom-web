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
        iconName: "Activity", isCanvas: true, canvasType: "caesar" as any
      },
      { 
        id: 4, type: "interactive", 
        title: "Simulasi Affine Cipher", 
        content: "Affine adalah perluasan dari Caesar. Alih-alih hanya ditambah, nilai indeks dikalikan dulu dengan A, lalu ditambah B. Rumusnya: C = (A * p + B) mod 26. \n\nSyarat mutlak: Nilai A harus 'Coprime' (relatif prima) terhadap 26 agar pesannya bisa dibalik (didekripsi).", 
        iconName: "Activity", isCanvas: true, canvasType: "affine" as any 
      },
      { 
        id: 5, type: "interactive", 
        title: "Simulasi Vigenère Cipher", 
        content: "Vigenère mengatasi kelemahan Caesar & Affine (Monoalphabetic) dengan menggunakan kunci yang diulang-ulang sepanjang teks (Polyalphabetic). Ini membuat huruf 'A' bisa menjadi 'X', 'Y', atau 'Z' tergantung huruf kunci yang sejajar dengannya.", 
        iconName: "Activity", isCanvas: true, canvasType: "vigenere" as any
      },
      { 
        id: 6, type: "interactive", 
        title: "Simulasi Playfair Cipher", 
        content: "Playfair mengenkripsi dua huruf sekaligus (bigram) menggunakan matriks 5×5 yang dibentuk dari kata kunci (Huruf J dilebur dengan I).\n\nAturan Pemetaan:\n1. Sebaris: Diganti dengan huruf di sebelah kanannya.\n2. Sekolom: Diganti dengan huruf di bawahnya.\n3. Beda Baris & Kolom: Diganti dengan huruf pada sudut persegi yang terbentuk menyilang.", 
        iconName: "Activity", isCanvas: true, canvasType: "playfair" as any
      },
      { 
        id: 7, type: "interactive", 
        title: "Simulasi Hill Cipher", 
        content: "Menggunakan perkalian matriks secara aljabar linear. Enkripsi menggunakan matriks persegi K berukuran m × m.\n\nRumus enkripsi: C = pK mod 26.\nRumus dekripsi: p = C K⁻¹ mod 26.\n\nSyarat Mutlak: Matriks K harus invertible (memiliki invers) dan determinannya harus relatif prima terhadap 26.", 
        iconName: "Activity", isCanvas: true, canvasType: "hill" as any
      },
      { 
        id: 8, type: "interactive", 
        title: "Vernam & One-Time Pad (OTP)", 
        content: "Vernam Cipher: Menggunakan operasi logika XOR (⊕), sangat cocok untuk data biner. Rumus: Cᵢ = pᵢ ⊕ kᵢ.\n\nOne-Time Pad (OTP): Varian sempurna di mana panjang kunci sama dengan panjang pesan, kunci tidak berpola, dan hanya dipakai sekali. \n\nKekuatan: Secara teori mustahil dibobol (unconditionally secure). \nKelemahan: Sangat tidak praktis untuk mendistribusikan kunci rahasia yang terlalu panjang.", 
        iconName: "Activity", isCanvas: true, canvasType: "vernam" as any
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
        iconName: "Activity", isCanvas: true, canvasType: "rowtransposition" as any
      },
      { 
        id: 11, type: "interactive", 
        title: "Simulasi Rail Fence Cipher", 
        content: "Plaintext ditulis secara zig-zag atau diagonal melintasi k buah baris, lalu dibaca mendatar baris demi baris dari atas ke bawah.", 
        iconName: "Activity", isCanvas: true, canvasType: "railfence" as any
      },
      { 
        id: 12, type: "concept", 
        title: "Rangkuman Bab 2", 
        content: "Kriptografi klasik berpusat pada permutasi (transposisi) dan substitusi alfabet. Meski OTP (One-Time Pad) secara teori mustahil dibobol, masalah distribusi kunci yang panjang membuatnya tidak praktis. Oleh karena itu, kita butuh algoritma modern seperti AES/DES.", 
        iconName: "BookCheck" 
      }
    ]
  }
];