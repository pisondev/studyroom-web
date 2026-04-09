import { BrainCircuit, Activity, Database, Network, BarChart, Combine, BookCheck, ShieldCheck } from "lucide-react";
import { ReactNode } from "react";

export interface Slide {
  id: number;
  type: "intro" | "interactive" | "concept";
  title: string;
  content: string;
  iconName: string;
  isCanvas?: boolean;
  // --- PERBAIKAN: Tambahkan tipe canvas kripto di sini ---
  canvasType?: "datatypes" | "kmeans" | "hierarchical" | "dbscan" | "caesar" | "affine" | "vigenere";
}

export interface Chapter {
  id: string; 
  title: string;
  slides: Slide[];
}

// Data Machine Learning (Tidak ada yang diubah, persis seperti milikmu)
export const courseData: Chapter[] = [
  {
    id: "1",
    title: "Pengantar Machine Learning",
    slides: [
      { id: 1, type: "intro", title: "Evolusi Machine Learning", content: "Mesin tidak tiba-tiba menjadi pintar. Mari kita lihat sejarah bagaimana ilmuwan mengajari mesin berpikir, dari aturan kaku hingga eksplorasi mandiri.", iconName: "BrainCircuit" },
      { id: 2, type: "concept", title: "Sejarah: Masa Frustrasi Ilmuwan", content: "Tahun 1950-an: Ilmuwan lelah memprogram aturan 'IF-THEN' secara manual untuk setiap kemungkinan. Lahirlah Supervised Learning (Perceptron) yang bisa memprediksi jika diberi data berlabel. \n\nTahun 1960-an: Labeling data ternyata sangat mahal. Ahli biologi butuh cara mengelompokkan ribuan spesies hewan secara otomatis. Ini memicu lahirnya Unsupervised Learning (Hierarchical Clustering). Insinyur telekomunikasi yang butuh kecepatan lalu menyempurnakannya menjadi K-Means. \n\nTahun 1990-an: Data geografis dan satelit meledak. Bentuk data tak lagi bulat rapi. Lahirlah DBSCAN yang mendeteksi kepadatan.", iconName: "Database" },
      { id: 3, type: "intro", title: "Tipe Pembelajaran Utama", content: "Supervised (Punya Kunci Jawaban), Unsupervised (Tanpa Label, Mesin mencari pola mandiri), dan Reinforcement (Mesin belajar dari lingkungan menggunakan sistem Reward & Punishment).", iconName: "Network" },
      { id: 4, type: "concept", title: "Rangkuman Bab 1", content: "Kamu telah memahami bahwa ML adalah mesin yang mencari pola dari data. Seluruh algoritma yang kita pelajari diciptakan dari rasa frustrasi ilmuwan di masa lalu untuk menyelesaikan masalah spesifik di zamannya.", iconName: "BookCheck" }
    ]
  },
  {
    id: "2",
    title: "Eksplorasi Data",
    slides: [
      { id: 1, type: "intro", title: "Prinsip GIGO", content: "Garbage In, Garbage Out. Algoritma secanggih apa pun akan gagal jika data yang dimasukkan kotor atau salah format.", iconName: "Database" },
      { id: 2, type: "interactive", title: "Simulasi: Tipe Butir Data", content: "Pilih data di bawah ini dan masukkan ke kotak kategori yang benar! Ingat jebakan NIM yang kita bahas sebelumnya.", iconName: "Activity", isCanvas: true, canvasType: "datatypes" },
      { id: 3, type: "concept", title: "Visualisasi Dasar", content: "Gunakan Line Graph untuk data waktu (Time Series), Bar Chart untuk menghitung kategori, dan Scatter Plot untuk melihat korelasi antar dua variabel angka.", iconName: "BarChart" },
      { id: 4, type: "concept", title: "Rangkuman Bab 2", content: "Data adalah bahan bakar mesin. Kualitas prediksi tergantung pada data yang bersih. Selalu ingat urutan butir data dari yang paling sederhana hingga kompleks: Nominal (Label) -> Ordinal (Tingkatan) -> Interval (Jarak pasti, tanpa 0 mutlak) -> Rasio (Nilai matematis penuh dengan 0 mutlak).", iconName: "BookCheck" }
    ]
  },
  {
    id: "3",
    title: "Clustering Part 1",
    slides: [
      { id: 1, type: "intro", title: "Metode Partitioning", content: "Membagi data langsung ke dalam K kelompok. K-Means menggunakan rata-rata, K-Medoids menggunakan data asli.", iconName: "Network" },
      { id: 2, type: "interactive", title: "Simulator KMeans", content: "Simulasi algoritma K-Means dan K-Medoids secara visual.", iconName: "Activity", isCanvas: true, canvasType: "kmeans" },
      { id: 3, type: "interactive", title: "Hierarchical (Bottom-Up)", content: "Alih-alih membagi langsung, metode Agglomerative menggabungkan dua data terdekat selangkah demi selangkah hingga membentuk pohon silsilah.", iconName: "Combine", isCanvas: true, canvasType: "hierarchical" },
      { id: 4, type: "concept", title: "Rangkuman Bab 3", content: "K-Means sangat cepat tapi rawan hancur karena Outlier. K-Medoids lebih kebal karena memakai titik asli sebagai pusat. Hierarchical sangat cocok jika kita tidak tahu berapa jumlah kelompok (K) yang harus dicari sejak awal.", iconName: "BookCheck" }
    ]
  },
  {
    id: "4",
    title: "Clustering Part 2",
    slides: [
      { id: 1, type: "intro", title: "Kelemahan Bentuk Bulat", content: "K-Means dan Hierarchical sama-sama kesulitan jika bentuk data tidak beraturan (seperti donat atau bulan sabit).", iconName: "Network" },
      { id: 2, type: "interactive", title: "Simulator DBSCAN", content: "Metode berbasis kepadatan (Density-Based) yang dapat mendeteksi bentuk bebas dan membuang Noise (pencilan).", iconName: "Activity", isCanvas: true, canvasType: "dbscan" },
      { id: 3, type: "concept", title: "Rangkuman Bab 4", content: "DBSCAN adalah pahlawan untuk data tak beraturan. Ia menggunakan Eps (Jangkauan Radar) dan MinPts (Minimal Kerumunan) untuk membagi data menjadi Core (Inti), Border (Batas), dan Noise (Sampah yang diabaikan).", iconName: "BookCheck" }
    ]
  }
];

export const getIcon = (name: string): ReactNode => {
  switch (name) {
    case "BrainCircuit": return <BrainCircuit size={32} />;
    case "Database": return <Database size={32} />;
    case "Network": return <Network size={32} />;
    case "Activity": return <Activity size={32} />;
    case "BarChart": return <BarChart size={32} />;
    case "Combine": return <Combine size={32} />;
    case "BookCheck": return <BookCheck size={32} />;
    // --- PERBAIKAN: Tambahkan icon baru yang dipakai di bab kripto ---
    case "ShieldCheck": return <ShieldCheck size={32} />;
    default: return <BrainCircuit size={32} />;
  }
};