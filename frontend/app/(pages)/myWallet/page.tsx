"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import CustomTitle from "@/components/CustomTitle";
import EditableTable from "./_components/EditableTable";

type WalletItem = {
  symbol: string;
  amount: number | "";
};

type CryptoSelectionItem = {
  symbol: string;
};

export default function MyWalletPage() {
  const router = useRouter();

  const [walletData, setWalletData] = useState<WalletItem[]>([]);
  const [newWalletItem, setNewWalletItem] = useState<Partial<WalletItem>>({ symbol: "", amount: "" });

  const [cryptoSelectionData, setCryptoSelectionData] = useState<CryptoSelectionItem[]>([]);
  const [newCryptoItem, setNewCryptoItem] = useState<Partial<CryptoSelectionItem>>({ symbol: "" });

  useEffect(() => {
    fetch("/api/myWallet")
      .then((res) => res.json())
      .then(setWalletData)
      .catch(() => setWalletData([]));

    fetch("/api/cryptoSelection")
      .then((res) => res.json())
      .then(setCryptoSelectionData)
      .catch(() => setCryptoSelectionData([]));
  }, []);

  async function saveWallet(data: WalletItem[]) {
    await fetch("/api/myWallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  async function saveCryptoSelection(data: CryptoSelectionItem[]) {
    await fetch("/api/cryptoSelection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  const handleEditWallet = (index: number, field: keyof WalletItem, value: string) => {
    const updated = walletData.map((item, i) =>
      i === index ? { ...item, [field]: field === "amount" ? Number(value) || 0 : value.toUpperCase() } : item
    );
    setWalletData(updated);
    saveWallet(updated);
  };

  const handleDeleteWallet = (index: number) => {
    const updated = walletData.filter((_, i) => i !== index);
    setWalletData(updated);
    saveWallet(updated);
  };

  const handleNewWalletChange = (field: keyof WalletItem, value: string) => {
    setNewWalletItem((prev) => ({
      ...prev, [field]: field === "amount" ? (value === "" ? "" : Number(value)) : value.toUpperCase(),
    }));
  };

  const handleAddWallet = () => {
    const symbol = (newWalletItem.symbol ?? "").trim().toUpperCase();
    const amount = Number(newWalletItem.amount ?? 0);

    if (!symbol || amount < 0) return;

    if (walletData.some((w) => w.symbol === symbol)) {
      alert("Le symbole existe déjà dans myWallet");
      return;
    }

    const updated = [...walletData, { symbol, amount }];
    setWalletData(updated);
    saveWallet(updated);
    setNewWalletItem({ symbol: "", amount: "" });
  };

  const handleEditCrypto = ( index: number, field: keyof CryptoSelectionItem, value: string) => {
    const updated = cryptoSelectionData.map((item, i) => i === index ? { ...item, [field]: value.toUpperCase() } : item);
    setCryptoSelectionData(updated);
    saveCryptoSelection(updated);
  };

  const handleDeleteCrypto = (index: number) => {
    const updated = cryptoSelectionData.filter((_, i) => i !== index);
    setCryptoSelectionData(updated);
    saveCryptoSelection(updated);
  };

  const handleNewCryptoChange = (field: keyof CryptoSelectionItem, value: string) => {
    setNewCryptoItem((prev) => ({ ...prev, [field]: value.toUpperCase() }));
  };

  const handleAddCrypto = () => {
    const symbol = (newCryptoItem.symbol ?? "").trim().toUpperCase();
    if (!symbol) return;
    if (cryptoSelectionData.some((c) => c.symbol === symbol)) {
      alert("Le symbole existe déjà dans cryptoSelection");
      return;
    }
    const updated = [...cryptoSelectionData, { symbol }];
    setCryptoSelectionData(updated);
    saveCryptoSelection(updated);
    setNewCryptoItem({ symbol: "" });
  };

  return (
    <Box sx={{ minHeight: "100vh", p: 3 }}>
      <CustomTitle
        title="GESTION DE MON WALLET"
        buttonLabel="Accueil"
        onButtonClick={() => router.push("/")}
      />

      <EditableTable<WalletItem>
        title="Mon wallet"
        data={walletData}
        newItem={newWalletItem}
        onEdit={handleEditWallet}
        onDelete={handleDeleteWallet}
        onAdd={handleAddWallet}
        onNewItemChange={handleNewWalletChange}
        columns={[
          { key: "symbol", label: "Symbole" },
          { key: "amount", label: "Montant", type: "number", width: "120px" },
        ]}
      />

      <EditableTable<CryptoSelectionItem>
        title="Liste des crypto"
        data={cryptoSelectionData}
        newItem={newCryptoItem}
        onEdit={handleEditCrypto}
        onDelete={handleDeleteCrypto}
        onAdd={handleAddCrypto}
        onNewItemChange={handleNewCryptoChange}
        columns={[{ key: "symbol", label: "Symbole" }]}
      />
    </Box>
  );
}
