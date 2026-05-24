import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

export default function ContractView({
  rental,
  isRenter,
  onAgree,
  submitting = false,
  agreementError = ""
}) {
  const [agreed, setAgreed] = useState(false);
  const contract = rental?.contract || {};
 
  

  const canAgree =
    isRenter &&
    rental?.rentalStatus === "approved" &&
    !contract?.agreedAt;
    
   
    
    
    
    
    
    

  useEffect(() => {
    setAgreed(false);
  }, [rental?._id]);

  const baseLines = useMemo(() => {
    return String(contract.baseTerms || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }, [contract.baseTerms]);

  const formattedStartDate = rental?.startDate
    ? new Date(rental.startDate).toLocaleDateString()
    : "-";

  const formattedEndDate = rental?.endDate
    ? new Date(rental.endDate).toLocaleDateString()
    : "-";

  const agreedDate = contract?.agreedAt
    ? new Date(contract.agreedAt).toLocaleString()
    : null;

  return (
    <div className="space-y-4">

      {/* Rental Details */}
      <section className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 mb-2">
          Rental Details
        </h3>

        <p className="text-sm text-gray-700">
          {rental?.item?.title || "Item unavailable"}
        </p>

        <p className="text-xs text-gray-500 mt-1">
          {formattedStartDate} - {formattedEndDate}
        </p>
      </section>

      {/* Payment */}
      <section className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 mb-2">
          Payment & Deposit
        </h3>

       <div className="space-y-1 text-sm text-gray-700">
  <p>Price/day: Rs. {rental?.pricePerDay || 0}</p>

  {Number(rental?.skillSessionPrice) > 0 && (
    <p>
      Skill Session: Rs. {rental.skillSessionPrice}
    </p>
  )}

  <p className="font-medium">
    Total: Rs. {rental?.totalPrice || 0}
  </p>

  <p>Deposit: Rs. {rental?.depositAmount || 0}</p>
</div>
      </section>

      {/* Rules */}
      <section className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 mb-2">
          Responsibilities & Rules
        </h3>

        {baseLines.length > 0 ? (
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            {baseLines.map((line, index) => (
              <li key={index}>
                {line.replace(/^-+\s*/, "")}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">
            No standard terms found.
          </p>
        )}
      </section>

      {/* Additional Terms */}
      <section className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 mb-2">
          Additional Terms
        </h3>

        <p className="text-sm text-gray-700 whitespace-pre-wrap">
          {contract.additionalTerms ||
            "No additional terms were added by owner."}
        </p>
      </section>

      {/* Agreement Status */}
      {contract?.agreedAt ? (
        <div className="border border-green-100 bg-green-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-green-700">
            Contract agreed on {agreedDate}
          </p>

          <p className="text-xs text-green-600 mt-1">
            Immutable contract version v{contract.version || 1}
          </p>
        </div>
      ) : canAgree ? (
        <div className="border-t border-gray-100 pt-4 space-y-4">

          {/* Checkbox */}
          <label className="flex items-start gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4"
            />

            <span>
              I confirm that I have read and agreed to all rental terms,
              responsibilities, deposit conditions, and return policies.
            </span>
          </label>

          {/* Error */}
          {agreementError ? (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl p-3">
              {agreementError}
            </div>
          ) : null}

          {/* Button */}
          <button
            type="button"
            disabled={!agreed || submitting}
            onClick={() => {
              if (!agreed) return;
              onAgree();
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Confirming Contract..." : "Agree & Confirm Contract"}
          </button>
        </div>
      ) : (
        <div className="border border-yellow-100 bg-yellow-50 rounded-xl p-4">
          <p className="text-sm text-yellow-700 font-medium">
           
          </p>
        </div>
      )}
    </div>
  );
}