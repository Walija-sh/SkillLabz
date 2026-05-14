import React, { useMemo, useState } from "react";

export default function ContractView({
  rental,
  isRenter,
  onAgree,
  submitting = false,
  agreementError = ""
}) {
  const [agreed, setAgreed] = useState(false);
  const contract = rental?.contract || {};
  const canAgree = isRenter && rental?.rentalStatus === "approved" && !contract?.agreedAt;

  const baseLines = useMemo(
    () =>
      String(contract.baseTerms || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    [contract.baseTerms]
  );

  return (
    <div className="space-y-4">
      <section className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 mb-2">Rental Details</h3>
        <p className="text-sm text-gray-700">{rental?.item?.title || "Item unavailable"}</p>
        <p className="text-xs text-gray-500">
          {new Date(rental?.startDate).toLocaleDateString()} - {new Date(rental?.endDate).toLocaleDateString()}
        </p>
      </section>

      <section className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 mb-2">Payment & Deposit</h3>
        <p className="text-sm text-gray-700">Price/day: Rs. {rental?.pricePerDay || 0}</p>
        <p className="text-sm text-gray-700">Total: Rs. {rental?.totalPrice || 0}</p>
        <p className="text-sm text-gray-700">Deposit: Rs. {rental?.depositAmount || 0}</p>
      </section>

      <section className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 mb-2">Responsibilities & Rules</h3>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          {baseLines
            .filter((line) => line.startsWith("-"))
            .map((line, index) => (
              <li key={index}>{line.replace(/^-+\s*/, "")}</li>
            ))}
        </ul>
      </section>

      <section className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 mb-2">Additional Terms</h3>
        <p className="text-sm text-gray-700">
          {contract.additionalTerms || "No additional terms were added by owner."}
        </p>
      </section>

      {contract?.agreedAt ? (
        <p className="text-xs font-semibold text-green-700">
          Agreed on {new Date(contract.agreedAt).toLocaleString()} (immutable contract v{contract.version || 1})
        </p>
      ) : canAgree ? (
        <div className="space-y-2 border-t border-gray-100 pt-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            I agree to the terms
          </label>
          {agreementError ? <p className="text-xs text-red-600">{agreementError}</p> : null}
          <button
            type="button"
            disabled={!agreed || submitting}
            onClick={onAgree}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
          >
            {submitting ? "Confirming..." : "Confirm Contract"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
