"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { collection,query,where,getDocs,limit,doc,runTransaction } from "firebase/firestore";
import { DB } from "../../../firebaseConfig";
import { FaGift, FaCheckCircle, FaTimesCircle, FaExclamationCircle } from "react-icons/fa";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import "../../style.css";

export default function ClientDiscountPage() {

  const { storeID } = useParams();
  dayjs.locale("ar");

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [successData, setSuccessData] = useState(null);

  //Submit discount 
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (phone.length < 8) {
      alert("Veuillez entrer un numéro valide");
      return;
    }

    if (!code.trim()) {
      alert("Veuillez entrer le code");
      return;
    }

    try {
      setLoading(true);

      const discountQuery = query(
        collection(DB, "discounts"),
        where("store_id", "==", storeID),
        where("discount_code", "==", code.trim()),
        limit(1)
      );

      const discountSnapshot = await getDocs(discountQuery);

      if (discountSnapshot.empty) {
        setResult("wrong_code");
        return;
      }

      const discountDoc = discountSnapshot.docs[0];
      const discountRef = doc(DB, "discounts", discountDoc.id);

      // Fetch previous active discounts BEFORE transaction
      const previousQuery = query(
        collection(DB, "discounts"),
        where("store_id", "==", storeID),
        where("phone_number", "==", phone),
        where("archived", "==", false)
      );
      const previousSnapshot = await getDocs(previousQuery);

      await runTransaction(DB, async (transaction) => {     
        const freshDoc = await transaction.get(discountRef);
        const discountData = freshDoc.data();

        if (discountData.scanned) {
          throw new Error("already_claimed");
        }

        if (discountData.used) {
          throw new Error("already_used");
        }

        const now = new Date();
        const expiredAt = discountData.expired_at?.toDate();

        if (expiredAt && expiredAt < now) {
          throw new Error("expired");
        }

        // Archive previous active discounts
        previousSnapshot.forEach((docSnap) => {
          transaction.update(doc(DB, "discounts", docSnap.id), {
            archived: true
          });
        });

        transaction.update(discountRef, {
          phone_number: phone,
          scanned: true,
          scanned_at: new Date(),
          archived: false
        });
      });

      setSuccessData({
        storeName: discountDoc.data().store_name,
        phone: phone,
        discountAmount: discountDoc.data().discount_amount,
        expiredAt: discountDoc.data().expired_at.toDate()
      });
      setResult("success");

    } catch (error) {
      if (error.message === "wrong_code") {
        setResult("wrong_code");
      } else if (error.message === "already_claimed") {
        setResult("already_claimed");
      } else if (error.message === "already_used") {
        setResult("already_used");
      } else if (error.message === "expired") {
        setResult("expired");
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setPhone("");
    setCode("");
  };

  return (
    <div className="client-page">

      {!result && (
        <div className="card">
          <div className="icon">
            <FaGift size={28} />
          </div>
          <h1>Obtenir votre remise</h1>
          <p className="subtitle">
            Entrez votre numéro et le code donné par le magasin
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="tel"
              placeholder="Numéro de téléphone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              type="text"
              placeholder="Code reçu"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Vérification..." : "Valider"}
            </button>
          </form>
        </div>
      )}

      {result === "success" && successData && (
        <div className="card success">
          <FaCheckCircle size={40} />
          <h2>Remise enregistrée !</h2>
          <div className="success-details">
            <p>
              <strong>Magasin :</strong> {successData.storeName}
            </p>

            <p>
              <strong>Remise :</strong> {successData.discountAmount}%
            </p>

            <p>
              <strong>Numéro enregistré :</strong>
              <span dir="ltr"> {successData.phone}</span>
            </p>

            <p>
              <strong>Valable jusqu'au :</strong>{" "}
              {dayjs(successData.expiredAt).format("DD/MM/YYYY")}
            </p>
          </div>

          <p className="note">
            Présentez votre numéro au magasin avant expiration.
          </p>

          <button onClick={resetForm} className="primary-btn">
            Entrer un autre code          
          </button>
        </div>
      )}

      {result === "wrong_code" && (
        <div className="card error">
          <FaTimesCircle size={40} />
          <h2>Code incorrect</h2>
          <p>Vérifiez le code et réessayez.</p>
          <button onClick={resetForm} className="primary-btn">
            Réessayer
          </button>
        </div>
      )}

      {result === "already_used" && (
        <div className="card warning">
          <FaExclamationCircle size={40} />
          <h2>Code déjà utilisé</h2>
          <p>Ce code a déjà été utilisé.</p>
          <button onClick={resetForm} className="primary-btn">
            Réessayer
          </button>
        </div>
      )}

      {result === "already_claimed" && (
        <div className="card warning">
          <FaExclamationCircle size={40} />
          <h2>Code déjà enregistré</h2>
          <p>Ce code est déjà lié à un autre numéro.</p>
          <button onClick={resetForm} className="primary-btn">
            Réessayer
          </button>
        </div>
      )}

      {result === "expired" && (
        <div className="card warning">
          <FaExclamationCircle size={40} />
          <h2>Remise expirée</h2>
          <p>Ce code n'est plus valable.</p>
          <button onClick={resetForm} className="primary-btn">
            Réessayer
          </button>
        </div>
      )}

    </div>
  );
}
