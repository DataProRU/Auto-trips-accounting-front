import SelectField from "@/ui/select-field";
import React from "react";

interface TransferFormProps {
  formData: { wallet_from: string; wallet_to: string };
  wallets: { name: string; username: string }[];
  handleChange: (name: string, value: string) => void;
}

const TransferForm: React.FC<TransferFormProps> = ({
  formData,
  wallets,
  handleChange,
}) => {
  const walletOptions = wallets.map((w) => ({
    value: w.name,
    label: `${w.username}`,
  }));

  return (
    <div className="flex sm:flex-row gap-3 sm:gap-5 mb-3.5">
      <SelectField
        name="wallet_from"
        value={formData.wallet_from}
        options={walletOptions}
        placeholder="Кошелёк (откуда)"
        onChange={handleChange}
        required
        className="w-full text-sm text-black placeholder:text-gray-400 truncate"
      />
      <SelectField
        name="wallet_to"
        value={formData.wallet_to}
        options={walletOptions}
        placeholder="Кошелёк (куда)"
        onChange={handleChange}
        required
        className="w-full text-sm text-black placeholder:text-gray-400 truncate"
      />
    </div>
  );
};

export default TransferForm;
