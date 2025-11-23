// src/pages/Information.jsx (or News.jsx)
import React, { useEffect, useState, useMemo, useRef } from "react";
import MainLayout from "../layouts/MainLayout";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
} from "firebase/firestore";
import { FaTag, FaTimes, FaExternalLinkAlt, FaSearch } from "react-icons/fa";
import HERO_FALLBACK from "../assets/spu-building.jpg";
import AnimateSection from "../components/AnimatedSection";

export default function Information() {
  const [selectedNews, setSelectedNews] = useState(null);
  const [queryText, setQueryText] = useState("");
  const [activeTag, setActiveTag] = useState("ทั้งหมด");
  const [loading, setLoading] = useState(true);
  const [feed, setFeed] = useState([]);
  const modalRef = useRef(null);

  const formatDate = (isoOrDate) => {
    try {
      const d = isoOrDate ? new Date(isoOrDate) : new Date();
      return d.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const normalizeCreatedAt = (val) => {
    if (!val) return new Date().toISOString();
    try {
      if (typeof val === "object" && typeof val.toDate === "function") {
        return val.toDate().toISOString();
      }
      if (typeof val === "string") return val;
      if (val instanceof Date) return val.toISOString();
      return new Date(val).toISOString();
    } catch {
      return new Date().toISOString();
    }
  };

  function estimateReadTime(text) {
    try {
      const stripped = (text || "").replace(/<[^>]*>/g, "");
      const words = stripped.trim().split(/\s+/).filter(Boolean).length;
      const minutes = Math.max(1, Math.round(words / 200));
      return `${minutes} นาที`;
    } catch {
      return "1 นาที";
    }
  }

  function tagColorClass(tag) {
    const t = String(tag || "").toLowerCase();
    if (t.includes("โปรโมชั่น") || t.includes("promo"))
      return "bg-yellow-100 text-yellow-800";
    if (t.includes("กิจกรรม") || t.includes("activity"))
      return "bg-indigo-100 text-indigo-800";
    if (t.includes("บริการ") || t.includes("service"))
      return "bg-sky-100 text-sky-800";
    if (t.includes("ข่าวภายนอก") || t.includes("external"))
      return "bg-gray-100 text-gray-800";
    if (t.includes("ทั่วไป")) return "bg-green-50 text-green-800";
    return "bg-[#e6f7f8] text-[#006680]";
  }

  const getField = (data, keys, fallback = "") => {
    for (let k of keys) {
      if (data && typeof data[k] !== "undefined" && data[k] !== null) {
        return data[k];
      }
    }
    return fallback;
  };

  useEffect(() => {
    let mounted = true;

    const loadCollectionWithPublishedFallback = async ({
      colName,
      publishedOnly = true,
      orderField = "createdAt",
      limitCount = 50,
    }) => {
      try {
        if (publishedOnly) {
          try {
            const qPublished = query(
              collection(db, colName),
              where("published", "==", true),
              orderBy(orderField, "desc"),
              limit(limitCount)
            );
            const snap = await getDocs(qPublished);
            if (snap.size > 0) return snap.docs;
          } catch (err) {
            console.warn(
              `published query for ${colName} failed or empty, will fallback`,
              err
            );
          }
        }

        try {
          const qAll = query(
            collection(db, colName),
            orderBy(orderField, "desc"),
            limit(limitCount)
          );
          const snapAll = await getDocs(qAll);
          if (snapAll) return snapAll.docs;
        } catch (err) {
          const snapRaw = await getDocs(collection(db, colName));
          return snapRaw.docs;
        }
      } catch (err) {
        console.error("loadCollectionWithPublishedFallback error:", err);
      }
      return [];
    };

    const load = async () => {
      setLoading(true);
      try {
        const newsDocs = await loadCollectionWithPublishedFallback({
          colName: "news",
          publishedOnly: true,
          orderField: "createdAt",
          limitCount: 50,
        });

        const newsItems = newsDocs.map((d) => {
          const data = d.data();
          return {
            id: `news_${d.id}`,
            source: "internal",
            title: getField(data, ["title", "name"], "ไม่มีชื่อข่าว"),
            desc: getField(data, ["desc", "short", "summary"], ""),
            detail: getField(data, ["detail", "content", "description"], ""),
            image: getField(data, ["imageUrl", "image", "cover"], ""),
            tag: getField(data, ["tag", "category"], "ทั่วไป"),
            link: getField(data, ["link", "url"], ""),
            createdAt: normalizeCreatedAt(
              getField(data, ["createdAt", "created_at"], null)
            ),
          };
        });

        const promDocs = await loadCollectionWithPublishedFallback({
          colName: "promotions",
          publishedOnly: true,
          orderField: "createdAt",
          limitCount: 30,
        });

        const promItems = promDocs.map((d) => {
          const data = d.data();
          return {
            id: `promo_${d.id}`,
            source: "promotion",
            title: getField(data, ["name", "title"], "โปรโมชั่น"),
            desc: getField(data, ["description", "desc"], ""),
            detail: getField(data, ["detail", "description"], ""),
            image: getField(data, ["image", "imageUrl"], ""),
            tag: "โปรโมชั่น",
            link: getField(data, ["link", "url"], ""),
            createdAt: normalizeCreatedAt(
              getField(data, ["createdAt", "created_at"], null)
            ),
          };
        });

        const srvDocs = await loadCollectionWithPublishedFallback({
          colName: "services",
          publishedOnly: false,
          orderField: "createdAt",
          limitCount: 20,
        });

        const srvItems = srvDocs.map((d) => {
          const data = d.data();
          return {
            id: `service_${d.id}`,
            source: "service",
            title: getField(data, ["name", "title"], "บริการใหม่"),
            desc: getField(data, ["description", "desc"], ""),
            detail: getField(data, ["description", "detail"], ""),
            image: getField(data, ["image", "imageUrl"], ""),
            tag: getField(data, ["recommend"], false)
              ? "บริการแนะนำ"
              : "บริการ",
            link: getField(data, ["link", "url"], ""),
            createdAt: normalizeCreatedAt(
              getField(data, ["createdAt", "created_at"], null)
            ),
          };
        });

        let externalItems = [];
        const externalApi = import.meta.env.VITE_EXTERNAL_NEWS_API;
        if (externalApi) {
          try {
            const res = await fetch(externalApi);
            if (res.ok) {
              const json = await res.json();
              externalItems = (json.items || []).map((it, idx) => ({
                id: `ext_${idx}_${(it.link || "").slice(-6)}`,
                source: "external",
                title: it.title || "ข่าวภายนอก",
                desc: it.description || it.summary || "",
                detail: it.content || it.description || it.summary || "",
                image: it.image || "",
                tag: it.tag || it.category || "ข่าวภายนอก",
                link: it.link || "",
                createdAt: it.pubDate || new Date().toISOString(),
              }));
            }
          } catch (e) {
            console.warn("External feed fetch failed:", e);
          }
        }

        const merged = [
          ...newsItems,
          ...promItems,
          ...srvItems,
          ...externalItems,
        ].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        if (mounted) setFeed(merged);
      } catch (err) {
        console.error("load news error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const tags = useMemo(() => {
    const s = new Set(feed.map((f) => f.tag || "ทั่วไป"));
    return ["ทั้งหมด", ...Array.from(s)];
  }, [feed]);

  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    return feed.filter((n) => {
      const okTag = activeTag === "ทั้งหมด" ? true : n.tag === activeTag;
      const okQuery =
        !q ||
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.desc && n.desc.toLowerCase().includes(q)) ||
        (n.detail && n.detail.toLowerCase().includes(q));
      return okTag && okQuery;
    });
  }, [feed, queryText, activeTag]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSelectedNews(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (selectedNews) {
      setTimeout(() => modalRef.current?.focus?.(), 60);
    }
  }, [selectedNews]);

  return (
    <MainLayout>
      <AnimateSection className="relative">
        <img
          src={HERO_FALLBACK}
          alt="WHOCARE hero"
          className="w-full h-[300px] object-cover brightness-75"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#006680]/70 to-[#006680]/20 flex flex-col justify-center items-center text-white px-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-center">
            ข่าวและโปรโมชั่น WHOCARE
          </h1>
          <p className="mt-2 text-sm md:text-base max-w-2xl text-center text-sky-50">
            ติดตามข่าว กิจกรรม และโปรโมชั่นจากคลินิกเรา —
            ข้อมูลมาจากระบบของเราและแหล่งข่าวภายนอกที่เชื่อถือได้
          </p>
        </div>
      </AnimateSection>

      <AnimateSection className="max-w-6xl mx-auto px-6 mt-6">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <div className="flex items-center gap-3 bg-white border rounded-full px-3 py-2 shadow-sm w-full md:w-2/5">
            <FaSearch className="text-gray-400" />
            <input
              aria-label="ค้นหาข่าว"
              placeholder="ค้นหาข่าว/โปรโมชั่น..."
              className="w-full outline-none text-sm"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTag(t)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeTag === t
                    ? "bg-[#006680] text-white shadow-md"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-sky-50"
                }`}
              >
                <FaTag
                  className={activeTag === t ? "text-white" : "text-[#0289a7]"}
                />
                <span>{t}</span>
              </button>
            ))}
          </div>
        </div>
      </AnimateSection>

      <AnimateSection className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-16">กำลังโหลดข่าว...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            ไม่พบข่าวตามเงื่อนไข
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((n) => (
              <article
                key={n.id}
                className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition"
              >
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={n.image || HERO_FALLBACK}
                    alt={n.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 bg-[#006680] text-white text-xs px-3 py-1 rounded-full">
                    {n.tag}
                  </span>
                </div>
                <div className="p-4 flex flex-col h-full">
                  <h3 className="text-lg font-semibold text-[#006680] mb-2">
                    {n.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                    {n.desc}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-3">
                    <button
                      onClick={() => setSelectedNews(n)}
                      className="bg-[#006680] hover:bg-[#0289a7] text-white px-4 py-2 rounded-full text-sm"
                    >
                      อ่านเพิ่มเติม
                    </button>
                    <div className="text-xs text-gray-500">
                      {formatDate(n.createdAt)}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </AnimateSection>

      {selectedNews && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedNews(null)}
        >
          <div
            ref={modalRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="relative">
              <img
                src={selectedNews.image || HERO_FALLBACK}
                alt={selectedNews.title}
                className="w-full h-56 object-cover"
              />
              <button
                onClick={() => setSelectedNews(null)}
                aria-label="ปิด"
                className="absolute top-4 right-4 bg-white/70 hover:bg-white text-gray-700 rounded-full p-2 focus:outline-none"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-[#006680]">
                  {selectedNews.title}
                </h2>
                <span className="text-sm text-[#0289a7] font-medium">
                  {selectedNews.tag}
                </span>
              </div>

              <p className="mt-4 text-gray-700 leading-relaxed">
                {selectedNews.detail}
              </p>

              <div className="mt-6 flex gap-3">
                <a
                  href={selectedNews.link || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[#006680] hover:bg-[#0289a7] text-white px-4 py-2 rounded-full text-sm font-medium"
                >
                  ไปยังแหล่งข่าว <FaExternalLinkAlt />
                </a>
                <button
                  onClick={() => setSelectedNews(null)}
                  className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
