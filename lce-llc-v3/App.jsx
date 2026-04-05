import { useState, useEffect, useCallback } from "react";

const CATEGORIES = {
  automobile: { label: "Automobile", icon: "🚘", color: "#4a6741" },
  immobilier: { label: "Immobilier", icon: "🏢", color: "#5a4a3a" },
  or: { label: "Or & Métaux", icon: "◊", color: "#8a7a3a" },
  crypto: { label: "Crypto", icon: "◈", color: "#3a4a6a" },
};

const SERVICES = [
  { id: "fortune", title: "Gestion de Fortune", desc: "Stratégies patrimoniales personnalisées pour optimiser et protéger votre capital.", icon: "◆" },
  { id: "transfert", title: "Transfert de Fonds", desc: "Transferts internationaux sécurisés et conformes, sans délai.", icon: "◇" },
  { id: "societe", title: "Création de Société", desc: "Structuration et immatriculation dans les juridictions les plus avantageuses.", icon: "□" },
  { id: "specialise", title: "Services Spécialisés", desc: "Conseil fiscal, optimisation juridique, due diligence sur mesure.", icon: "○" },
];

const SAMPLE_ASSETS = [
  { id: "1", category: "automobile", title: "Mercedes-AMG GT 63", subtitle: "2024 · 585 ch · Noir Obsidienne", price: "185 000", currency: "USD", status: "Disponible" },
  { id: "2", category: "automobile", title: "Porsche 911 Turbo S", subtitle: "2023 · 650 ch · Gris Craie", price: "245 000", currency: "USD", status: "Disponible" },
  { id: "3", category: "immobilier", title: "Penthouse Brickell", subtitle: "Miami, FL · 280m² · Vue baie", price: "2 400 000", currency: "USD", status: "Disponible" },
  { id: "4", category: "immobilier", title: "Appartement Eaux-Vives", subtitle: "Genève · 145m² · Vue lac", price: "1 850 000", currency: "CHF", status: "Sous offre" },
  { id: "5", category: "or", title: "Lingot Or 1kg", subtitle: "Or fin 999.9 · Certifié LBMA", price: "72 500", currency: "USD", status: "Disponible" },
  { id: "6", category: "crypto", title: "Bitcoin (BTC)", subtitle: "Position institutionnelle", price: "Sur demande", currency: "", status: "Actif" },
];

/* ─── STORAGE HELPER (localStorage) ─── */
const storage = {
  get(key) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : null;
    } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
};

/* ─── ADMIN PIN (simple protection) ─── */
const ADMIN_PIN = "2024"; // Changez ce code pour sécuriser l'accès admin

export default function App() {
  const [page, setPage] = useState("home");
  const [assets, setAssets] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = storage.get("lce_assets");
    if (saved && saved.length > 0) {
      setAssets(saved);
    } else {
      setAssets(SAMPLE_ASSETS);
      storage.set("lce_assets", SAMPLE_ASSETS);
    }
    const adm = storage.get("lce_admin");
    if (adm) setIsAdmin(true);
    setLoaded(true);
  }, []);

  const saveAssets = useCallback((newAssets) => {
    setAssets(newAssets);
    storage.set("lce_assets", newAssets);
  }, []);

  const addAsset = (asset) => {
    const newAsset = { ...asset, id: Date.now().toString() };
    saveAssets([newAsset, ...assets]);
    setShowAddModal(false);
  };

  const updateAsset = (asset) => {
    saveAssets(assets.map(a => a.id === asset.id ? asset : a));
    setEditingAsset(null);
  };

  const deleteAsset = (id) => {
    saveAssets(assets.filter(a => a.id !== id));
  };

  const handleAdminLogin = (pin) => {
    if (pin === ADMIN_PIN) {
      setIsAdmin(true);
      storage.set("lce_admin", true);
      setShowPinModal(false);
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("lce_admin");
  };

  const filtered = filter === "all" ? assets : assets.filter(a => a.category === filter);

  if (!loaded) return (
    <div style={styles.loading}>
      <p style={{ color: "#888", letterSpacing: 3, fontSize: 13, textTransform: "uppercase" }}>Chargement…</p>
    </div>
  );

  return (
    <div style={styles.app}>
      <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Libre+Franklin:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <style>{globalCSS}</style>

      {/* NAV */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <div onClick={() => setPage("home")} style={{ cursor: "pointer", display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: "'EB Garamond', serif", fontSize: 22, fontWeight: 600, letterSpacing: 2 }}>LCE</span>
            <span style={{ fontSize: 11, color: "#999", letterSpacing: 2, fontWeight: 400 }}>LLC</span>
          </div>
          <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            {[["home", "Accueil"], ["assets", "Opportunités"], ["services", "Services"]].map(([key, label]) => (
              <button key={key} onClick={() => setPage(key)} style={{
                ...styles.navLink,
                fontWeight: page === key ? 600 : 400,
                color: page === key ? "#1a1a1a" : "#888",
                borderBottom: page === key ? "1.5px solid #1a1a1a" : "1.5px solid transparent",
              }}>
                {label}
              </button>
            ))}
            <button onClick={() => setShowContactModal(true)} style={styles.navCta}>Contact</button>
            {!isAdmin ? (
              <button onClick={() => setShowPinModal(true)} style={{ ...styles.navLink, color: "#bbb", fontSize: 11 }}>Admin</button>
            ) : (
              <button onClick={handleAdminLogout} style={{ ...styles.navLink, color: "#4a6741", fontSize: 11, fontWeight: 600 }}>● Admin</button>
            )}
          </div>
        </div>
      </nav>

      {/* PAGES */}
      <main style={styles.main}>
        {page === "home" && <HomePage setPage={setPage} assets={assets} setShowContactModal={setShowContactModal} />}
        {page === "assets" && (
          <AssetsPage
            assets={filtered} allAssets={assets} filter={filter} setFilter={setFilter}
            onAdd={() => setShowAddModal(true)} onEdit={setEditingAsset} onDelete={deleteAsset}
            isAdmin={isAdmin}
          />
        )}
        {page === "services" && <ServicesPage setShowContactModal={setShowContactModal} />}
      </main>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <p style={{ fontSize: 11, color: "#aaa", letterSpacing: 2, textTransform: "uppercase" }}>
          © 2026 LCE LLC · Miami · Genève
        </p>
      </footer>

      {/* MODALS */}
      {showAddModal && <AssetModal onClose={() => setShowAddModal(false)} onSave={addAsset} />}
      {editingAsset && <AssetModal asset={editingAsset} onClose={() => setEditingAsset(null)} onSave={updateAsset} />}
      {showContactModal && <ContactModal onClose={() => setShowContactModal(false)} />}
      {showPinModal && <PinModal onClose={() => setShowPinModal(false)} onSubmit={handleAdminLogin} />}
    </div>
  );
}

/* ─── HOME PAGE ─── */
function HomePage({ setPage, assets, setShowContactModal }) {
  const counts = {};
  Object.keys(CATEGORIES).forEach(k => { counts[k] = assets.filter(a => a.category === k).length; });

  return (
    <div className="fade-in">
      <div style={{ padding: "100px 0 80px", maxWidth: 680 }}>
        <p style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#999", marginBottom: 24 }}>
          Asset Management · Advisory
        </p>
        <h1 style={styles.heroTitle}>
          Investissements stratégiques<br />
          <span style={{ fontStyle: "italic", color: "#666" }}>& services sur mesure</span>
        </h1>
        <p style={{ fontSize: 16, color: "#666", lineHeight: 1.8, marginBottom: 40, maxWidth: 520 }}>
          LCE LLC accompagne ses clients dans la gestion d'actifs diversifiés — or, crypto-monnaies, automobile, immobilier — avec une approche discrète et personnalisée.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={() => setPage("assets")} style={styles.btnDark}>Voir les opportunités</button>
          <button onClick={() => setShowContactModal(true)} style={styles.btnOutline}>Nous contacter</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 80 }}>
        {Object.entries(CATEGORIES).map(([key, cat], i) => (
          <div key={key} onClick={() => setPage("assets")} className="hover-lift fade-in"
            style={{ ...styles.card, padding: "28px 24px", cursor: "pointer", animationDelay: `${i * .1}s` }}>
            <div style={{ fontSize: 24, marginBottom: 16, opacity: .6 }}>{cat.icon}</div>
            <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: 20, fontWeight: 500, marginBottom: 6 }}>{cat.label}</h3>
            <p style={{ fontSize: 12, color: "#999", letterSpacing: 1 }}>{counts[key] || 0} actif{(counts[key] || 0) > 1 ? "s" : ""}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#e8e6e2", borderRadius: 12, overflow: "hidden", marginBottom: 80 }} className="resp-grid">
        {[
          { city: "Miami", country: "États-Unis", detail: "Brickell Financial District" },
          { city: "Genève", country: "Suisse", detail: "Centre financier international" },
        ].map((loc, i) => (
          <div key={i} style={{ background: "#fff", padding: "40px 32px" }}>
            <p style={{ fontSize: 11, color: "#999", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>{loc.country}</p>
            <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: 28, fontWeight: 500, marginBottom: 8 }}>{loc.city}</h3>
            <p style={{ fontSize: 14, color: "#888" }}>{loc.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── ASSETS PAGE ─── */
function AssetsPage({ assets, allAssets, filter, setFilter, onAdd, onEdit, onDelete, isAdmin }) {
  return (
    <div className="fade-in" style={{ paddingTop: 48 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={styles.pageTitle}>Opportunités</h2>
          <p style={{ fontSize: 14, color: "#888" }}>{allAssets.length} actif{allAssets.length > 1 ? "s" : ""} disponible{allAssets.length > 1 ? "s" : ""}</p>
        </div>
        {isAdmin && (
          <button onClick={onAdd} className="hover-lift" style={{ ...styles.btnDark, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>+</span> Ajouter un actif
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
        <FilterBtn active={filter === "all"} onClick={() => setFilter("all")}>Tous</FilterBtn>
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <FilterBtn key={key} active={filter === key} onClick={() => setFilter(key)}>{cat.label}</FilterBtn>
        ))}
      </div>

      {assets.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>
          <p style={{ fontSize: 14 }}>Aucun actif dans cette catégorie.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }} className="resp-grid">
          {assets.map((asset, i) => (
            <AssetCard key={asset.id} asset={asset} index={i} onEdit={() => onEdit(asset)} onDelete={() => onDelete(asset.id)} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: active ? "#1a1a1a" : "#fff", color: active ? "#fafaf8" : "#666",
      border: active ? "none" : "1px solid #e0ded8", padding: "8px 18px",
      borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all .2s",
    }}>
      {children}
    </button>
  );
}

function AssetCard({ asset, index, onEdit, onDelete, isAdmin }) {
  const cat = CATEGORIES[asset.category] || {};
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="hover-lift fade-in" style={{ ...styles.card, overflow: "hidden", position: "relative", animationDelay: `${index * .05}s` }}>
      <div style={{ height: 3, background: cat.color || "#ccc" }} />
      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18, opacity: .5 }}>{cat.icon}</span>
            <span style={{ fontSize: 10, color: "#999", letterSpacing: 1.5, textTransform: "uppercase" }}>{cat.label}</span>
          </div>
          {isAdmin && (
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowMenu(!showMenu)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#ccc", padding: "0 4px" }}>⋮</button>
              {showMenu && (
                <div style={styles.dropdown}>
                  <button onClick={() => { onEdit(); setShowMenu(false); }} style={styles.dropItem}>Modifier</button>
                  <button onClick={() => { onDelete(); setShowMenu(false); }} style={{ ...styles.dropItem, color: "#c0392b" }}>Supprimer</button>
                </div>
              )}
            </div>
          )}
        </div>
        <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: 20, fontWeight: 500, marginBottom: 6 }}>{asset.title}</h3>
        <p style={{ fontSize: 13, color: "#888", marginBottom: 16, lineHeight: 1.5 }}>{asset.subtitle}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'EB Garamond', serif", fontSize: 18, fontWeight: 600 }}>
            {asset.price}{asset.currency ? ` ${asset.currency}` : ""}
          </span>
          <span style={{
            fontSize: 10, letterSpacing: 1, textTransform: "uppercase", fontWeight: 600,
            color: asset.status === "Disponible" ? "#4a6741" : asset.status === "Actif" ? "#3a4a6a" : "#8a6a2a",
            background: asset.status === "Disponible" ? "#eef4ec" : asset.status === "Actif" ? "#eceff4" : "#f4f0e6",
            padding: "4px 10px", borderRadius: 4,
          }}>
            {asset.status}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── SERVICES PAGE ─── */
function ServicesPage({ setShowContactModal }) {
  return (
    <div className="fade-in" style={{ paddingTop: 48 }}>
      <div style={{ maxWidth: 600, marginBottom: 48 }}>
        <h2 style={styles.pageTitle}>Services sur mesure</h2>
        <p style={{ fontSize: 14, color: "#888", lineHeight: 1.7 }}>
          Un accompagnement personnalisé pour chaque étape de votre stratégie patrimoniale.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 60 }}>
        {SERVICES.map((s, i) => (
          <div key={s.id} className="hover-lift fade-in"
            style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: 24, ...styles.card, padding: "28px 32px", animationDelay: `${i * .08}s` }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: "#f5f4f0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'EB Garamond', serif", fontSize: 18, color: "#666" }}>
              {s.icon}
            </div>
            <div>
              <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: 20, fontWeight: 500, marginBottom: 6 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: "#888", lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#1a1a1a", borderRadius: 16, padding: 48, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
        <div>
          <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: 24, fontWeight: 500, color: "#fafaf8", marginBottom: 8 }}>Un projet en tête ?</h3>
          <p style={{ fontSize: 14, color: "#888" }}>Discutons de vos objectifs. Premier échange sans engagement.</p>
        </div>
        <button onClick={() => setShowContactModal(true)} style={{ ...styles.btnDark, background: "#fafaf8", color: "#1a1a1a" }}>Prendre contact</button>
      </div>
    </div>
  );
}

/* ─── MODALS ─── */
function Overlay({ onClose, children }) {
  return (
    <div onClick={onClose} style={styles.overlay}>
      <div onClick={e => e.stopPropagation()} className="fade-in" style={styles.modal}>{children}</div>
    </div>
  );
}

function FieldLabel({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#999", marginBottom: 6, fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = { width: "100%", padding: "10px 14px", background: "#fff", border: "1px solid #e0ded8", borderRadius: 8, fontSize: 14, color: "#1a1a1a", outline: "none", fontFamily: "'Libre Franklin', sans-serif" };

function AssetModal({ asset, onClose, onSave }) {
  const isEdit = !!asset;
  const [form, setForm] = useState(asset || { category: "automobile", title: "", subtitle: "", price: "", currency: "USD", status: "Disponible" });
  const update = (k, v) => setForm({ ...form, [k]: v });

  return (
    <Overlay onClose={onClose}>
      <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: 22, fontWeight: 500, marginBottom: 24 }}>
        {isEdit ? "Modifier l'actif" : "Nouvel actif"}
      </h3>
      <FieldLabel label="Catégorie">
        <select value={form.category} onChange={e => update("category", e.target.value)} style={inputStyle}>
          {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </FieldLabel>
      <FieldLabel label="Titre">
        <input value={form.title} onChange={e => update("title", e.target.value)} placeholder="ex: Porsche 911 Turbo S" style={inputStyle} />
      </FieldLabel>
      <FieldLabel label="Description">
        <input value={form.subtitle} onChange={e => update("subtitle", e.target.value)} placeholder="ex: 2024 · 650 ch · Blanc" style={inputStyle} />
      </FieldLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 12 }}>
        <FieldLabel label="Prix"><input value={form.price} onChange={e => update("price", e.target.value)} placeholder="250 000" style={inputStyle} /></FieldLabel>
        <FieldLabel label="Devise">
          <select value={form.currency} onChange={e => update("currency", e.target.value)} style={inputStyle}>
            <option>USD</option><option>EUR</option><option>CHF</option><option>GBP</option>
          </select>
        </FieldLabel>
      </div>
      <FieldLabel label="Statut">
        <select value={form.status} onChange={e => update("status", e.target.value)} style={inputStyle}>
          <option>Disponible</option><option>Sous offre</option><option>Vendu</option><option>Actif</option>
        </select>
      </FieldLabel>
      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <button onClick={() => onSave(form)} style={{ ...styles.btnDark, flex: 1, textAlign: "center", justifyContent: "center" }}>
          {isEdit ? "Enregistrer" : "Ajouter"}
        </button>
        <button onClick={onClose} style={{ padding: "12px 24px", background: "none", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#666" }}>Annuler</button>
      </div>
    </Overlay>
  );
}

function ContactModal({ onClose }) {
  const [sent, setSent] = useState(false);
  return (
    <Overlay onClose={onClose}>
      <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: 22, fontWeight: 500, marginBottom: 8 }}>Contact</h3>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 24, lineHeight: 1.6 }}>Contactez-nous directement.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: 20, background: "#f8f7f4", borderRadius: 10, marginBottom: 24 }}>
        <ContactRow icon="✉" label="Email" value="Infos.LCE@proton.me" href="mailto:Infos.LCE@proton.me" />
        <ContactRow icon="📞" label="Téléphone" value="+1 (954) 795-0682" href="tel:+19547950682" />
        <ContactRow icon="💬" label="WhatsApp" value="Envoyer un message" href="https://wa.me/19547950682" />
        <div style={{ display: "flex", gap: 12, fontSize: 13, color: "#666", alignItems: "center" }}>
          <span style={{ width: 20, textAlign: "center" }}>📍</span>
          <span>Miami, FL · Genève, CH</span>
        </div>
      </div>
      <div style={{ height: 1, background: "#e8e6e2", marginBottom: 20 }} />
      {!sent ? (
        <>
          <FieldLabel label="Nom complet"><input placeholder="Votre nom" style={inputStyle} /></FieldLabel>
          <FieldLabel label="Email"><input placeholder="votre@email.com" type="email" style={inputStyle} /></FieldLabel>
          <FieldLabel label="Intéressé par">
            <select style={inputStyle}>
              <option value="">Sélectionnez…</option>
              <option>Or & Métaux Précieux</option><option>Crypto-monnaies</option>
              <option>Automobile</option><option>Immobilier</option>
              <option>Gestion de Fortune</option><option>Transfert de Fonds</option>
              <option>Création de Société</option><option>Services Spécialisés</option>
            </select>
          </FieldLabel>
          <FieldLabel label="Message"><textarea placeholder="Décrivez votre projet…" rows={3} style={{ ...inputStyle, resize: "vertical" }} /></FieldLabel>
          <button onClick={() => setSent(true)} style={{ ...styles.btnDark, width: "100%", textAlign: "center", justifyContent: "center", marginTop: 8 }}>Envoyer</button>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <p style={{ fontSize: 20, marginBottom: 8 }}>✓</p>
          <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 18 }}>Message envoyé</p>
          <p style={{ fontSize: 13, color: "#888", marginTop: 6 }}>Nous vous répondrons sous 24h.</p>
        </div>
      )}
    </Overlay>
  );
}

function PinModal({ onClose, onSubmit }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (pin === ADMIN_PIN) {
      onSubmit(pin);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: 22, fontWeight: 500, marginBottom: 8 }}>Accès administrateur</h3>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>Entrez votre code PIN pour gérer les actifs.</p>
      <FieldLabel label="Code PIN">
        <input type="password" value={pin} onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder="••••" style={{ ...inputStyle, letterSpacing: 8, textAlign: "center", fontSize: 20 }} />
      </FieldLabel>
      {error && <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 12 }}>Code incorrect.</p>}
      <button onClick={handleSubmit} style={{ ...styles.btnDark, width: "100%", textAlign: "center", justifyContent: "center", marginTop: 8 }}>Accéder</button>
    </Overlay>
  );
}

function ContactRow({ icon, label, value, href }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ display: "flex", gap: 12, fontSize: 13, color: "#333", textDecoration: "none", alignItems: "center" }}>
      <span style={{ width: 20, textAlign: "center" }}>{icon}</span>
      <span style={{ color: "#888", minWidth: 70 }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </a>
  );
}

/* ─── STYLES ─── */
const styles = {
  app: { fontFamily: "'Libre Franklin', 'Helvetica Neue', sans-serif", background: "#fafaf8", color: "#1a1a1a", minHeight: "100vh" },
  loading: { height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafaf8" },
  nav: { position: "sticky", top: 0, zIndex: 100, background: "rgba(250,250,248,.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid #e8e6e2", padding: "0 2.5rem" },
  navInner: { maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 },
  navLink: { background: "none", border: "none", cursor: "pointer", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", paddingBottom: 2, transition: "all .2s" },
  navCta: { background: "#1a1a1a", color: "#fafaf8", border: "none", padding: "8px 20px", borderRadius: 6, fontSize: 11, fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" },
  main: { maxWidth: 1200, margin: "0 auto", padding: "0 2.5rem" },
  heroTitle: { fontFamily: "'EB Garamond', serif", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 500, lineHeight: 1.15, marginBottom: 24, letterSpacing: -0.5 },
  pageTitle: { fontFamily: "'EB Garamond', serif", fontSize: 32, fontWeight: 500, marginBottom: 8 },
  card: { background: "#fff", border: "1px solid #ebe9e4", borderRadius: 12 },
  btnDark: { background: "#1a1a1a", color: "#fafaf8", border: "none", padding: "14px 32px", borderRadius: 8, fontSize: 13, fontWeight: 500, letterSpacing: 1, cursor: "pointer", display: "inline-flex", alignItems: "center" },
  btnOutline: { background: "none", color: "#1a1a1a", border: "1px solid #d0cec8", padding: "14px 32px", borderRadius: 8, fontSize: 13, fontWeight: 500, letterSpacing: 1, cursor: "pointer" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 },
  modal: { background: "#fafaf8", borderRadius: 16, padding: 32, width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,.15)" },
  dropdown: { position: "absolute", right: 0, top: 24, background: "#fff", border: "1px solid #e8e6e2", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,.1)", overflow: "hidden", zIndex: 10, minWidth: 140 },
  dropItem: { display: "block", width: "100%", textAlign: "left", padding: "10px 16px", fontSize: 13, border: "none", background: "none", cursor: "pointer", color: "#333" },
  footer: { borderTop: "1px solid #e8e6e2", marginTop: 80, padding: "2.5rem", textAlign: "center" },
};

const globalCSS = `
  *{margin:0;padding:0;box-sizing:border-box}
  ::selection{background:#1a1a1a;color:#fafaf8}
  .fade-in{animation:fadeIn .6s ease both}
  @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  .hover-lift{transition:transform .25s,box-shadow .25s}
  .hover-lift:hover{transform:translateY(-3px);box-shadow:0 8px 30px rgba(0,0,0,.08)}
  @media(max-width:700px){
    .resp-grid{grid-template-columns:1fr!important}
    nav>div:last-child{gap:12px!important}
  }
`;
