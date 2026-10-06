import * as XLSX from 'xlsx';

// Generates a valid sample Excel file with realistic Olympiad questions
export function generateSampleExcelFile(): File {
  const sampleData = [
    {
      No: 1,
      Soal: 'Pada suatu rantai makanan di ekosistem sawah, padi dimakan belalang, belalang dimakan katak, katak dimakan ular, dan ular dimakan burung elang. Jika populasi ular mengalami penurunan drastis akibat perburuan liar, dampak langsung yang paling mungkin terjadi adalah...',
      A: 'Populasi katak akan meningkat drastis',
      B: 'Populasi belalang akan berkurang drastis',
      C: 'Populasi burung elang akan meningkat drastis',
      D: 'Produksi padi akan meningkat berlipat ganda',
      Kunci: 'A',
      Pembahasan: 'Ular adalah predator utama katak. Jika populasi ular menurun, pemangsaan terhadap katak berkurang sehingga populasi katak meningkat drastis.',
      Difficulty: 'Mudah',
    },
    {
      No: 2,
      Soal: 'Sebuah pensil dimasukkan ke dalam gelas bening yang berisi air setengahnya. Pensil tersebut tampak patah pada batas antara udara dan air. Fenomena ini membuktikan sifat cahaya yaitu...',
      A: 'Cahaya dapat dipantulkan sempurna',
      B: 'Cahaya mengalami pembiasan ketika merambat melalui dua medium berbeda kerapatan',
      C: 'Cahaya merambat lurus tanpa hambatan',
      D: 'Cahaya mengalami difraksi oleh dinding kaca',
      Kunci: 'B',
      Pembahasan: 'Pembiasan (refraksi) cahaya terjadi saat cahaya merambat miring melalui dua medium dengan kerapatan optik berbeda (udara dan air).',
      Difficulty: 'Sedang',
    },
    {
      No: 3,
      Soal: 'Tumbuhan kaktus yang hidup di lingkungan gurun yang panas dan kering memiliki adaptasi fisiologis dan morfologis khusus berupa daun yang berubah menjadi duri. Fungsi utama adaptasi tersebut adalah...',
      A: 'Mempercepat proses fotosintesis di siang hari',
      B: 'Menarik serangga penyerbuk dari kejauhan',
      C: 'Mengurangi penguapan air (transpirasi) akibat sengatan matahari',
      D: 'Menyimpan cadangan makanan dalam waktu lama',
      Kunci: 'C',
      Pembahasan: 'Bentuk daun yang tereduksi menjadi duri memperkecil luas permukaan sehingga transpirasi atau penguapan air dapat ditekan seminimal mungkin.',
      Difficulty: 'Mudah',
    },
    {
      No: 4,
      Soal: 'Dua buah benda bermassa sama dijatuhkan bersamaan dari ketinggian 10 meter di ruang hampa udara. Benda A berbentuk bulat padat dan benda B berbentuk lembaran tipis. Manakah pernyataan yang benar?',
      A: 'Benda A jatuh lebih cepat karena hambatannya kecil',
      B: 'Benda B jatuh lebih cepat karena memiliki luas alas besar',
      C: 'Kedua benda mencapai tanah secara bersamaan karena tidak ada hambatan udara',
      D: 'Benda A tidak akan mencapai tanah',
      Kunci: 'C',
      Pembahasan: 'Di ruang hampa udara, tidak terdapat gaya gesek/hambatan udara, sehingga semua benda jatuh dengan percepatan gravitasi yang sama (g) dan tiba serentak.',
      Difficulty: 'Sedang',
    },
    {
      No: 5,
      Soal: 'Proses pertukaran gas oksigen (O2) dan karbon dioksida (CO2) pada sistem pernapasan manusia terjadi secara difusi di bagian...',
      A: 'Trakea',
      B: 'Bronkus',
      C: 'Alveolus',
      D: 'Laring',
      Kunci: 'C',
      Pembahasan: 'Alveolus memiliki dinding epitel yang sangat tipis dan dikelilingi kapiler darah, menjadi tempat pertukaran gas O2 dan CO2.',
      Difficulty: 'Sedang',
    },
    {
      No: 6,
      Soal: 'Perhatikan gambar penampang daun: Stomata sebagian besar terdapat pada bagian epidermis bawah daun. Stomata ini berfungsi untuk...',
      A: 'Pertukaran gas dan penguapan air',
      B: 'Menyerap air dari udara bebas',
      C: 'Menghasilkan klorofil hijau daun',
      D: 'Mengangkut hasil fotosintesis ke akar',
      Kunci: 'A',
      Pembahasan: 'Stomata atau mulut daun berfungsi sebagai pintu pertukaran gas pernapasan dan tempat terjadinya transpirasi.',
      Difficulty: 'Sedang',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Soal_Olimpiade_IPA');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  return new File([excelBuffer], 'Naskah_Soal_Olimpiade_IPA_SD.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
