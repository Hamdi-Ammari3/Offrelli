"use client";
import "./style.css";

export default function Home() {
  return (
    <div className="landing">
      <section className="hero">
        <h1>🎁 Des remises exclusives près de chez vous</h1>
        <p>
          Scannez le QR code en magasin et profitez de réductions instantanées.
        </p>
      </section>

      <section className="how-it-works">
        <h2>Comment ça marche ?</h2>

        <div className="steps">
          <div className="step">
            <h3>📱 Scannez</h3>
            <p>Scannez le QR code affiché en magasin.</p>
          </div>

          <div className="step">
            <h3>🔢 Entrez le code</h3>
            <p>Ajoutez votre numéro et le code donné par le vendeur.</p>
          </div>

          <div className="step">
            <h3>🎉 Profitez</h3>
            <p>Utilisez votre remise lors de votre prochain achat.</p>
          </div>
        </div>
      </section>

      <section className="trust">
        <h2>Pourquoi Offrelli ?</h2>

        <div className="trust-grid">
          <div>✅ Remises authentiques</div>
          <div>🔒 Code unique et sécurisé</div>
          <div>🏪 Valable chez le commerçant</div>
          <div>⏳ Validité limitée</div>
        </div>
      </section>

      <footer className="footer">
        © {new Date().getFullYear()} Offrelli - Tous droits réservés
      </footer>
    </div>
  );
}
