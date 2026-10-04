"use client";

import React, { useState, useEffect } from "react";
import type { Lang, RiskAssessment } from "@/types";

interface AudioSafetyBriefingProps {
  score: number;
  level: RiskAssessment["level"];
  lang: Lang;
  suspectName?: string;
}

export function AudioSafetyBriefing({ score, level, lang, suspectName }: AudioSafetyBriefingProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);
    }
  }, []);

  const getBriefingText = (): { text: string; voiceLang: string } => {
    if (lang === "hi") {
      if (score >= 65) {
        return {
          text: `सावधान! रक्षक सुरक्षा विश्लेषण में यह संदेश उच्च जोखिम वाला पाया गया है। इसका जोखिम स्कोर ${score} है। सेबी या कोई भी अधिकृत ब्रोकर व्हाट्सएप अथवा टेलीग्राम पर पैसे नहीं मांगते। किसी भी अनधिकृत यूपीआई पर भुगतान न करें।`,
          voiceLang: "hi-IN",
        };
      }
      return {
        text: `रक्षक सुरक्षा विश्लेषण पूरा हुआ। यह संदेश मध्यम अथवा सामान्य स्थिति में है। फिर भी किसी भी अज्ञात लिंक पर भरोसा करने से पहले आधिकारिक सेबी पोर्टल पर पुष्टि अवश्य करें।`,
        voiceLang: "hi-IN",
      };
    }

    if (lang === "gu") {
      if (score >= 65) {
        return {
          text: `સાવધાન! રક્ષક સુરક્ષા વિશ્લેષણમાં આ સંદેશ અત્યંત શંકાસ્પદ જણાયો છે. જોખમ સ્કોર ${score} છે. સેબી કે કોઈ પણ અધિકૃત બ્રોકર વોટ્સએપ પર નાણાં માંગતા નથી. કોઈપણ અજાણી યુપીઆઈ આઈડી પર પૈસા ન ચૂકવશો.`,
          voiceLang: "gu-IN",
        };
      }
      return {
        text: `રક્ષક સુરક્ષા વિશ્લેષણ પૂર્ણ થયું. કોઈપણ અજાણી લિંક પર ક્લિક કરતા પહેલા સત્તાવાર સેબી પોર્ટલ પર ચકાસણી કરો.`,
        voiceLang: "gu-IN",
      };
    }

    // Default English
    if (score >= 65) {
      return {
        text: `Attention! Rakshak Threat Intelligence assessed this message as high risk, with a score of ${score} out of 100. Regulators like SEBI and legitimate brokers never solicit funds over WhatsApp or personal UPI accounts. Do not transfer funds or share any OTPs.`,
        voiceLang: "en-IN",
      };
    }
    return {
      text: `Rakshak security scan complete. Always verify financial intermediaries on official regulatory registries before making any investment commitments.`,
      voiceLang: "en-IN",
    };
  };

  const handleToggleAudio = () => {
    if (!isSupported) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const { text, voiceLang } = getBriefingText();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLang;
    utterance.rate = 0.95;

    // Try finding matching native voice if possible
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang.startsWith(voiceLang.split("-")[0]));
    if (matchedVoice) utterance.voice = matchedVoice;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) return null;

  return (
    <button
      onClick={handleToggleAudio}
      className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
        isPlaying
          ? "bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse"
          : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 hover:text-white"
      }`}
      title="Listen to Vernacular Audio Safety Briefing"
    >
      {isPlaying ? (
        <>
          <svg className="h-4 w-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
          <span>Stop Audio Alert</span>
        </>
      ) : (
        <>
          <svg className="h-4 w-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
          <span>Listen Safety Briefing ({lang.toUpperCase()})</span>
        </>
      )}
    </button>
  );
}
