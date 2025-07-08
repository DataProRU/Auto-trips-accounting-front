import React from "react";
import { useSelector } from "react-redux";
import SelectField from "@/ui/select-field";
import { selectWallets, createWalletOptions } from "@/store/selectors/walletSelectors";
import type { FormData } from "@/types/forms";

interface TransferFormProps {
  formData: { wallet_from: string; wallet_to: string };
  handleChange: (name: keyof FormData, value: string) => void;
  errors: Record<string, string>;
}

const TransferForm: React.FC<TransferFormProps> = ({
  formData,
  handleChange,
  errors,
}) => {
  const wallets = useSelector(selectWallets);
  const walletOptions = createWalletOptions(wallets);

  return (
    <div className="flex sm:flex-row gap-3 sm:gap-5 mb-3.5">
      <SelectField
        name="wallet_from"
        value={formData.wallet_from}
        options={walletOptions}
        placeholder="Кошелёк (откуда) *"
        onChange={handleChange}
        required
        error={errors.wallet_from}
        className="w-full text-sm text-black placeholder:text-gray-400 truncate"
      />
      <SelectField
        name="wallet_to"
        value={formData.wallet_to}
        options={walletOptions}
        placeholder="Кошелёк (куда) *"
        onChange={handleChange}
        required
        error={errors.wallet_to}
        className="w-full text-sm text-black placeholder:text-gray-400 truncate"
      />
    </div>
  );
};

export default TransferForm;
