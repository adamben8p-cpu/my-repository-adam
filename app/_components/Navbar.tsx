"use client";

import { useCommonStore } from "@/app/_store/commonStore";
import { Coffee, Coins } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { balance, setBalance, clearCommonState } = useCommonStore();

  const [displayValue, setDisplayValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const suffixes = ["", "k", "m", "b", "t", "q", "Q", "s", "S", "o", "n", "d"];

  const formatBalance = (num: number) => {
    if (!num) return "0";
    if (num < 1000) return num.toFixed(2);

    const exp = Math.floor(Math.log10(Math.abs(num)) / 3);
    const suffixIndex = Math.min(exp, suffixes.length - 1);
    const shortValue = num / Math.pow(1000, suffixIndex);

    return shortValue.toFixed(2).replace(/\.?0+$/, "") + suffixes[suffixIndex];
  };

  const handleInputChange = (val: string) => {
    setDisplayValue(val);

    // Allow empty while typing
    if (val.trim() === "") {
      setBalance(0);
      return;
    }

    // Allow: digits, optional single dot, optional letters at end
    if (!/^[0-9]*\.?[0-9]*[a-zA-Z]*$/.test(val)) return;

    const match = val.match(/^([0-9]*\.?[0-9]*)([a-zA-Z]*)$/);
    if (!match) return;

    const numberStr = match[1];
    const suffixPart = match[2].toLowerCase();

    if (numberStr === "" || numberStr === ".") return;

    const numberPart = parseFloat(numberStr);
    if (isNaN(numberPart)) return;

    let multiplier = 1;
    const index = suffixes.findIndex((s) => s.toLowerCase() === suffixPart);
    if (index !== -1) {
      multiplier = Math.pow(1000, index);
    }

    setBalance(numberPart * multiplier);
  };

  // Sync from global balance only when not actively editing
  useEffect(() => {
    if (!isEditing) {
      setDisplayValue(formatBalance(balance));
    }
  }, [balance, isEditing]);

  return (
    <nav className="backdrop-blur-md bg-black/30">
      <div className="max-w-7xl mx-auto px-4 py-2 sm:p-4">
        <div className="flex justify-between items-center h-12 sm:h-16">
          <Link href="/" className="flex items-center space-x-1 sm:space-x-2">
            <span className="text-lg sm:text-xl font-bold text-success">
              Fake
            </span>
            <img
              src="/assets/stake-logo.svg"
              alt="Logo"
              width={96}
              height={24}
              className="h-5 sm:h-6 w-auto"
            />
          </Link>

          <div className="flex gap-1 sm:gap-2">
            {balance <= 1 && (
              <div
                className="flex justify-center px-4 items-center underline cursor-pointer text-white"
                onClick={() => clearCommonState()}
              >
                Reset Credit ?
              </div>
            )}

            <div className="flex items-center gap-1 sm:gap-2 bg-gray-800/50 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-700 text-white focus-within:border-success transition-all">
              <input
                type="text"
                value={displayValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => setIsEditing(true)}
                onBlur={() => {
                  setIsEditing(false);
                  setDisplayValue(formatBalance(balance));
                }}
                className="bg-transparent text-base sm:text-lg font-medium w-20 sm:w-28 outline-none border-none text-white text-right"
                placeholder="0.00"
              />
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
            </div>

            <a
              href="https://www.buymeacoffee.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-success p-2 sm:p-4 rounded-full inline-flex items-center justify-center hover:bg-success/80 transition-colors"
            >
              <Coffee color="black" className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline text-black ml-2">
                Buy Me Coffee
              </span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
