// ============================================
// Radha Bali - Destination Geolocation Helper
// Maps Bali destinations to coordinates, addresses, and navigation links
// ============================================

export interface DestinationGeoInfo {
  destination: string;
  region: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
  googleMapsUrl: string;
  embedMapUrl: string;
}

// Coordinate mapping for Bali regions and destinations
const DESTINATION_COORDINATES: Record<string, { lat: number; lng: number; address: string }> = {
  'nusa penida': {
    lat: -8.7278,
    lng: 115.5444,
    address: 'Kecamatan Nusa Penida, Kabupaten Klungkung, Bali, Indonesia',
  },
  'ubud': {
    lat: -8.5069,
    lng: 115.2625,
    address: 'Kecamatan Ubud, Kabupaten Gianyar, Bali 80571, Indonesia',
  },
  'kintamani': {
    lat: -8.2433,
    lng: 115.3756,
    address: 'Kecamatan Kintamani, Kabupaten Bangli, Bali 80652, Indonesia',
  },
  'uluwatu': {
    lat: -8.8291,
    lng: 115.0849,
    address: 'Pecatu, Kuta Selatan, Kabupaten Badung, Bali 80361, Indonesia',
  },
  'canggu': {
    lat: -8.6478,
    lng: 115.1385,
    address: 'Canggu, Kuta Utara, Kabupaten Badung, Bali 80351, Indonesia',
  },
  'seminyak': {
    lat: -8.6913,
    lng: 115.1682,
    address: 'Seminyak, Kuta, Kabupaten Badung, Bali 80361, Indonesia',
  },
  'kuta': {
    lat: -8.7217,
    lng: 115.1697,
    address: 'Kuta, Kabupaten Badung, Bali 80361, Indonesia',
  },
  'sanur': {
    lat: -8.6882,
    lng: 115.2635,
    address: 'Sanur, Denpasar Selatan, Kota Denpasar, Bali 80228, Indonesia',
  },
  'nusa dua': {
    lat: -8.8005,
    lng: 115.2308,
    address: 'Kawasan Pariwisata ITDC Nusa Dua, Benoa, Badung, Bali 80363, Indonesia',
  },
  'jimbaran': {
    lat: -8.7753,
    lng: 115.1656,
    address: 'Jimbaran, Kuta Selatan, Kabupaten Badung, Bali 80361, Indonesia',
  },
  'jimbaran & uluwatu': {
    lat: -8.8022,
    lng: 115.1252,
    address: 'Semenanjung Bukit, Badung Selatan, Bali, Indonesia',
  },
  'lovina': {
    lat: -8.1569,
    lng: 115.0282,
    address: 'Pantai Lovina, Kalibukbuk, Buleleng, Bali 81151, Indonesia',
  },
  'amed': {
    lat: -8.3414,
    lng: 115.6548,
    address: 'Amed, Abang, Kabupaten Karangasem, Bali 80852, Indonesia',
  },
  'candidasa': {
    lat: -8.5050,
    lng: 115.5683,
    address: 'Candidasa, Manggis, Kabupaten Karangasem, Bali 80871, Indonesia',
  },
  'sidemen': {
    lat: -8.4867,
    lng: 115.4411,
    address: 'Lembah Sidemen, Kabupaten Karangasem, Bali 80864, Indonesia',
  },
  'bedugul': {
    lat: -8.2750,
    lng: 115.1667,
    address: 'Bedugul, Candikuning, Baturiti, Tabanan, Bali 82191, Indonesia',
  },
  'bedugul & jatiluwih': {
    lat: -8.3683,
    lng: 115.1311,
    address: 'Jatiluwih & Bedugul, Kabupaten Tabanan, Bali, Indonesia',
  },
  'nusa lembongan': {
    lat: -8.6750,
    lng: 115.4500,
    address: 'Nusa Lembongan, Jungutbatu, Klungkung, Bali 80771, Indonesia',
  },
  'sambangan': {
    lat: -8.1633,
    lng: 115.1056,
    address: 'Desa Sambangan, Sukasada, Kabupaten Buleleng, Bali 81161, Indonesia',
  },
  'buleleng': {
    lat: -8.1120,
    lng: 115.0882,
    address: 'Kabupaten Buleleng, Bali Utara, Indonesia',
  },
  'tampak siring': {
    lat: -8.4150,
    lng: 115.3150,
    address: 'Pura Tirta Empul, Manukaya, Tampaksiring, Gianyar, Bali 80552, Indonesia',
  },
  'gianyar': {
    lat: -8.5444,
    lng: 115.3267,
    address: 'Kabupaten Gianyar, Bali, Indonesia',
  },
  'gianyar & kintamani': {
    lat: -8.3756,
    lng: 115.3512,
    address: 'Gianyar - Bangli Route, Bali, Indonesia',
  },
  'pulau menjangan': {
    lat: -8.0933,
    lng: 114.5167,
    address: 'Pulau Menjangan, Taman Nasional Bali Barat, Gerokgak, Buleleng, Bali, Indonesia',
  },
  'tanah lot': {
    lat: -8.6212,
    lng: 115.0868,
    address: 'Beraban, Kediri, Kabupaten Tabanan, Bali 82121, Indonesia',
  },
  'bali selatan': {
    lat: -8.7619,
    lng: 115.1764,
    address: 'Kawasan Pesisir Bali Selatan, Kabupaten Badung, Bali, Indonesia',
  },
  'bali': {
    lat: -8.4095,
    lng: 115.1889,
    address: 'Provinsi Bali, Indonesia',
  },
  'seluruh bali': {
    lat: -8.4095,
    lng: 115.1889,
    address: 'Pulau Bali (Layanan Antar-Jemput Seluruh Area), Indonesia',
  },
};

/**
 * Returns geolocation data, address, and map links for any Bali destination
 */
export function getDestinationLocation(destination: string, region: string = 'Bali'): DestinationGeoInfo {
  const normalizedKey = destination.toLowerCase().trim();
  const found = DESTINATION_COORDINATES[normalizedKey];

  if (found) {
    const query = encodeURIComponent(`${destination}, ${found.address}`);
    return {
      destination,
      region,
      latitude: found.lat,
      longitude: found.lng,
      formattedAddress: found.address,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${query}`,
      embedMapUrl: `https://maps.google.com/maps?q=${found.lat},${found.lng}&hl=id&z=13&output=embed`,
    };
  }

  // Fallback to searching by destination and region
  const query = encodeURIComponent(`${destination}, ${region}, Bali, Indonesia`);
  const defaultLat = -8.4095;
  const defaultLng = 115.1889;

  return {
    destination,
    region,
    latitude: defaultLat,
    longitude: defaultLng,
    formattedAddress: `${destination}, ${region}, Bali, Indonesia`,
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${query}`,
    embedMapUrl: `https://maps.google.com/maps?q=${query}&hl=id&z=12&output=embed`,
  };
}

/**
 * Builds WhatsApp chat URL with customized inquiry template (professional, no emojis)
 */
export function generateWhatsAppBookingUrl(
  productName: string,
  priceFormatted: string,
  phone: string = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6281234567890'
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const message = `Halo Radha Bali, saya tertarik dengan paket wisata "${productName}" (${priceFormatted}). Mohon informasi jadwal ketersediaan dan detail pemesanan. Terima kasih.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export interface ItineraryStop {
  stopNumber: number;
  locationName: string;
  activity: string;
}

/**
 * Curated itinerary stops per location/package
 */
const CURATED_ITINERARIES: Record<string, ItineraryStop[]> = {
  'nusa-penida-island-hopping-2d1n': [
    { stopNumber: 1, locationName: 'Pelabuhan Sanur ke Nusa Penida', activity: 'Penyeberangan laut dengan fast boat express menuju Pelabuhan Toya Pakeh.' },
    { stopNumber: 2, locationName: 'Tebing Kelingking (T-Rex Cliff)', activity: 'Menyaksikan panorama tebing karst ikonik dan pemandangan laut biru lepas dari ketinggian.' },
    { stopNumber: 3, locationName: 'Broken Beach & Angel Billabong', activity: 'Eksplorasi tebing terowongan laut alami dan kolam laguna air laut bening.' },
    { stopNumber: 4, locationName: 'Manta Point & Crystal Bay', activity: 'Aktivitas snorkeling melihat ikan karang tropis dan berenang bersama pari manta liar.' },
  ],
  'lovina-sunrise-dolphin-hot-springs-2d1n': [
    { stopNumber: 1, locationName: 'Pantai Lovina (Fajar Hari)', activity: 'Berlayar dengan perahu jukung tradisional ke laut lepas untuk melihat kawanan lumba-lumba liar saat matahari terbit.' },
    { stopNumber: 2, locationName: 'Pemandian Air Panas Banjar', activity: 'Berendam santai di kolam air panas alami berkhasiat dengan pancuran arsitektur naga tradisional.' },
    { stopNumber: 3, locationName: 'Air Terjun Gitgit', activity: 'Wisata trekking ringan menyusuri perkebunan cengkeh menuju air terjun megah setinggi 35 meter.' },
  ],
  'mount-batur-sunrise-trekking': [
    { stopNumber: 1, locationName: 'Basecamp Kintamani (Dini Hari)', activity: 'Briefing rute pendakian dan pembagian perlengkapan trekking bersama pemandu lokal.' },
    { stopNumber: 2, locationName: 'Puncak Kaldera Gunung Batur (1.717 mdpl)', activity: 'Menyaksikan matahari terbit keemasan berlatar Gunung Agung dan Danau Batur, disertai sarapan uap vulkanik.' },
    { stopNumber: 3, locationName: 'Pemandian Air Panas Toya Bungkah', activity: 'Relaksasi otot setelah mendaki di kolam air panas alami tepi Danau Batur.' },
  ],
  'ubud-cultural-retreat-4d3n': [
    { stopNumber: 1, locationName: 'Tegallalang Rice Terrace', activity: 'Berjalan di pematang sawah berundak tradisional dan menikmati panorama hijau asri.' },
    { stopNumber: 2, locationName: 'Sacred Monkey Forest Ubud', activity: 'Eksplorasi cagar alam hutan tropis dengan ratusan satwa monyet dan candi kuno.' },
    { stopNumber: 3, locationName: 'Pura Tirta Empul Tampak Siring', activity: 'Mengikuti tradisi pembersihan spiritual Melukat di mata air suci yang mengalir sejak abad ke-10.' },
    { stopNumber: 4, locationName: 'Pusat Seni & Pasar Tradisional Ubud', activity: 'Kunjungan ke galeri seniman lukis lokal dan berbelanja cinderamata khas kerajinan Bali.' },
  ],
  'canggu-surf-beach-club-experience-3d2n': [
    { stopNumber: 1, locationName: 'Pantai Batu Bolong', activity: 'Pelatihan dasar dan praktek selancar air (surfing) privat dipandu instruktur berpengalaman.' },
    { stopNumber: 2, locationName: 'Pesisir Pantai Echo & Berawa', activity: 'Menikmati sunset santai dan menjelajahi deretan kafe kuliner trendi kawasan Canggu.' },
    { stopNumber: 3, locationName: 'Beach Club Canggu', activity: 'Akses santai menikmati musik senja di tepi kolam renang infinity tepi pantai.' },
  ],
  'bedugul-jatiluwih-highlands-unesco-tour-2d1n': [
    { stopNumber: 1, locationName: 'Pura Ulun Danu Beratan', activity: 'Wisata pura terapung ikonik di atas Danau Beratan dengan suasana pegunungan sejuk.' },
    { stopNumber: 2, locationName: 'Kebun Raya Bali & Agrowisata Stroberi', activity: 'Jalan santai di taman botani terbesar di Indonesia dan memetik buah stroberi segar.' },
    { stopNumber: 3, locationName: 'Terasering Sawah Jatiluwih (UNESCO)', activity: 'Menyusuri hamparan sawah bertingkat sistem irigasi Subak warisan dunia seluas 600 hektar.' },
  ],
  'sekumpul-banyumala-waterfall-trekking-adventure': [
    { stopNumber: 1, locationName: 'Desa Lemukih & Sekumpul', activity: 'Trekking dipandu warga lokal melintasi perkebunan kopi dan lembah hijau rimbun.' },
    { stopNumber: 2, locationName: 'Gugusan 7 Air Terjun Sekumpul', activity: 'Mencapai dasar tebing air terjun tertinggi di Bali dengan debit air melimpah dan udara sejuk.' },
    { stopNumber: 3, locationName: 'Banyumala Twin Waterfalls', activity: 'Berenang dan bersantai di kolam alami air terjun kembar yang tenang dan jernih.' },
  ],
  'amed-coral-garden-japanese-shipwreck-snorkeling': [
    { stopNumber: 1, locationName: 'Pantai Jemeluk Amed', activity: 'Persiapan peralatan snorkel dan arahan keamanan perairan di tepi pantai berpasir hitam eksotis.' },
    { stopNumber: 2, locationName: 'Coral Garden Amed', activity: 'Snorkeling di terumbu karang dangkal yang sehat dengan ribuan ikan karang warna-warni.' },
    { stopNumber: 3, locationName: 'Situs Bangkai Kapal Jepang (Shipwreck)', activity: 'Eksplorasi situs bersejarah bangkai kapal karam yang kini menjadi rumah bagi terumbu karang lunak.' },
  ],
  'ayung-river-white-water-rafting-ubud': [
    { stopNumber: 1, locationName: 'Start Point Sungai Ayung', activity: 'Instruksi keselamatan arung jeram dan pemasangan pelampung serta helm berstandar internasional.' },
    { stopNumber: 2, locationName: 'Arung Jeram 10 KM & Relief Tebing Batu', activity: 'Mengarungi jeram kelas II-III melewati air terjun tersembunyi dan relief ukiran batu Ramayana.' },
    { stopNumber: 3, locationName: 'Finish Point & Restoran Tepi Sawah', activity: 'Bilas air hangat dan menikmati sajian makan siang prasmanan masakan lokal.' },
  ],
  'candidasa-virgin-beach-hidden-gem-2d1n': [
    { stopNumber: 1, locationName: 'Pesisir Pantai Candidasa', activity: 'Check-in penginapan tepi pantai yang tenang dan jauh dari keramaian kota.' },
    { stopNumber: 2, locationName: 'Virgin Beach (Pantai Perasi)', activity: 'Menikmati pantai pasir putih tersembunyi dengan ombak tenang dan air laut toska jernih.' },
    { stopNumber: 3, locationName: 'Desa Tradisional Tenganan Pegringsingan', activity: 'Belajar sejarah kebudayaan suku asli Bali Aga dan proses pembuatan kain tenun gringsing.' },
  ],
  'menjangan-island-marine-deer-sanctuary-2d1n': [
    { stopNumber: 1, locationName: 'Pelabuhan Labuan Lalang', activity: 'Menyeberang dengan perahu motor sewa melintasi perairan Taman Nasional Bali Barat.' },
    { stopNumber: 2, locationName: 'Pesisir Pulau Menjangan', activity: 'Mengamati kawanan rusa liar yang hidup bebas di tepi pantai berpasir putih pulau tak berpenghuni.' },
    { stopNumber: 3, locationName: 'Spot Wall Diving & Snorkeling Menjangan', activity: 'Snorkeling di dinding karang tegak dengan jarak pandang air laut mencapai 30 meter.' },
  ],
  'nusa-penida-diamond-beach-treehouse-photo-expedition': [
    { stopNumber: 1, locationName: 'Rumah Pohon Molenteng (Thousand Islands)', activity: 'Foto berlatar gugusan pulau karang kecil dan tebing curam spektakuler.' },
    { stopNumber: 2, locationName: 'Diamond Beach', activity: 'Menuruni tangga batu karst menuju pantai berpasir putih dengan tebing berbentuk berlian.' },
    { stopNumber: 3, locationName: 'Pantai Atuh & Bukit Teletubbies', activity: 'Bersantai di teluk tenang Pantai Atuh dan panorama bukit hijau bergelombang Teletubbies.' },
  ],
  'bali-beach-paradise-3d2n': [
    { stopNumber: 1, locationName: 'Pantai Melasti & Tebing Kapur', activity: 'Menyusuri jalan tebing kapur kembar menuju pantai berpasir putih bersih di selatan Bali.' },
    { stopNumber: 2, locationName: 'Pantai Pandawa & Watersport Tanjung Benoa', activity: 'Aktivitas air seru mulai dari banana boat, parasailing, hingga perahu kaca.' },
    { stopNumber: 3, locationName: 'Teluk Jimbaran', activity: 'Menikmati makan malam hidangan laut (seafood) bakar segar di tepi pantai saat matahari terbenam.' },
  ],
};

/**
 * Returns structured stops for the itinerary per location
 */
export function getItineraryStops(slug: string, destination: string, description: string): ItineraryStop[] {
  if (CURATED_ITINERARIES[slug]) {
    return CURATED_ITINERARIES[slug];
  }

  // Fallback: parse sentences or create 3 sensible stops
  const sentences = description
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  if (sentences.length >= 3) {
    return [
      { stopNumber: 1, locationName: `Titik Keberangkatan & Sambutan di ${destination}`, activity: sentences[0] },
      { stopNumber: 2, locationName: `Destinasi Utama di Kawasan ${destination}`, activity: sentences[1] },
      { stopNumber: 3, locationName: `Aktivitas Penutup & Kuliner Lokal`, activity: sentences[2] },
    ];
  }

  return [
    { stopNumber: 1, locationName: `Titik Kumpul & Perjalanan ke ${destination}`, activity: `Penjemputan tepat waktu dan perjalanan menuju area wisata ${destination}.` },
    { stopNumber: 2, locationName: `Eksplorasi Objek Wisata ${destination}`, activity: description },
    { stopNumber: 3, locationName: `Kembali & Pengantaran`, activity: `Sesi istirahat dan pengantaran kembali ke titik kumpul atau akomodasi Anda.` },
  ];
}

