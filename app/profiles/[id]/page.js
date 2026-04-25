"use client";

import { useRef, useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { DB } from "../../../firebaseConfig";
import { useParams } from "next/navigation";
import {FaPhoneAlt,FaWhatsapp,FaInstagram,FaTiktok,FaChevronLeft,FaChevronRight,FaClock } from "react-icons/fa";
import { FiFacebook } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";
import ClipLoader from "react-spinners/ClipLoader";
import "../../style.css";

function ServicesSlider({ products, whatsapp }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  //AUTO DETECT ACTIVE SLIDE
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const handleScroll = () => {
      const index = Math.round(
        el.scrollLeft / (el.clientWidth * 0.78)
      );
      setActive(index);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });

    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // BUTTON SCROLL
  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (!el) return;

    el.scrollBy({
      left: dir * el.clientWidth * 0.78,
      behavior: "smooth",
    });
  };

  return (
    <div className="slider-container">
      <div className="slider-wrapper">
      <div ref={trackRef} className="slider">
        {products.map((p, i) => (
          <div key={i} className="slide">
            <img src={p.image} className="slide-img" />
            <div className="overlay" />
            <div className="slide-content">
              <h3>{p.name}</h3>
              {p.price > 0 && (
                <p className="price">{p.price} TND</p>
              )}            
            </div>
          </div>
        ))}
      </div>
      </div>

      <div className="slider-footer">
        <div className="dots">
          {products.map((_, i) => (
            <span
              key={i}
              className={`dot ${i === active ? "active" : ""}`}
            />
          ))}
        </div>

        <div className="arrows">
          <button onClick={() => scrollBy(-1)}>
            <FaChevronLeft />
          </button>
          <button onClick={() => scrollBy(1)}>
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StorePage() {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  const params = useParams();
  const id = params.id;

  //Fetch store profile
  useEffect(() => {
    const fetchStore = async () => {
      const docRef = doc(DB, "profiles", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setStore(docSnap.data());
      }

      setLoading(false);
    };

    if (id) fetchStore();
  }, [id]);

  const isOpenNow = () => {
    if (!store?.working_hours) return false;

    const now = new Date();
    const currentDay = now.toLocaleDateString("en-US", { weekday: "long" });

    const today = store.working_hours.find(d => d.day === currentDay);

    if (!today || !today.isOpen) return false;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return currentMinutes >= today.open && currentMinutes <= today.close;
  };

  const daysMap = {
    Monday: "Lundi",
    Tuesday: "Mardi",
    Wednesday: "Mercredi",
    Thursday: "Jeudi",
    Friday: "Vendredi",
    Saturday: "Samedi",
    Sunday: "Dimanche",
  };

  if (loading) {
    return (
      <div className="loader">
        <ClipLoader size={15} color="#000"/>
      </div>
    );
  }

  if (!store) return <p className="loading">Not found</p>;

  const open = isOpenNow();

  const mapsUrl = store.location
    ? `https://www.google.com/maps?q=${store.location.latitude},${store.location.longitude}`
    : "#";

  return (
    <main className="page">

      {/* COVER */}
      <div className="cover">
        <img src={store.cover} />
        <div className="cover-gradient" />
      </div>

      {/* LOGO */}
      <div className="logo-wrapper">
        <img src={store.logo} />
      </div>

      {/* INFO */}
      <div className="info">
        <h2>{store.name}</h2>

        <div className="status-row">
          <span className={open ? "dot green" : "dot red"} />
          <span className="status-text">
            {open ? "OUVERT MAINTENANT" : "FERMÉ"}
          </span>
        </div>
        <p className="bio">{store.bio}</p>
      </div>

      {/* ACTIONS */}
      <div className="actions">
        <a
          href={`https://wa.me/${store.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn whatsapp"
        >
          <FaWhatsapp size={20}/> 
          <p>WhatsApp</p> 
        </a>

        <a
          href={`tel:${store.phone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn call"
        >
          <FaPhoneAlt size={16}/>
          <p>Appeler</p> 
        </a>
      </div>

      <div className="socials">
        {store.socials?.facebook && (
          <a 
            href={store.socials.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn"
          >
            <FiFacebook />
          </a>
        )}

        {store.socials?.instagram && (
          <a 
            href={store.socials.instagram} 
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn"
          >
            <FaInstagram />
          </a>
        )}

        {store.socials?.tiktop && (
          <a 
            href={store.socials.tiktop} 
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn"
          >
            <FaTiktok />
          </a>
        )}

        {store.location && (
          <a 
            href={mapsUrl} 
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn"
          >
            <IoLocationOutline />
          </a>
        )}
      </div>

      <div className="product-section">
        <h3>Produits & Services</h3>

        <ServicesSlider
          products={store.products || []}
          whatsapp={store.whatsapp}
        />
      </div>

      <div className="product-section">
        <h3>Horaires</h3>
        <div className="hours-card">
          <div className="hours-header">
            <FaClock className="hours-icon"/>
            <span>
              {open ? "Nous sommes ouverts aujourd’hui" : "Nous sommes fermés aujourd’hui"}
            </span>
          </div>

          {/* 🔥 LIST */}
          <div className="hours-list">
            {store.working_hours?.map((d, i) => {
              const today = new Date().toLocaleDateString("en-US", { weekday: "long" }) === d.day;

              return (
                <div
                  key={i}
                  className={`hour-row ${today ? "today" : ""}`}
                >
                  <span>{daysMap[d.day]}</span>
                  <span>
                    {d.isOpen
                      ? `${formatTime(d.open)} - ${formatTime(d.close)}`
                      : "Fermé"}
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      <div className="product-section">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="location-card"
        >
          <div className="location-left">
            <IoLocationOutline className="location-icon" />
            <div className="location-text">
              <span className="location-main">
                {store.address || "Voir la localisation"}
              </span>
            </div>
          </div>

          <FaChevronRight className="location-arrow" />
        </a>
      </div>
      
      <div className="profiles-footer">
        <div className="footer-card">
          <p className="footer-powered">
            Powered by
          </p>

          <h3 className="footer-title">
            SitePro Tunisie
          </h3>

          <p className="footer-desc">
            Créez votre carte visite digitale et attirez plus de clients facilement.
          </p>

          <a
            href="https://wa.me/21651510183"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-btn"
          >
            <FaWhatsapp size={20}/>
            Contactez-nous sur WhatsApp
          </a>

        </div>

        <p className="footer-copy">
          © {new Date().getFullYear()} SitePro Tunisie — All rights reserved
        </p>
      </div>


    </main>
  );
}

function formatTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}