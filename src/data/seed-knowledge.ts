// ============================================
// Radha Bali - Seed Knowledge Base Documents
// FAQs, guides, tips, and policies
// ============================================

import type { DocumentFormData } from '@/lib/types';

export const seedDocuments: DocumentFormData[] = [
  // ============================================
  // DESTINATION GUIDES
  // ============================================
  {
    title: 'Panduan Wisata Bali - Overview',
    content:
      'Bali adalah provinsi di Indonesia yang terkenal sebagai destinasi wisata dunia. Bali dikenal dengan pantai-pantainya yang indah, sawah terasering, pura-pura Hindu, seni dan budaya yang kaya, serta hospitalitas penduduknya. Bali terdiri dari beberapa area wisata utama: Kuta (pantai, belanja, nightlife), Seminyak (pantai, fine dining, boutique), Ubud (budaya, seni, alam), Nusa Dua (resort mewah, pantai tenang), Uluwatu (surfing, tebing, sunset), dan Kintamani (gunung berapi, danau). Musim terbaik untuk berkunjung adalah April-Oktober (musim kering). Suhu rata-rata 27-30°C sepanjang tahun.',
    source_type: 'guide',
    metadata: { category: 'destination', region: 'Bali' },
  },
  {
    title: 'Panduan Area Kuta & Legian',
    content:
      'Kuta dan Legian adalah area wisata paling populer di Bali selatan. Kuta terkenal dengan pantainya yang lebar, ombak untuk surfing pemula, dan Kuta Art Market untuk belanja souvenir. Legian lebih tenang dari Kuta dengan bar dan restoran di Jalan Legian. Discovery Mall dan Beachwalk Shopping Center ada di area ini. Pantai Kuta memiliki sunset yang indah setiap sore. Area ini dekat dengan Bandara Ngurah Rai (20 menit). Tips: hindari peak season Juli-Agustus dan Natal karena sangat ramai.',
    source_type: 'guide',
    metadata: { category: 'destination', destination: 'Kuta' },
  },
  {
    title: 'Panduan Area Seminyak & Canggu',
    content:
      'Seminyak adalah area upscale di Bali dengan beach clubs, restoran fine dining, dan butik desainer. Pantai Seminyak dan Double Six Beach populer untuk sunset. Potato Head Beach Club dan Ku De Ta adalah beach club terkenal. Canggu lebih ke utara, populer di kalangan digital nomad dan surfer. Echo Beach dan Batu Bolong Beach memiliki ombak bagus. Canggu memiliki banyak cafe hipster dan coworking space. Harga di Seminyak lebih mahal dari Kuta, sementara Canggu menawarkan balance antara harga dan kualitas.',
    source_type: 'guide',
    metadata: { category: 'destination', destination: 'Seminyak' },
  },
  {
    title: 'Panduan Ubud - Jantung Budaya Bali',
    content:
      'Ubud adalah pusat seni dan budaya Bali, terletak di dataran tinggi dikelilingi sawah terasering dan hutan. Tempat wajib dikunjungi: Tegallalang Rice Terrace, Ubud Monkey Forest (Sacred Monkey Forest Sanctuary), Tirta Empul (pura mata air suci), Museum ARMA, dan Ubud Palace. Ubud juga pusat yoga dan wellness, dengan banyak studio yoga dan retreat center. Pasar Seni Ubud buka setiap pagi untuk belanja kerajinan tangan. Restoran vegetarian dan organik banyak tersedia. Cuaca Ubud lebih sejuk dari pantai selatan (24-28°C).',
    source_type: 'guide',
    metadata: { category: 'destination', destination: 'Ubud' },
  },
  {
    title: 'Panduan Nusa Penida',
    content:
      'Nusa Penida adalah pulau di tenggara Bali yang terkenal dengan pemandangan dramatis. Kelingking Beach (T-Rex cliff) adalah spot foto paling ikonik. Angel Billabong adalah kolam alami di tepi laut. Broken Beach memiliki terowongan batu alami yang menakjubkan. Crystal Bay adalah spot snorkeling terbaik. Manta Point untuk berenang bersama Manta Ray (musim terbaik: April-November). Akses dari Sanur Harbor dengan speedboat 30-45 menit. Jalan di Nusa Penida cukup menantang, disarankan sewa motor atau mobil dengan driver. Minimal butuh 2 hari untuk menjelajahi semua spot utama.',
    source_type: 'guide',
    metadata: { category: 'destination', destination: 'Nusa Penida' },
  },
  {
    title: 'Panduan Kintamani & Gunung Batur',
    content:
      'Kintamani terletak di dataran tinggi Bali utara, terkenal dengan Gunung Batur (gunung berapi aktif setinggi 1.717m) dan Danau Batur. Trekking sunrise Gunung Batur dimulai sekitar jam 2-3 pagi dan memakan waktu 2 jam pendakian. Di puncak, Anda bisa melihat sunrise dengan latar Gunung Agung dan Danau Batur. Telur dan pisang dimasak dengan uap vulkanik di puncak. Pemandian air panas alami (Toya Bungkah Hot Spring) tersedia setelah trekking. Suhu di Kintamani bisa turun sampai 15°C di malam hari, bawa jaket. Restoran di tepi kaldera menawarkan makan siang buffet dengan view spektakuler.',
    source_type: 'guide',
    metadata: { category: 'destination', destination: 'Kintamani' },
  },
  {
    title: 'Panduan Uluwatu',
    content:
      'Uluwatu terletak di ujung selatan semenanjung Bukit, Bali. Pura Uluwatu dibangun di tebing setinggi 70 meter di atas laut dan merupakan salah satu pura laut paling penting di Bali. Pertunjukan Tari Kecak diadakan setiap sore saat sunset (jam 18:00). Hati-hati dengan monyet di sekitar pura yang suka mengambil barang wisatawan. Pantai-pantai di Uluwatu (Padang Padang, Dreamland, Bingin) terkenal untuk surfing. GWK Cultural Park (Garuda Wisnu Kencana) juga ada di area ini. Single Fin adalah rooftop bar terkenal untuk menikmati sunset sambil menonton surfer.',
    source_type: 'guide',
    metadata: { category: 'destination', destination: 'Uluwatu' },
  },

  // ============================================
  // FAQ - FREQUENTLY ASKED QUESTIONS
  // ============================================
  {
    title: 'FAQ - Cara Booking dan Pembayaran',
    content:
      'Pertanyaan: Bagaimana cara memesan paket wisata di Radha Bali? Jawaban: Anda bisa memesan langsung melalui chat dengan asisten AI kami. Sampaikan preferensi Anda (destinasi, budget, durasi, minat) dan kami akan merekomendasikan paket yang sesuai. Setelah memilih, tim kami akan menghubungi Anda untuk konfirmasi dan pembayaran. Pembayaran bisa dilakukan melalui transfer bank (BCA, Mandiri, BNI), e-wallet (GoPay, OVO, Dana), atau kartu kredit. DP minimal 30% dari total harga, pelunasan paling lambat 3 hari sebelum keberangkatan.',
    source_type: 'faq',
    metadata: { category: 'booking' },
  },
  {
    title: 'FAQ - Kebijakan Pembatalan',
    content:
      'Pertanyaan: Bagaimana kebijakan pembatalan Radha Bali? Jawaban: Pembatalan lebih dari 14 hari sebelum keberangkatan: refund 100% (dikurangi biaya admin Rp 50.000). Pembatalan 7-14 hari sebelum: refund 75%. Pembatalan 3-7 hari sebelum: refund 50%. Pembatalan kurang dari 3 hari: tidak ada refund. Reschedule bisa dilakukan 1 kali tanpa biaya tambahan jika dilakukan minimal 7 hari sebelum keberangkatan. Force majeure (bencana alam, pandemi): refund penuh atau reschedule tanpa batas waktu.',
    source_type: 'policy',
    metadata: { category: 'cancellation' },
  },
  {
    title: 'FAQ - Apa Yang Harus Dibawa ke Bali',
    content:
      'Pertanyaan: Apa yang harus dibawa saat liburan ke Bali? Jawaban: Pakaian ringan dan nyaman (katun, linen), baju renang, sunscreen SPF 50+, topi dan kacamata hitam, sandal dan sepatu trekking (jika ada aktivitas outdoor), sarung atau kain (wajib saat masuk pura), obat-obatan pribadi, power bank, dry bag untuk aktivitas air, dan mosquito repellent. Untuk trekking Gunung Batur, bawa jaket hangat karena suhu bisa 15°C. Jangan lupa bawa adapter jika dari luar negeri (Indonesia menggunakan tipe C/F, 230V).',
    source_type: 'tips',
    metadata: { category: 'packing' },
  },
  {
    title: 'FAQ - Cuaca dan Musim Terbaik di Bali',
    content:
      'Pertanyaan: Kapan waktu terbaik untuk ke Bali? Jawaban: Bali memiliki 2 musim: kering (April-Oktober) dan hujan (November-Maret). Musim terbaik untuk berkunjung adalah April-Oktober dengan cuaca cerah dan sedikit hujan. Peak season: Juli-Agustus (musim panas Eropa/Australia) dan Desember-Januari (Natal & Tahun Baru) — harga lebih mahal dan lebih ramai. Shoulder season terbaik: April-Juni dan September-Oktober — cuaca bagus, harga lebih murah, lebih sepi. Suhu rata-rata 27-30°C di pantai, 24-28°C di Ubud, 15-25°C di Kintamani. Untuk diving/snorkeling, visibility terbaik April-November.',
    source_type: 'faq',
    metadata: { category: 'weather' },
  },
  {
    title: 'FAQ - Transportasi di Bali',
    content:
      'Pertanyaan: Bagaimana transportasi di Bali? Jawaban: Bali tidak memiliki transportasi publik yang memadai. Opsi utama: (1) Sewa motor Rp 70-100k/hari — paling fleksibel tapi perlu SIM internasional. (2) Sewa mobil + driver Rp 500-700k/hari 10 jam — paling nyaman. (3) Grab/Gojek — tersedia tapi tidak boleh masuk beberapa area wisata. (4) Shuttle bus (Perama, Kura-Kura Bus) — rute terbatas. Jarak Kuta-Ubud sekitar 1-1.5 jam, Kuta-Uluwatu 45 menit, Kuta-Kintamani 2 jam. Tips: hindari jam macet 8-9 pagi dan 5-7 sore di area Kuta-Denpasar.',
    source_type: 'faq',
    metadata: { category: 'transport' },
  },
  {
    title: 'FAQ - Keamanan dan Kesehatan di Bali',
    content:
      'Pertanyaan: Apakah Bali aman untuk wisatawan? Jawaban: Bali umumnya sangat aman untuk wisatawan. Tips keamanan: jaga barang berharga (terutama dari monyet di Monkey Forest dan Uluwatu), gunakan safe deposit box hotel, hindari membeli obat-obatan terlarang (hukuman sangat berat di Indonesia), waspada jipser dan pencopet di area ramai. Kesehatan: minum air kemasan (bukan keran), gunakan sunscreen, hindari makanan yang kurang matang di warung pinggir jalan jika perut sensitif. Rumah sakit internasional tersedia: BIMC Hospital dan Siloam Hospital. Asuransi perjalanan sangat disarankan.',
    source_type: 'tips',
    metadata: { category: 'safety' },
  },
  {
    title: 'FAQ - Etika dan Budaya Bali',
    content:
      'Pertanyaan: Apa saja etika yang harus diperhatikan di Bali? Jawaban: Bali memiliki budaya Hindu yang kuat. Aturan penting: (1) Saat masuk pura, wajib pakai sarung dan selendang (biasanya disediakan atau bisa sewa). (2) Wanita yang sedang menstruasi tidak boleh masuk pura. (3) Jangan menyentuh kepala orang Bali (dianggap suci). (4) Jangan menunjuk dengan telunjuk, gunakan ibu jari. (5) Saat Nyepi (Hari Raya Hindu), seluruh Bali tutup — tidak boleh keluar, menyalakan lampu, atau membuat keributan selama 24 jam. (6) Hormati upacara dan procesi keagamaan yang sering berlangsung di jalan.',
    source_type: 'tips',
    metadata: { category: 'culture' },
  },
  {
    title: 'FAQ - Kuliner Bali yang Wajib Dicoba',
    content:
      'Pertanyaan: Makanan khas Bali apa yang harus dicoba? Jawaban: Babi Guling (whole roasted pig — specialty Bali, coba di Ibu Oka Ubud), Bebek Betutu (duck slow-cooked in banana leaves), Sate Lilit (sate ikan khas Bali berbeda dari sate biasa), Lawar (campuran sayur, daging, dan kelapa parut), Nasi Campur Bali, Nasi Jinggo (nasi kecil murah Rp 5-10k), Pisang Rai (pisang goreng dengan tepung beras dan kelapa), Jaje Bali (kue tradisional), Kopi Bali dan Kopi Luwak. Untuk seafood, Jimbaran Bay adalah pilihan terbaik. Warung lokal biasanya Rp 25-50k per porsi, restoran wisata Rp 80-200k.',
    source_type: 'guide',
    metadata: { category: 'culinary' },
  },
  {
    title: 'FAQ - Budget dan Biaya di Bali',
    content:
      'Pertanyaan: Berapa budget liburan ke Bali? Jawaban: Budget per hari (per orang): Backpacker Rp 300-500k (hostel, warung lokal, motor), Mid-range Rp 800k-1.5jt (hotel bintang 3, restoran, sewa mobil), Luxury Rp 3-10jt+ (resort, fine dining, private tour). Contoh budget 3 hari: Backpacker ~Rp 1-1.5jt, Mid-range ~Rp 3-5jt, Luxury ~Rp 10-30jt. Harga di luar tiket pesawat. Tiket pesawat Jakarta-Bali PP: Rp 1-3jt (booking jauh hari lebih murah). Tips hemat: kunjungi di shoulder season, makan di warung lokal, sewa motor, dan gunakan paket wisata yang sudah include banyak hal.',
    source_type: 'faq',
    metadata: { category: 'budget' },
  },
  {
    title: 'FAQ - Surfing di Bali',
    content:
      'Pertanyaan: Di mana spot surfing terbaik di Bali? Jawaban: Bali adalah salah satu destinasi surfing terbaik di dunia. Spot untuk pemula: Kuta Beach (ombak kecil, pantai landai), Batu Bolong Canggu (konsisten, ramah pemula). Intermediate: Echo Beach Canggu, Padang Padang, Old Man\'s. Advanced/Expert: Uluwatu (reef break kelas dunia), Bingin, Impossibles, Keramas. Musim terbaik surfing pantai barat (Kuta, Canggu, Uluwatu): April-Oktober. Pantai timur (Keramas, Sanur): November-Maret. Harga sewa surfboard: Rp 50-100k/jam. Pelajaran surfing: Rp 350-500k/2 jam.',
    source_type: 'guide',
    metadata: { category: 'surfing' },
  },
  {
    title: 'FAQ - Diving dan Snorkeling di Bali',
    content:
      'Pertanyaan: Di mana spot diving/snorkeling terbaik di Bali? Jawaban: Spot diving terbaik: Tulamben (USS Liberty Wreck — wreck dive terbaik di Asia), Amed (coral garden, Japanese Shipwreck), Menjangan Island (wall diving pristine), Nusa Penida (Manta Ray di Manta Point), Padang Bai (Blue Lagoon, Shark Point). Untuk snorkeling tanpa diving license: Crystal Bay Nusa Penida, Blue Lagoon Padang Bai, Amed coral garden, Menjangan Island. Harga fun dive: Rp 700k-1.5jt/dive. PADI Open Water course (3-4 hari): Rp 5-7jt. Visibility terbaik: April-November. Suhu air: 26-29°C.',
    source_type: 'guide',
    metadata: { category: 'diving' },
  },

  // ============================================
  // POLICIES
  // ============================================
  {
    title: 'Kebijakan Reschedule Radha Bali',
    content:
      'Kebijakan reschedule Radha Bali: Reschedule gratis 1 kali jika dilakukan minimal 7 hari sebelum tanggal keberangkatan. Reschedule kedua dan seterusnya dikenakan biaya admin Rp 100.000. Reschedule ke tanggal peak season (Juli-Agustus, Desember-Januari) mungkin ada selisih harga yang harus dibayar. Reschedule harus ke tanggal dalam 6 bulan dari tanggal booking awal. Untuk group booking (lebih dari 5 orang), reschedule harus dilakukan minimal 14 hari sebelum keberangkatan. Hubungi customer service kami untuk proses reschedule.',
    source_type: 'policy',
    metadata: { category: 'reschedule' },
  },
  {
    title: 'Syarat dan Ketentuan Radha Bali',
    content:
      'Syarat dan ketentuan umum Radha Bali: (1) Harga yang tertera adalah per orang kecuali disebutkan lain. (2) Harga dapat berubah sewaktu-waktu tanpa pemberitahuan terlebih dahulu. (3) Kuota terbatas, first come first served. (4) Peserta wajib dalam kondisi sehat. Untuk aktivitas adventure (rafting, trekking, diving), ada batasan usia dan kondisi kesehatan tertentu. (5) Radha Bali tidak bertanggung jawab atas kehilangan barang pribadi. (6) Foto dan video selama tur dapat digunakan untuk keperluan promosi Radha Bali. (7) Perubahan itinerary dapat terjadi karena cuaca atau kondisi force majeure.',
    source_type: 'policy',
    metadata: { category: 'terms' },
  },
  {
    title: 'Asuransi Perjalanan',
    content:
      'Radha Bali sangat merekomendasikan asuransi perjalanan untuk semua peserta. Beberapa paket adventure (rafting, diving, trekking) sudah termasuk asuransi kecelakaan dasar. Untuk perlindungan yang lebih lengkap (medis, pembatalan, kehilangan bagasi), disarankan membeli asuransi perjalanan terpisah. Partner asuransi kami: Allianz Travel Insurance dan AXA Mandiri. Harga asuransi perjalanan domestik mulai dari Rp 50.000 per trip. Klaim asuransi harus dilakukan dalam 14 hari setelah kejadian.',
    source_type: 'policy',
    metadata: { category: 'insurance' },
  },

  // ============================================
  // ADDITIONAL TIPS
  // ============================================
  {
    title: 'Tips Hemat Liburan di Bali',
    content:
      'Tips menghemat biaya liburan di Bali: (1) Kunjungi di shoulder season (April-Juni, September-Oktober). (2) Makan di warung lokal — rasa autentik, harga Rp 20-40k. (3) Sewa motor Rp 70k/hari lebih hemat dari taksi. (4) Gunakan aplikasi Grab/Gojek. (5) Beli tiket pesawat jauh hari (minimal 1-2 bulan). (6) Pilih homestay atau guesthouse Rp 150-300k/malam. (7) Negosiasi harga di pasar seni (mulai dari 50% harga awal). (8) Bawa botol air isi ulang (banyak refill station). (9) Gabung open trip untuk berbagi biaya. (10) Manfaatkan paket combo Radha Bali yang sudah hemat.',
    source_type: 'tips',
    metadata: { category: 'budget' },
  },
  {
    title: 'Tips Foto Instagram di Bali',
    content:
      'Spot foto Instagram terbaik di Bali: (1) Gates of Heaven - Lempuyang Temple (datang pagi jam 6-7 untuk menghindari antrian). (2) Tegallalang Rice Terrace - Bali Swing. (3) Kelingking Beach Nusa Penida (T-Rex cliff). (4) Handara Gate (iconic Bali gate). (5) Tirta Gangga Water Palace. (6) Tegenungan Waterfall. (7) Campuhan Ridge Walk Ubud (golden hour terbaik). (8) Pantai Melasti (pantai tersembunyi). Tips: datangi spot populer pagi-pagi (sebelum jam 9) untuk menghindari keramaian. Golden hour terbaik untuk foto: 6-7 pagi dan 5-6 sore.',
    source_type: 'tips',
    metadata: { category: 'photography' },
  },
  {
    title: 'Tentang Radha Bali',
    content:
      'Radha Bali adalah platform travel dan wisata terpercaya yang fokus pada pengalaman wisata terbaik di Bali dan sekitarnya. Didirikan oleh pecinta travel yang ingin memudahkan wisatawan menemukan paket wisata yang tepat. Keunggulan Radha Bali: (1) Asisten AI yang membantu menemukan paket sesuai preferensi. (2) Harga transparan, tidak ada biaya tersembunyi. (3) Guide lokal berpengalaman. (4) Paket customizable sesuai kebutuhan. (5) Customer service 24/7. (6) Review dan rating asli dari pelanggan. Hubungi kami: chat dengan Nusa (AI assistant) atau WhatsApp di +62-812-XXXX-XXXX.',
    source_type: 'guide',
    metadata: { category: 'about' },
  },
  {
    title: 'Panduan Wisata Bali Timur (Candidasa, Amed, Sidemen)',
    content:
      'Bali Timur menawarkan suasana tenang dan panorama otentik yang jauh dari keramaian Bali Selatan. Destinasi utama meliputi: (1) Candidasa & Virgin Beach (Pantai Perasi) berpasir putih bersih dengan air toska jernih serta Blue Lagoon untuk snorkeling. (2) Desa Tradisional Tenganan Pegringsingan yang memproduksi kain tenun gringsing langka. (3) Lembah Sidemen dengan sawah terasering berlatar Gunung Agung, pusat retreat alam, yoga, dan villa bambu ramah lingkungan. (4) Amed yang terkenal sebagai surga diving dan snorkeling dengan Japanese Shipwreck dan Coral Garden kaya biota laut.',
    source_type: 'guide',
    metadata: { category: 'destination', region: 'Bali Timur' },
  },
  {
    title: 'Panduan Wisata Bali Utara (Lovina, Sekumpul, Sambangan)',
    content:
      'Bali Utara (Kabupaten Buleleng) terkenal dengan pesona alam pegunungan, pantai tenang, dan air terjun spektakuler: (1) Pantai Lovina terkenal dengan tur perahu jukung tradisional saat sunrise untuk menyaksikan kawanan lumba-lumba liar berenang di habitat aslinya. Dilanjutkan berendam di Pemandian Air Panas Alami Banjar. (2) Air Terjun Sekumpul, gugusan 7 air terjun megah di tengah lembah hutan tropis yang dinobatkan sebagai air terjun tercantik di Bali. (3) Desa Sambangan (Secret Garden) & Air Terjun Aling-Aling untuk petualangan uji adrenalin: meluncur di seluncuran batu alami dan melompat dari tebing ketinggian 5m hingga 15m.',
    source_type: 'guide',
    metadata: { category: 'destination', region: 'Bali Utara' },
  },
  {
    title: 'Panduan Dataran Tinggi Bedugul & Jatiluwih UNESCO',
    content:
      'Kawasan pegunungan tengah Bali berhawa sejuk 18-24°C: (1) Danau Beratan & Pura Ulun Danu Beratan, pura ikonik yang tampak terapung di atas permukaan danau berlatar kabut perbukitan. (2) Hamparan sawah bertingkat Jatiluwih di kaki Gunung Batukaru yang diakui sebagai Situs Warisan Dunia UNESCO berkat sistem irigasi tradisional Subak yang lestari berabad-abad. (3) Kebun Raya Bali Eka Karya dan kebun agrowisata petik buah stroberi manis di sepanjang jalan Bedugul.',
    source_type: 'guide',
    metadata: { category: 'destination', region: 'Tabanan' },
  },
  {
    title: 'Panduan Wisata Nusa Lembongan & Ceningan',
    content:
      'Dua pulau saudara di sebelah tenggara Bali yang dapat diakses dengan speedboat 30 menit dari Sanur. Keduanya dihubungkan oleh Jembatan Kuning (Yellow Bridge). Daya tarik utama: (1) Devils Tear di Nusa Lembongan dengan hempasan deburan ombak karang spektakuler dan pelangi air. (2) Dream Beach berpasir putih halus. (3) Blue Lagoon Nusa Ceningan dengan air laut berwarna toska cerah memukau dari atas tebing. (4) Hutan Mangrove Lembongan yang dapat dijelajahi dengan perahu dayung tradisional kayu.',
    source_type: 'guide',
    metadata: { category: 'destination', region: 'Nusa Lembongan' },
  },
  {
    title: 'Panduan Ritual Melukat Tirta Empul & Desa Adat Penglipuran',
    content:
      'Pengalaman spiritual dan budaya mendalam di Bali: (1) Ritual Melukat di Pura Tirta Empul (Tampak Siring), upacara penyucian diri dan pembersihan energi negatif di pancuran mata air suci yang telah digunakan sejak abad ke-10 (Kerajaan Warmadewa). Peserta mengenakan kain kamen tradisional dan dipandu oleh pemangku lokal. (2) Desa Adat Penglipuran di Bangli, salah satu desa terbersih di dunia dengan tata ruang desa berkonsep Tri Hita Karana, arsitektur gerbang angkul-angkul yang seragam, dan hutan bambu asri seluas 45 hektar.',
    source_type: 'guide',
    metadata: { category: 'culture', region: 'Gianyar' },
  },
  {
    title: 'Panduan Petualangan Air & Satwa Liar Bali',
    content:
      'Aktivitas outdoor dan satwa liar unggulan di Bali: (1) White Water Rafting Sungai Ayung di Ubud sepanjang 10 km dengan jeram kelas II-III, relief batu candi Ramayana di dinding tebing, dan air terjun alami. (2) Menjangan Island di kawasan Taman Nasional Bali Barat dengan dinding terumbu karang (wall diving) terbaik di Asia Tenggara dan kawanan rusa liar di pesisir pantai. (3) Bali Safari and Marine Park di Gianyar untuk petualangan safari edukasi satwa dunia, pertunjukan harimau, serta feeding hewan eksotis.',
    source_type: 'guide',
    metadata: { category: 'activity', region: 'Bali' },
  },
];
