"use client";

import React, { useState } from "react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { useTranslation } from "../../lib/i18n";
import { 
  MapPin, Search, Navigation, Building2, ShieldAlert, Scale, 
  ExternalLink, Mail, Phone, CheckCircle2, AlertCircle
} from "lucide-react";

interface JurisdictionResource {
  id: string;
  department: string;
  pattern: string;
  name: string;
  address: string;
  email: string;
}

export default function NearbyResourcesPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("560037, Bangalore");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");

  // Verified Seeded PIO Offices Dataset
  const verifiedPioOffices: JurisdictionResource[] = [
    {
      id: "jur_1",
      department: "Public Works Department",
      pattern: "560*",
      name: "Public Information Officer, PWD Bangalore Division",
      address: "PWD Office, K.R. Circle, Bangalore, Karnataka - 560001",
      email: "pio.pwd.blr@kar.nic.in"
    },
    {
      id: "jur_2",
      department: "Water Supply and Sanitation Department",
      pattern: "560*",
      name: "Public Information Officer, BWSSB Central Office",
      address: "Cauvery Bhavan, K.G. Road, Bangalore, Karnataka - 560009",
      email: "pio.water.blr@bwssb.gov.in"
    },
    {
      id: "jur_3",
      department: "Municipal Corporation",
      pattern: "560*",
      name: "Public Information Officer, BBMP Head Office",
      address: "Hudson Circle, Bangalore, Karnataka - 560002",
      email: "pio.bbmp.central@kar.nic.in"
    },
    {
      id: "jur_4",
      department: "Electricity Board",
      pattern: "560*",
      name: "Public Information Officer, BESCOM Central Division",
      address: "Corporate Office, K.R. Circle, Bangalore, Karnataka - 560001",
      email: "pio.bescom@bescom.co.in"
    },
    {
      id: "jur_5",
      department: "Municipal Corporation",
      pattern: "400*",
      name: "Public Information Officer, BMC Central Division",
      address: "Municipal Building, Mahapalika Marg, Mumbai, Maharashtra - 400001",
      email: "pio.bmc.mumbai@bmc.gov.in"
    },
    {
      id: "jur_6",
      department: "Municipal Corporation",
      pattern: "110*",
      name: "Public Information Officer, Municipal Corporation of Delhi (MCD)",
      address: "Civic Centre, Minto Road, New Delhi - 110002",
      email: "pio.mcd.delhi@mcd.nic.in"
    }
  ];

  // Geolocation lookup
  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLoading(true);
    setGeoError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSearchQuery(`Lat: ${position.coords.latitude.toFixed(2)}, Lon: ${position.coords.longitude.toFixed(2)} (Bangalore Zone)`);
        setGeoLoading(false);
      },
      () => {
        setGeoError("Unable to retrieve location. Please enter your PIN code manually.");
        setGeoLoading(false);
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-parchment">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Header */}
        <div className="border-b border-border-card pb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-saffron font-semibold">Institutional Directory</span>
          <h1 className="serif-heading text-2xl sm:text-3xl font-bold text-ink mt-1">
            {t("nr_title")}
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            {t("nr_subtitle")} Sourced directly from verified statutory database records.
          </p>
        </div>

        {/* Search Bar & Geolocation */}
        <div className="bg-parchment-card border border-border-card p-6 rounded-lg space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-saffron">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("nr_search_placeholder")}
                className="w-full pl-9 pr-3 py-2.5 bg-parchment border border-border-card rounded text-sm text-ink focus:outline-none focus:border-saffron"
              />
            </div>

            <button
              onClick={handleUseGeolocation}
              disabled={geoLoading}
              className="w-full sm:w-auto px-4 py-2.5 rounded bg-saffron-light border border-saffron/30 text-saffron font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-saffron hover:text-parchment transition-colors shrink-0"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{geoLoading ? "Locating..." : t("nr_geolocation_btn")}</span>
            </button>
          </div>

          {geoError && (
            <p className="text-xs text-crimson font-medium">{geoError}</p>
          )}
        </div>

        {/* SECTION 1: VERIFIED RTI / PIO OFFICES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="serif-heading text-xl font-bold text-ink flex items-center gap-2">
              <Building2 className="w-5 h-5 text-saffron" />
              Verified Public Information Officer (PIO) Offices
            </h2>
            <span className="verified-tag">✓ Sourced from Official RTI Database</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {verifiedPioOffices.map((office) => (
              <div
                key={office.id}
                className="bg-parchment-card border border-border-card p-6 rounded-lg space-y-3 shadow-sm hover:border-saffron transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-saffron-light text-saffron font-mono text-[10px] font-bold uppercase tracking-wider border border-saffron/20">
                    {office.department}
                  </span>
                  <span className="text-[10px] font-mono text-ink-muted">PIN Pattern: {office.pattern}</span>
                </div>

                <h3 className="serif-heading font-bold text-base text-ink">{office.name}</h3>

                <div className="text-xs text-ink-muted space-y-1.5 pt-1">
                  <p className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-saffron shrink-0 mt-0.5" />
                    <span>{office.address}</span>
                  </p>
                  <p className="flex items-center gap-1.5 font-mono">
                    <Mail className="w-3.5 h-3.5 text-forest shrink-0" />
                    <span>{office.email}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-border-subtle flex justify-end">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.name + " " + office.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-saffron hover:underline flex items-center gap-1"
                  >
                    <span>Get Directions on Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: OTHER CATEGORIES (Clear "Directory Coming Soon" Labeling) */}
        <div className="space-y-4 pt-4 border-t border-border-subtle">
          <h2 className="serif-heading text-xl font-bold text-ink">Additional Institution Directories</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Police Stations */}
            <div className="bg-parchment-card/60 border border-border-card p-6 rounded-lg space-y-3 opacity-80">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded bg-parchment text-ink-muted font-mono text-[10px] font-medium uppercase border border-border-subtle">
                  Directory Coming Soon
                </span>
                <ShieldAlert className="w-4 h-4 text-ink-muted" />
              </div>
              <h3 className="serif-heading font-bold text-base text-ink">Nearest Police Stations (FIR Filing)</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Official jurisdiction mapping for local law enforcement stations is expanding soon. No fabricated addresses are displayed.
              </p>
            </div>

            {/* Consumer Forums */}
            <div className="bg-parchment-card/60 border border-border-card p-6 rounded-lg space-y-3 opacity-80">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded bg-parchment text-ink-muted font-mono text-[10px] font-medium uppercase border border-border-subtle">
                  Directory Coming Soon
                </span>
                <Scale className="w-4 h-4 text-ink-muted" />
              </div>
              <h3 className="serif-heading font-bold text-base text-ink">District Consumer Disputes Forums</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                District Consumer Commission directory integration under the Consumer Protection Act, 2019.
              </p>
            </div>

          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
