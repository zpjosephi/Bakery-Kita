"use client";

import { useRef, useState } from "react";

// ===========================================================================
//  ZONA UJI KEAMANAN  -  sandbox latihan client-side, isolated dari app asli.
//  Semua "celah" di sini sengaja dibikin bocor biar bisa dilatih. Tiap kartu
//  punya widget buat dicoba + penjelasan kenapa bisa ditembus + cara nutupnya.
//
//  Lesson 5 sengaja naruh "rahasia" di kode ini biar bisa ketemu pas dibaca.
// ===========================================================================

// Coba cari nilai ini lewat View Source / Network tab tanpa lihat layar.
const KUPON_RAHASIA = "GRATIS-BAKERY-2026";

function Card({
  no,
  judul,
  children,
}: {
  no: number;
  judul: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div className="mb-4 flex items-baseline gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 font-mono text-sm font-semibold text-brand-700">
          {no}
        </span>
        <h2 className="font-display text-xl font-semibold text-foreground">
          {judul}
        </h2>
      </div>
      <div className="space-y-4 text-[15px] leading-relaxed text-foreground/90">
        {children}
      </div>
    </section>
  );
}

function Coba({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg bg-brand-50 px-4 py-3 text-[14px] text-brand-900">
      <span className="font-semibold">Coba: </span>
      {children}
    </p>
  );
}

function Jawaban({ children }: { children: React.ReactNode }) {
  return (
    <details className="group rounded-lg border border-border bg-background/60 px-4 py-3">
      <summary className="cursor-pointer select-none text-sm font-semibold text-brand-700 marker:content-['']">
        Lihat penjelasan & cara nutupnya
      </summary>
      <div className="mt-3 space-y-2 text-[14px] leading-relaxed text-muted">
        {children}
      </div>
    </details>
  );
}

export default function HackLab() {
  // Lesson 1 - foto random
  const [seed, setSeed] = useState(7);

  // Lesson 4 - harga client-side
  const hargaRef = useRef<HTMLInputElement>(null);
  const [pesanBayar, setPesanBayar] = useState("");

  // Lesson 5 - kupon
  const [kupon, setKupon] = useState("");
  const [pesanKupon, setPesanKupon] = useState("");

  // Lesson 6 - peran via localStorage
  const [pesanPeran, setPesanPeran] = useState("");
  const [panelAdmin, setPanelAdmin] = useState(false);

  function cekBayar() {
    const dikirim = hargaRef.current?.value ?? "?";
    setPesanBayar(
      `Server nerima harga = Rp${dikirim}. Kalau server percaya gitu aja, segini yang kamu bayar.`,
    );
  }

  function cekKupon() {
    setPesanKupon(
      kupon.trim() === KUPON_RAHASIA
        ? "Kupon valid! Diskon 100% kepasang. (Padahal kode ini ketahuan dari source.)"
        : "Kupon salah.",
    );
  }

  function cekPeran() {
    const peran =
      typeof window !== "undefined" ? localStorage.getItem("peran") : null;
    if (peran === "admin") {
      setPanelAdmin(true);
      setPesanPeran("Terdeteksi sebagai admin. Panel rahasia kebuka.");
    } else {
      setPanelAdmin(false);
      setPesanPeran(`Peran kamu sekarang: "${peran ?? "belum diset"}" (bukan admin).`);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <header className="mb-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 font-mono text-xs text-muted">
          halaman tersembunyi · isolated · tidak menyentuh database asli
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold text-foreground">
          Zona Uji Keamanan
        </h1>
        <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-muted">
          Tiap kartu di bawah punya satu celah client-side yang sengaja dibiarkan
          bocor. Buka DevTools (F12), kerjain bagian &quot;Coba&quot;, baru buka
          penjelasannya. Inti tiap pelajaran sama: apa pun yang dikirim ke browser
          itu milik penyerang, jadi keputusan penting harus diputus di server.
        </p>
      </header>

      <div className="space-y-6">
        {/* 1 - DOM editing */}
        <Card no={1} judul="Ganti gambar & teks (yang sudah kamu bisa)">
          <div className="flex flex-wrap items-center gap-5">
            <div className="rounded-xl border-4 border-brand-200 bg-surface p-2 shadow-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                id="foto-uji"
                src={`https://picsum.photos/seed/${seed}/240/180`}
                alt="foto random dalam bingkai"
                width={240}
                height={180}
                className="rounded-lg"
              />
            </div>
            <button
              onClick={() => setSeed((s) => s + 1)}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-brand-600"
            >
              Foto random baru
            </button>
          </div>
          <p id="teks-edit" className="font-medium">
            Teks ini bisa kamu ubah lewat Inspect, tapi cuma di layarmu.
          </p>
          <Coba>
            Klik kanan fotonya, Inspect, ganti <code>src</code> jadi gambar lain.
            Ganti juga teks di atas. Lalu <b>refresh</b> halaman.
          </Coba>
          <Jawaban>
            <p>
              Begitu refresh, semua balik semula. Editan tadi cuma terjadi di
              salinan HTML di browser kamu, bukan di server. Pengunjung lain tidak
              kena apa-apa.
            </p>
            <p>
              <b>Pelajaran:</b> mengubah tampilan di DevTools bukan meretas
              website. Itu baru jadi celah kalau perubahan itu bisa <i>tersimpan</i>{" "}
              ke server (lihat kartu 4).
            </p>
          </Jawaban>
        </Card>

        {/* 2 - hidden element */}
        <Card no={2} judul="Tombol yang disembunyikan lewat CSS">
          <p>
            Di bawah ini ada tombol admin yang disembunyikan dengan{" "}
            <code>display:none</code>. Di UI kamu tidak melihatnya, tapi dia tetap
            ada di HTML.
          </p>
          <button
            onClick={() =>
              alert(
                "Kalau ini API beneran tanpa cek izin, semua pesanan barusan kehapus.",
              )
            }
            className="hidden rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
          >
            ADMIN: Hapus semua pesanan
          </button>
          <Coba>
            Di tab Elements, cari tombol bertuliskan &quot;ADMIN: Hapus semua
            pesanan&quot;, hapus class <code>hidden</code>-nya, lalu klik
            tombolnya.
          </Coba>
          <Jawaban>
            <p>
              Tombolnya muncul dan bisa diklik. Menyembunyikan sesuatu di UI{" "}
              <b>tidak</b> mengamankannya. Penyerang bisa membuka kembali apa pun
              yang dikirim ke browser.
            </p>
            <p>
              <b>Cara nutup:</b> jangan andalkan UI. Endpoint penghapusan di server
              harus mengecek &quot;yang manggil ini beneran admin?&quot; setiap
              kali dipanggil, terlepas dari ada/tidaknya tombol.
            </p>
          </Jawaban>
        </Card>

        {/* 3 - disabled button */}
        <Card no={3} judul="Tombol disabled">
          <button
            disabled
            onClick={() => alert("Hadiah keklaim. Tombol disabled ternyata cuma di client.")}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Klaim hadiah (disabled)
          </button>
          <Coba>
            Inspect tombolnya, hapus atribut <code>disabled</code>, lalu klik.
          </Coba>
          <Jawaban>
            <p>
              <code>disabled</code> hanya petunjuk visual di client; gampang
              dilepas. Aksi yang sebenarnya tetap jalan begitu tombol diklik.
            </p>
            <p>
              <b>Cara nutup:</b> server harus memvalidasi syaratnya sendiri
              (misal &quot;hadiah ini memang berhak diklaim user ini dan belum
              pernah diklaim&quot;), bukan percaya bahwa tombolnya tadi disabled.
            </p>
          </Jawaban>
        </Card>

        {/* 4 - client-side price */}
        <Card no={4} judul="Harga yang dipercaya dari client (celah mahal)">
          <p>
            Total: <b>Rp50.000</b>. Harga ini disimpan di input tersembunyi di
            bawah, dan tombol &quot;Bayar&quot; mengirim apa pun yang ada di situ.
          </p>
          <input ref={hargaRef} id="harga" type="hidden" defaultValue="50000" />
          <button
            onClick={cekBayar}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-brand-600"
          >
            Bayar
          </button>
          {pesanBayar && (
            <p className="rounded-lg bg-background px-4 py-3 font-mono text-[13px] text-foreground">
              {pesanBayar}
            </p>
          )}
          <Coba>
            Di tab Elements cari <code>{`<input id="harga">`}</code>, ubah{" "}
            <code>value</code>-nya jadi <code>1</code>, lalu klik Bayar.
          </Coba>
          <Jawaban>
            <p>
              Server akan menerima Rp1. Ini celah yang benar-benar dipakai di toko
              online beneran: harga, jumlah, diskon, semuanya tidak boleh diambil
              dari yang dikirim browser.
            </p>
            <p>
              <b>Cara nutup:</b> client cukup mengirim <i>id produk + jumlah</i>.
              Server mengambil harga asli dari database lalu menghitung totalnya
              sendiri. Apa pun harga yang dikirim client diabaikan.
            </p>
          </Jawaban>
        </Card>

        {/* 5 - secret in source */}
        <Card no={5} judul="Rahasia yang ikut terkirim ke browser">
          <p>
            Form ini mengecek kode kupon langsung di kode JavaScript yang berjalan
            di browser kamu.
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              value={kupon}
              onChange={(e) => setKupon(e.target.value)}
              placeholder="Masukkan kode kupon"
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
            />
            <button
              onClick={cekKupon}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              Pakai kupon
            </button>
          </div>
          {pesanKupon && <p className="font-medium">{pesanKupon}</p>}
          <Coba>
            Jangan menebak. Buka tab Sources (atau Ctrl+U / Ctrl+F di kode),
            cari kata <code>KUPON</code>, temukan kodenya, lalu tempel di atas.
          </Coba>
          <Jawaban>
            <p>
              Kodenya <code>{KUPON_RAHASIA}</code>, terbaca jelas karena ikut
              dikirim ke browser. Semua yang ada di frontend itu publik: kode,
              komentar, dan API key yang &quot;disembunyikan&quot; di sana.
            </p>
            <p>
              <b>Cara nutup:</b> validasi kupon di server. API key / secret
              disimpan sebagai environment variable yang hanya dipakai di kode
              server (di Next.js: tanpa prefix <code>NEXT_PUBLIC_</code>).
            </p>
          </Jawaban>
        </Card>

        {/* 6 - localStorage role */}
        <Card no={6} judul="Peran user yang disimpan di client">
          <p>
            Halaman ini menentukan apakah kamu admin dengan membaca{" "}
            <code>localStorage.peran</code>.
          </p>
          <button
            onClick={cekPeran}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            Cek apakah aku admin
          </button>
          {pesanPeran && <p className="font-medium">{pesanPeran}</p>}
          {panelAdmin && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
              Panel admin rahasia: di sini biasanya ada data sensitif semua user.
            </div>
          )}
          <Coba>
            Buka tab Console, jalankan{" "}
            <code>localStorage.peran = &quot;admin&quot;</code>, lalu klik tombol
            di atas.
          </Coba>
          <Jawaban>
            <p>
              Panel admin terbuka, padahal kamu tidak login sebagai siapa pun.
              localStorage, cookie biasa, dan sessionStorage semuanya bisa diubah
              penyerang.
            </p>
            <p>
              <b>Cara nutup:</b> peran ditentukan di server dari sesi login yang
              terverifikasi (token yang ditandatangani / dicek ke database). Client
              tidak pernah boleh &quot;mengaku&quot; sebagai admin.
            </p>
          </Jawaban>
        </Card>

        {/* 7 - security by obscurity */}
        <Card no={7} judul="Kenapa URL rahasia ini bukan keamanan">
          <p>
            Halaman ini &quot;aman&quot; hanya karena URL-nya susah ditebak. Itu
            disebut security by obscurity, dan tidak dihitung sebagai keamanan.
          </p>
          <Coba>
            Bayangkan kalau halaman ini berisi data asli. URL bisa bocor lewat
            riwayat browser, log server, header Referer, atau ketebak. Tidak ada
            yang menjaganya.
          </Coba>
          <Jawaban>
            <p>
              Menyembunyikan alamat menaikkan sedikit kesulitan, tapi bukan
              pengaman. Halaman dengan data sensitif tetap butuh pengecekan login
              dan izin di server, sekalipun URL-nya rahasia.
            </p>
            <p>
              <b>Catatan:</b> di sandbox ini obscurity dipakai sengaja, hanya
              supaya halaman latihan ini tidak nyasar ke pengunjung. Tidak ada data
              asli di sini, jadi aman.
            </p>
          </Jawaban>
        </Card>
      </div>

      <footer className="mt-12 border-t border-border pt-6 text-sm text-muted">
        Benang merah ketujuh kartu: jangan pernah percaya apa pun yang datang dari
        browser. Tampilan, tombol, harga, kupon, peran, semuanya bisa dipalsukan.
        Keamanan sesungguhnya hidup di server.
      </footer>
    </main>
  );
}
