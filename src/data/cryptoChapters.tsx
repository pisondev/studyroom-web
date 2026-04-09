import { Slide, Chapter } from "./chapters";

export const cryptoCourseData: Chapter[] = [
  {
    id: "2",
    title: "Kriptografi Klasik",
    slides: [
      { 
        id: 1, 
        type: "concept", 
        title: "Konsep Dasar Penyandian", 
        content: "Kriptografi klasik memandang plaintext sebagai rangkaian karakter. Terdapat dua operasi utama: Substitusi (mengganti huruf dengan huruf lain) dan Transposisi (mengacak urutan huruf tanpa mengubah bentuknya). Gabungan keduanya disebut Product Cipher.", 
        iconName: "ShieldCheck" 
      },
      { 
        id: 2, 
        type: "concept", 
        title: "Kategori Substitusi", 
        content: "Monoalphabetic: 1 huruf plaintext selalu dipetakan ke 1 huruf ciphertext yang sama (contoh: Caesar, Affine). Sangat rentan terhadap analisis frekuensi. \n\nPolyalphabetic: 1 huruf plaintext bisa dipetakan ke banyak huruf ciphertext tergantung kunci saat itu (contoh: Vigenère, Playfair, Hill).", 
        iconName: "Network" 
      },
      { 
        id: 3, 
        type: "interactive", 
        title: "Simulasi Caesar Cipher", 
        content: "Caesar Cipher adalah bentuk paling sederhana dari Shift Cipher. Mari kita simulasikan pergeseran nilai k. Bentuk umumnya: C = (p + k) mod 26.", 
        iconName: "Activity", 
        isCanvas: true, 
        canvasType: "caesar" as any
      },
      { 
        id: 4, 
        type: "interactive", 
        title: "Simulasi Affine Cipher", 
        content: "Affine adalah perluasan dari Caesar. Alih-alih hanya ditambah, nilai indeks dikalikan dulu dengan A, lalu ditambah B. Rumusnya: C = (A * p + B) mod 26. \n\nSyarat mutlak: Nilai A harus 'Coprime' (relatif prima) terhadap 26 agar pesannya bisa dibalik (didekripsi).", 
        iconName: "Activity", 
        isCanvas: true, 
        canvasType: "affine" as any // Type assertion agar aman
      },
      { 
        id: 5, 
        type: "interactive", 
        title: "Simulasi Vigenère Cipher", 
        content: "Vigenère mengatasi kelemahan Caesar & Affine (Monoalphabetic) dengan menggunakan kunci yang diulang-ulang sepanjang teks (Polyalphabetic). Ini membuat huruf 'A' bisa menjadi 'X', 'Y', atau 'Z' tergantung huruf kunci yang sejajar dengannya.", 
        iconName: "Activity", 
        isCanvas: true, 
        canvasType: "vigenere" as any
      },
      { 
        id: 6, 
        type: "concept", 
        title: "Sandi Transposisi", 
        content: "Tidak ada huruf yang diubah, hanya posisinya yang ditukar. \n- Row Transposition: Tulis horizontal, baca vertikal berdasarkan kunci angka.\n- Rail Fence: Tulis zig-zag diagonal melintasi beberapa baris, lalu baca mendatar.", 
        iconName: "Combine" 
      },
      { 
        id: 7, 
        type: "concept", 
        title: "Rangkuman Bab 2", 
        content: "Kriptografi klasik berpusat pada permutasi (transposisi) dan substitusi alfabet. Meski OTP (One-Time Pad) secara teori mustahil dibobol, masalah distribusi kunci yang panjang membuatnya tidak praktis. Oleh karena itu, kita butuh algoritma modern seperti AES/DES.", 
        iconName: "BookCheck" 
      }
    ]
  }
];