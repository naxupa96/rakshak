import type { InputKind } from "@/types";

export interface DemoScenario {
  id: string;
  kind: InputKind;
  text: string;
  url?: string;
}

export const DEMOS: Record<string, DemoScenario> = {
  fake_investment: {
    id: "fake_investment",
    kind: "text",
    text: `SEBI APPROVED INVESTMENT OPPORTUNITY

Hello, this is Rohit from WealthGrow Capital, India's fastest growing investment club.

Guaranteed 24% monthly returns, 100% risk free. Your money doubles in 4 months.

Limited 20 seats only. Registration fee of ₹2,999 must be paid today to confirm your seat. Pay by UPI to wealthgrow@oki or call 9876543210.

Do not tell anyone else about this offer, it is only for selected people. Join our Telegram group for daily insider tips.

WealthGrow Capital - secure your family's future.`,
  },
  fake_sebi: {
    id: "fake_sebi",
    kind: "text",
    text: `Important notice: Our scheme is approved by SEBI, registration number INX1234.

Government backed investment plan under Ministry of Finance. SEBI approved our fixed return plan of 9% per month.

Verify on our official portal sebi-verify.in before offer ends today. Limited 15 slots remaining. Pay the processing charge of ₹2,500 to activate your account.

Guaranteed returns with zero risk. Invest now and do not delay.`,
  },
  guaranteed_whatsapp: {
    id: "guaranteed_whatsapp",
    kind: "text",
    text: `Forwarded many times

Guaranteed 8% monthly income with fixed return scheme. We have given 8% returns to all our investors for the last year. Risk free and double your money in 6 months.

Send ₹1,000 registration fee today to join. Limited 10 seats left. Message only on WhatsApp 9123456789. Hurry, last chance today only.`,
  },
  fake_broker: {
    id: "fake_broker",
    kind: "url",
    url: "https://india-trade-xyz.bond",
    text: `IndiaTradeX - open your demat account today

IndiaTradeX.com is registered and approved by SEBI and NSDL. Fixed 10% monthly profit on every trade, 100% safe and risk free.

Account opening charge of ₹15,000 must be transferred before we activate your login. This offer expires tonight, only 5 slots left. Share the OTP we send to your phone to complete verification.

Do not tell your family until you have received your first payout.`,
  },
  gujarati_scam: {
    id: "gujarati_scam",
    kind: "text",
    text: `નમસ્તે, અમારી યોજના સરકાર દ્વારા મંજૂર છે.

ગારંટીડ દર મહિને 10% વળતર, જોખમ વિના અને નિશ્ચિત નફો. 6 મહિનામાં પૈસા બમણા થશે.

આજે જ નોંધણી ફી ₹3,000 મોકલો, માત્ર 12 જગ્યા બાકી છે. જલ્દી કરો, ઓફર આજે રાત્રે પૂરી થશે.

કોઈને પણ આ વાત કહેશો નહીં, આ ફક્ત પસંદગીના લોકો માટે છે. વોટ્સએપ પર જ સંપર્ક કરો 9825012345.`,
  },
  educational: {
    id: "educational",
    kind: "text",
    text: `What investors should know about guaranteed returns

No market-linked investment can guarantee returns. When someone promises a fixed or guaranteed return, ask who is making that promise and what regulation covers it.

Check whether the person or firm appears in the list of registered intermediaries. A registration number that does not match the expected format is a warning sign.

Pressure tactics such as limited seats, urgency and secrecy are common in fraudulent offers. Take time, verify independently, and never share OTPs or passwords.

This is educational material and not investment advice.`,
  },
};

export const DEMO_IDS = Object.keys(DEMOS);
