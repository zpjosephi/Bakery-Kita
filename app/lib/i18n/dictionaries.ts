export type Locale = "en" | "id";

export const LOCALES: Locale[] = ["en", "id"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "lang";

export function isLocale(v: string | undefined | null): v is Locale {
  return v === "en" || v === "id";
}

const en = {
  brand: "Bakery Kita",

  header: {
    continueShopping: "Continue shopping",
    backToCart: "Back to cart",
  },

  account: {
    login: "Log in",
    signup: "Sign up",
    dashboard: "Dashboard",
    myOrders: "My orders",
    greeting: "Hi",
    you: "you",
    logout: "Log out",
  },

  cart: {
    label: "Cart",
    add: "Add",
    open: (n: number) => `Open cart, ${n} items`,
    decrease: "Decrease quantity",
    increase: "Increase quantity",
    added: (name: string) => `${name} added to cart`,
  },

  catalog: {
    freshLabel: "Fresh every morning",
    heroTitle: "Homemade bread & cakes, warm from the oven.",
    heroSubtitle: "Pick what you like, scan, done — pay with QRIS.",
    cta: "View menu",
    featured: "Today's pick",
    menu: "Menu",
    productCount: (n: number) => `${n} products`,
  },

  steps: ["Cart", "Details", "Payment", "Done"],

  cartPage: {
    title: "Cart",
    empty: "Your cart is empty. Take a peek at the menu.",
    viewMenu: "View menu",
    remove: "Remove",
    decreaseOf: (name: string) => `Decrease ${name}`,
    increaseOf: (name: string) => `Increase ${name}`,
    totalItems: "Total items",
    pcs: "pcs",
    orderTotal: "Order total",
    checkout: "Continue to checkout",
    confirmClear: "Clear the cart?",
    yesClear: "Yes, clear",
    cancel: "Cancel",
    clear: "Clear",
  },

  checkout: {
    emptyMsg: "Your cart is empty, so there's nothing to pay for.",
    viewMenu: "View menu",
    title: "Checkout",
    buyerData: "Buyer details",
    fullName: "Full name",
    namePlaceholder: "e.g. John Doe",
    phone: "Phone / WhatsApp",
    phonePlaceholder: "e.g. 08123456789",
    address: "Delivery address",
    addressPlaceholder: "St. ... No. ..., City",
    errName: "Name is required.",
    errPhone: "Invalid phone number (e.g. 08123456789).",
    errAddress: "Address is required.",
    payFailed: "Failed to process payment.",
    unexpected: "Something went wrong.",
    creatingQris: "Creating QRIS…",
    payWithQris: "Pay with QRIS",
    practiceNote:
      "Practice mode — uses the QRIS sandbox, no real money is charged.",
    summary: "Summary",
    totalN: (n: number) => `Total (${n} pcs)`,
  },

  pay: {
    loadStatusError: "Failed to load status.",
    unexpected: "Something went wrong.",
    qrImageError: "Failed to generate the QR image.",
    loadingOrder: "Loading order…",
    scanToPay: "Scan to Pay",
    total: "Total",
    qrAlt: "QRIS payment",
    creatingQr: "Creating QR…",
    waiting: "Waiting for payment…",
    howToTitle: "How to pay (test mode)",
    step1: "Click “Copy QR image URL” below.",
    step2pre: "Open the simulator → paste into the ",
    step2field: "“QR Code Image Url”",
    step2post: " field.",
    step3pre: "Click ",
    step3scan: "“Scan QR”",
    step3post: ", then confirm payment.",
    step4: "This page updates to “Paid” automatically.",
    copied: "Copied",
    copyUrl: "Copy QR image URL",
    openSimulator: "Open QRIS Simulator",
    noQrUrl: "QR image URL not available from Midtrans.",
    successTitle: "Payment received",
    successBody: (amount: string) =>
      `We've received ${amount}. Your order is on its way to the oven. 🍞`,
    backToMenu: "Back to menu",
    expiredTitle: "QR Expired",
    failedTitle: "Payment Failed",
    failedBody:
      "Don't worry, nothing was charged. Try ordering again from your cart.",
    backToCart: "Back to cart",
  },

  auth: {
    createAccount: "Create account",
    login: "Log in",
    haveAccount: "Already have an account? ",
    noAccount: "Don't have an account yet? ",
    loginHere: "Log in here",
    signupHere: "Sign up here",
    googleNotEnabled: "Google login isn't enabled yet.",
    redirecting: "Redirecting…",
    continueGoogle: "Continue with Google",
    orEmail: "or use email",
    fullName: "Full name",
    namePlaceholder: "e.g. John Doe",
    email: "Email",
    emailPlaceholder: "you@email.com",
    password: "Password",
    pwSignupPlaceholder: "At least 6 characters",
    processing: "Processing…",
    invalidEmail: "Invalid email.",
    pwRequired: "Password is required.",
    nameMin: "Name must be at least 2 characters.",
    pwMin: "Password must be at least 6 characters.",
    invalidCreds: "Wrong email or password.",
    emailNotConfirmed: "Email not confirmed. Check your inbox first.",
    alreadyRegistered: "This email is already registered. Try logging in.",
    pwTooShort: "Password too short (at least 6 characters).",
    rateLimit: "Too many attempts. Wait a moment and try again.",
    signupCheckEmail:
      "Account created. Check your email to confirm, then log in.",
  },

  orders: {
    title: "My Orders",
    empty: "No orders yet. Order your first loaf.",
    viewMenu: "View menu",
    totalN: (n: number) => `Total ${n} items`,
    continuePayment: "Continue payment",
  },

  adminOrders: {
    title: "Incoming Orders",
    count: (n: number) => `${n} orders`,
    backToProducts: "Manage products",
    empty: "No incoming orders yet.",
    markDone: "Mark done",
    returnToProcess: "Return to processing",
  },

  orderStatus: {
    pending: "Awaiting payment",
    failed: "Payment failed",
    expired: "Expired",
    done: "Done",
    processing: "Processing",
  },

  admin: {
    title: "Manage Products",
    subtitle:
      "Add, change prices, or remove products. Changes show in the catalog instantly.",
    incomingOrders: "Incoming orders",
    productCount: (n: number) => `${n} products`,
    closeForm: "Close form",
    addProduct: "Add product",
    addProductSubmit: "Add product",
    langHint:
      "Type in English or Indonesian — the other language is filled in automatically when you save.",
    translateAll: "Translate existing",
    translating: "Translating…",
    translatedN: (n: number) => `Translated ${n} products.`,
    translateNone:
      "Nothing translated — check that the GEMINI_API_KEY is set.",
    productName: "Product name",
    productNamePlaceholder: "e.g. Banana Bread",
    price: "Price (Rp)",
    description: "Description",
    descPlaceholder: "Short product description",
    emoji: "Emoji",
    order: "Order",
    photo: "Product photo (optional)",
    photoHint: "Upload an image, or paste a path/URL. Empty → uses the emoji.",
    preview: "Preview",
    uploading: "Uploading…",
    imagePlaceholder: "/products/name.jpg or an uploaded URL",
    showInCatalog: "Show in catalog",
    saving: "Saving…",
    save: "Save",
    currentPrice: (price: string) => `Current price: ${price}`,
    delete: "Delete",
    confirmDelete: (name: string) =>
      `Delete "${name}"? This action is permanent and cannot be undone.`,
    uploadFailed: "Upload failed.",
    bucketMissing:
      "The 'products' bucket doesn't exist — run supabase/storage.sql first.",
    uploadNotAllowed:
      "Upload not allowed (make sure you're an admin and storage.sql has run).",
    accessDenied: "Access denied — admins only.",
    nameMin: "Product name must be at least 2 characters.",
    priceNumber: "Price must be a number (≥ 0).",
    duplicateName:
      "A product with a similar name already exists — rename it.",
    saved: "Changes saved.",
    added: (name: string) => `Product "${name}" added.`,
  },

  footer: {
    tagline: "A demo storefront — QRIS checkout on the Midtrans Sandbox.",
    explore: "Explore",
    builtWith: "Built with",
  },

  charge: {
    invalidJson: "Invalid JSON body.",
    incompleteBuyer: "Buyer details are incomplete.",
    emptyCart: "The cart is empty.",
    invalidItem: (id: string | undefined) => `Invalid item: ${id}`,
    paymentFailed: "Failed to process payment.",
  },

  statusApi: {
    orderIdRequired: "orderId is required.",
    orderNotFound: "Order not found.",
  },

  ordersLoadError: (msg: string) => `Failed to load orders: ${msg}`,

  meta: {
    homeTitle: "Bakery Kita — Catalog & Order Online",
    homeDescription: "Fresh bread & cake catalog. Order and pay via QRIS.",
    loginTitle: "Log in — Bakery Kita",
    signupTitle: "Sign up — Bakery Kita",
    myOrdersTitle: "My Orders — Bakery Kita",
    adminTitle: "Admin Dashboard — Bakery Kita",
    adminOrdersTitle: "Incoming Orders — Admin",
    notFoundTitle: "Page not found — Bakery Kita",
  },

  notFound: {
    code: "404",
    title: "We couldn't find that page",
    body: "It may have moved, or never came out of the oven. Let's get you back to the fresh stuff.",
    back: "Back to menu",
  },

  language: {
    label: "Language",
  },
};

export type Dict = typeof en;

const id: Dict = {
  brand: "Bakery Kita",

  header: {
    continueShopping: "Lanjut belanja",
    backToCart: "Kembali ke keranjang",
  },

  account: {
    login: "Masuk",
    signup: "Daftar",
    dashboard: "Dashboard",
    myOrders: "Pesanan saya",
    greeting: "Halo",
    you: "kamu",
    logout: "Keluar",
  },

  cart: {
    label: "Keranjang",
    add: "Tambah",
    open: (n: number) => `Buka keranjang, ${n} item`,
    decrease: "Kurangi jumlah",
    increase: "Tambah jumlah",
    added: (name: string) => `${name} masuk keranjang`,
  },

  catalog: {
    freshLabel: "Fresh tiap pagi",
    heroTitle: "Roti & kue rumahan, hangat dari oven tiap hari.",
    heroSubtitle: "Tinggal pilih, scan, beres — bayarnya lewat QRIS.",
    cta: "Lihat menu",
    featured: "Pilihan hari ini",
    menu: "Menu",
    productCount: (n: number) => `${n} produk`,
  },

  steps: ["Keranjang", "Data Diri", "Pembayaran", "Selesai"],

  cartPage: {
    title: "Keranjang",
    empty: "Keranjangmu masih kosong. Yuk, intip menunya dulu.",
    viewMenu: "Lihat menu",
    remove: "Hapus",
    decreaseOf: (name: string) => `Kurangi ${name}`,
    increaseOf: (name: string) => `Tambah ${name}`,
    totalItems: "Total item",
    pcs: "pcs",
    orderTotal: "Total belanja",
    checkout: "Lanjut ke checkout",
    confirmClear: "Yakin mau dikosongkan?",
    yesClear: "Ya, hapus",
    cancel: "Batal",
    clear: "Kosongkan",
  },

  checkout: {
    emptyMsg: "Keranjangmu masih kosong, jadi belum ada yang perlu dibayar.",
    viewMenu: "Lihat menu",
    title: "Checkout",
    buyerData: "Data pembeli",
    fullName: "Nama lengkap",
    namePlaceholder: "mis. Budi Santoso",
    phone: "No. HP / WhatsApp",
    phonePlaceholder: "mis. 08123456789",
    address: "Alamat pengiriman",
    addressPlaceholder: "Jl. ... No. ..., Kota",
    errName: "Nama wajib diisi.",
    errPhone: "No. HP tidak valid (contoh: 08123456789).",
    errAddress: "Alamat wajib diisi.",
    payFailed: "Gagal memproses pembayaran.",
    unexpected: "Terjadi kesalahan.",
    creatingQris: "Membuat QRIS…",
    payWithQris: "Bayar dengan QRIS",
    practiceNote:
      "Ini mode simulasi pakai QRIS sandbox — nggak ada uang asli yang terpotong.",
    summary: "Ringkasan",
    totalN: (n: number) => `Total (${n} pcs)`,
  },

  pay: {
    loadStatusError: "Gagal memuat status.",
    unexpected: "Terjadi kesalahan.",
    qrImageError: "Gagal membuat gambar QR.",
    loadingOrder: "Memuat pesanan…",
    scanToPay: "Scan untuk bayar",
    total: "Total",
    qrAlt: "QRIS pembayaran",
    creatingQr: "Membuat QR…",
    waiting: "Menunggu pembayaran…",
    howToTitle: "Cara bayar (mode simulasi)",
    step1: "Klik “Salin URL gambar QR” di bawah.",
    step2pre: "Buka simulator → tempel di kolom ",
    step2field: "“QR Code Image Url”",
    step2post: ".",
    step3pre: "Klik ",
    step3scan: "“Scan QR”",
    step3post: ", lalu konfirmasi bayar.",
    step4: "Halaman ini otomatis jadi “Lunas”.",
    copied: "Tersalin",
    copyUrl: "Salin URL gambar QR",
    openSimulator: "Buka QRIS Simulator",
    noQrUrl: "URL gambar QR tidak tersedia dari Midtrans.",
    successTitle: "Pembayaran berhasil",
    successBody: (amount: string) =>
      `Dana ${amount} sudah kami terima. Pesananmu langsung kami siapkan, ya. 🍞`,
    backToMenu: "Kembali ke menu",
    expiredTitle: "QR kedaluwarsa",
    failedTitle: "Pembayaran gagal",
    failedBody:
      "Tenang, belum ada dana yang terpotong. Coba pesan lagi dari keranjang, ya.",
    backToCart: "Kembali ke keranjang",
  },

  auth: {
    createAccount: "Buat akun",
    login: "Masuk",
    haveAccount: "Sudah punya akun? ",
    noAccount: "Belum punya akun? ",
    loginHere: "Masuk di sini",
    signupHere: "Daftar di sini",
    googleNotEnabled: "Login Google belum diaktifkan.",
    redirecting: "Mengalihkan…",
    continueGoogle: "Lanjut dengan Google",
    orEmail: "atau pakai email",
    fullName: "Nama lengkap",
    namePlaceholder: "mis. Budi Santoso",
    email: "Email",
    emailPlaceholder: "kamu@email.com",
    password: "Password",
    pwSignupPlaceholder: "Minimal 6 karakter",
    processing: "Memproses…",
    invalidEmail: "Email tidak valid.",
    pwRequired: "Password wajib diisi.",
    nameMin: "Nama minimal 2 karakter.",
    pwMin: "Password minimal 6 karakter.",
    invalidCreds: "Email atau password salah.",
    emailNotConfirmed: "Email belum dikonfirmasi. Cek dulu inbox kamu, ya.",
    alreadyRegistered: "Email ini sudah terdaftar. Masuk aja, yuk.",
    pwTooShort: "Password terlalu pendek (minimal 6 karakter).",
    rateLimit: "Terlalu banyak percobaan. Tunggu sebentar, lalu coba lagi.",
    signupCheckEmail:
      "Akun kamu berhasil dibuat. Cek email untuk konfirmasi, lalu masuk.",
  },

  orders: {
    title: "Pesanan Saya",
    empty: "Belum ada pesanan di sini. Yuk, pesan roti pertamamu.",
    viewMenu: "Lihat menu",
    totalN: (n: number) => `Total ${n} item`,
    continuePayment: "Lanjutkan pembayaran",
  },

  adminOrders: {
    title: "Pesanan Masuk",
    count: (n: number) => `${n} pesanan`,
    backToProducts: "Kelola produk",
    empty: "Belum ada pesanan masuk.",
    markDone: "Tandai selesai",
    returnToProcess: "Kembalikan ke proses",
  },

  orderStatus: {
    pending: "Menunggu pembayaran",
    failed: "Pembayaran gagal",
    expired: "Kedaluwarsa",
    done: "Selesai",
    processing: "Sedang diproses",
  },

  admin: {
    title: "Kelola Produk",
    subtitle:
      "Tambah, ubah harga, atau hapus produk. Perubahan langsung tampil di katalog.",
    incomingOrders: "Pesanan masuk",
    productCount: (n: number) => `${n} produk`,
    closeForm: "Tutup form",
    addProduct: "Tambah produk",
    addProductSubmit: "Tambah produk",
    langHint:
      "Ketik pakai bahasa Indonesia atau Inggris — bahasa satunya diisi otomatis saat disimpan.",
    translateAll: "Terjemahkan yang ada",
    translating: "Menerjemahkan…",
    translatedN: (n: number) => `${n} produk diterjemahkan.`,
    translateNone:
      "Tidak ada yang diterjemahkan — pastikan GEMINI_API_KEY sudah diset.",
    productName: "Nama produk",
    productNamePlaceholder: "mis. Roti Pisang",
    price: "Harga (Rp)",
    description: "Deskripsi",
    descPlaceholder: "Penjelasan singkat produk",
    emoji: "Emoji",
    order: "Urutan",
    photo: "Foto produk (opsional)",
    photoHint:
      "Unggah gambar, atau tempel path/URL-nya. Kalau kosong, dipakai emoji.",
    preview: "Pratinjau",
    uploading: "Mengupload…",
    imagePlaceholder: "/products/nama.jpg atau URL hasil upload",
    showInCatalog: "Tampilkan di katalog",
    saving: "Menyimpan…",
    save: "Simpan",
    currentPrice: (price: string) => `Harga sekarang: ${price}`,
    delete: "Hapus",
    confirmDelete: (name: string) =>
      `Hapus "${name}"? Tindakan ini permanen dan tidak bisa dibatalkan.`,
    uploadFailed: "Upload gagal.",
    bucketMissing:
      "Bucket 'products' belum dibuat — jalankan supabase/storage.sql dulu.",
    uploadNotAllowed:
      "Tidak diizinkan upload (pastikan kamu admin & storage.sql sudah dijalankan).",
    accessDenied: "Akses ditolak — khusus admin.",
    nameMin: "Nama produk minimal 2 karakter.",
    priceNumber: "Harga harus berupa angka (≥ 0).",
    duplicateName: "Sudah ada produk dengan nama serupa — ganti namanya.",
    saved: "Perubahan tersimpan.",
    added: (name: string) => `Produk "${name}" ditambahkan.`,
  },

  footer: {
    tagline: "Toko demo — checkout QRIS di Midtrans Sandbox.",
    explore: "Jelajah",
    builtWith: "Dibuat dengan",
  },

  charge: {
    invalidJson: "Body bukan JSON valid.",
    incompleteBuyer: "Data pembeli tidak lengkap.",
    emptyCart: "Keranjang kosong.",
    invalidItem: (id: string | undefined) => `Item tidak valid: ${id}`,
    paymentFailed: "Gagal memproses pembayaran.",
  },

  statusApi: {
    orderIdRequired: "orderId wajib diisi.",
    orderNotFound: "Pesanan tidak ditemukan.",
  },

  ordersLoadError: (msg: string) => `Gagal memuat pesanan: ${msg}`,

  meta: {
    homeTitle: "Bakery Kita — Katalog & Pesan Online",
    homeDescription: "Katalog roti & kue segar. Pesan dan bayar lewat QRIS.",
    loginTitle: "Masuk — Bakery Kita",
    signupTitle: "Daftar — Bakery Kita",
    myOrdersTitle: "Pesanan Saya — Bakery Kita",
    adminTitle: "Dashboard Admin — Bakery Kita",
    adminOrdersTitle: "Pesanan Masuk — Admin",
    notFoundTitle: "Halaman tidak ditemukan — Bakery Kita",
  },

  notFound: {
    code: "404",
    title: "Halaman tidak ditemukan",
    body: "Mungkin sudah dipindah, atau memang belum keluar dari oven. Yuk, balik ke menu.",
    back: "Kembali ke menu",
  },

  language: {
    label: "Bahasa",
  },
};

export const dictionaries: Record<Locale, Dict> = { en, id };

export function getDictionary(locale: Locale): Dict {
  return dictionaries[locale];
}
